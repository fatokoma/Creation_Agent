const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir les fichiers statiques de l'application (HTML/CSS/JS) depuis la racine
app.use(express.static(__dirname));

// Fichier de stockage centralisé
const DB_PATH = path.join(__dirname, 'database.json');

// --- Endpoints Persistance Base de Données ---

// Récupérer l'état de la base de données
app.get('/api/state', (req, res) => {
    if (fs.existsSync(DB_PATH)) {
        try {
            const data = fs.readFileSync(DB_PATH, 'utf8');
            return res.json(JSON.parse(data));
        } catch (err) {
            return res.status(500).json({ error: "Erreur lors de la lecture du fichier de base de données." });
        }
    }
    // Si le fichier n'existe pas encore (première exécution)
    return res.json({ status: 'empty' });
});

// Sauvegarder l'état de la base de données
app.post('/api/state', (req, res) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(req.body, null, 2), 'utf8');
        return res.json({ status: 'success' });
    } catch (err) {
        return res.status(500).json({ error: "Erreur lors de l'écriture dans le fichier de base de données." });
    }
});

// --- Endpoints d'IA Générative (Google Gemini) ---

// Analyse sémantique réelle de TDR par Gemini
app.post('/api/analyze-tdr', async (req, res) => {
    const { tdrText } = req.body;
    if (!tdrText) {
        return res.status(400).json({ error: "Le texte du TDR est requis." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("[API Warn] GEMINI_API_KEY non configurée dans le fichier .env. Utilisation de l'analyseur local.");
        return res.json({ error: "apiKey_missing" });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        Tu es un expert en gestion de projets et de programmes de développement au Mali.
        Analyse ce document de Termes de Référence (TDR) brut pour en extraire les informations requises.
        
        Identifie d'abord la thématique sectorielle principale parmi ces choix uniques :
        1. "Environnement & Énergie" (si cela concerne le soleil, l'électricité solaire, le climat, les arbres, etc.)
        2. "Agriculture & Développement Rural" (si cela concerne l'élevage, la culture, l'irrigation, les coopératives rurales)
        3. "Genre & Développement Social" (si cela concerne les groupements de femmes, la parité, l'égalité des sexes)
        4. "Santé & Hygiène Communautaire" (si cela concerne l'eau potable, les dispensaires, l'hygiène, les cliniques)
        
        Extrais également le titre synthétique de l'activité, le budget prévisionnel en USD (un entier uniquement), et le trimestre cible (uniquement "Q1", "Q2", "Q3" ou "Q4").
        Rédige enfin une recommandation technique sectorielle courte (1 phrase d'expert).

        Réponds EXCLUSIVEMENT sous la forme d'un objet JSON valide contenant exactement ces clés. Ne mets aucun texte avant ou après, pas de balise markdown, juste le JSON brut :
        {
          "sector": "Secteur identifié",
          "title": "Titre synthétique",
          "budget": 15000,
          "quarter": "Qx",
          "recommendation": "Ta recommandation d'expert ici..."
        }
        
        TDR à analyser :
        ${tdrText}
        `;

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();

        // Nettoyer les balises Markdown si Gemini en a ajouté malgré les instructions
        text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

        const jsonRes = JSON.parse(text);
        return res.json(jsonRes);
    } catch (err) {
        console.error("Erreur API Gemini (TDR):", err);
        return res.status(500).json({ error: "Échec de l'appel API Gemini : " + err.message });
    }
});

// Dialogue et coordination croisée multi-agents avec Gemini
app.post('/api/chat', async (req, res) => {
    const { message, history, currentSector } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Le message de l'utilisateur est requis." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.json({ error: "apiKey_missing" });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        Tu es une équipe de coordination multi-agents de la GESTION DES PROJETS ET PROGRAMME DU MALI.
        Les agents de l'équipe sont :
        - PM : Chef de projet, coordonnateur général axé sur la gestion par résultats (avatar: 👔).
        - ME : Spécialiste Suivi-Évaluation et statistiques de terrain (avatar: 📊).
        - PROG : Chargé de programme et d'assurance qualité du plan de travail annuel AWP (avatar: 📋).
        - ACCT : Comptable certifié IPSAS (avatar: 🧮).
        - FIN : Analyste financier (budget global, Delivery Rate, rapport CDR) (avatar: 📈).
        - SPEC : Expert technique sectoriel de l'équipe (son domaine actuel est: ${currentSector || 'Développement Local'}, avatar: 🧬).

        L'utilisateur (Directeur National) a envoyé ce message dans le canal : "${message}"

        Historique récent du chat :
        ${JSON.stringify(history.slice(-6))}

        Simule un échange de messages de coordination interactif et croisé entre ces agents pour répondre à l'utilisateur. 
        Chaque agent qui intervient doit s'exprimer brièvement (2 à 3 phrases maximum sous un angle professionnel propre à son rôle). Tout le monde n'est pas obligé de parler, mais au moins 3 agents pertinents doivent intervenir, se répondant mutuellement et aboutissant à une conclusion claire par le PM.
        
        Si l'utilisateur demande une "réunion", un "alignement" ou une "discussion inter-agents", fais-les dialoguer sur le démarrage des activités du trimestre.
        Si l'utilisateur demande un "bilan financier" ou parle d'argent, fais intervenir en priorité FIN, ACCT et PM.
        Si l'utilisateur demande des "statistiques" ou des "données", fais intervenir ME et PROG.

        Réponds EXCLUSIVEMENT sous la forme d'un tableau JSON valide d'objets représentants chaque étape du dialogue. Ne mets aucun texte d'introduction, pas de balise markdown, juste le JSON brut :
        [
          {
            "agent": "PM ou ME ou PROG ou ACCT ou FIN ou SPEC",
            "thought": "La réflexion stratégique interne de l'agent en 1 phrase (ex: Je dois valider l'impact budgétaire)",
            "message": "Le message adressé dans le canal de discussion"
          },
          ...
        ]
        `;

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();

        // Nettoyer les balises Markdown
        text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

        const jsonRes = JSON.parse(text);
        return res.json(jsonRes);
    } catch (err) {
        console.error("Erreur API Gemini (Chat):", err);
        return res.status(500).json({ error: "Échec de la simulation IA : " + err.message });
    }
});

// Démarrer le serveur avec détection de port libre (Dynamic Port Scanning)
function startServer(port) {
    const server = app.listen(port, () => {
        console.log(`================================================================`);
        console.log(`🚀 Serveur GESTION DES PROJETS ET PROGRAMME DU MALI démarré !`);
        console.log(`👉 URL de l'application : http://localhost:${port}`);
        console.log(`📁 Fichier de données persisté : ${DB_PATH}`);
        console.log(`⚙️  Statut Clé API Gemini : ${process.env.GEMINI_API_KEY ? 'CONFIGURÉE (IA Réelle active)' : 'NON CONFIGURÉE (Mode Simulation Actif)'}`);
        console.log(`================================================================`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`[Port Occupé] Le port ${port} est déjà utilisé. Tentative sur le port ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error("Erreur critique du serveur :", err);
        }
    });
}

startServer(PORT);
