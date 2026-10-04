/**
 * db.js
 * Gestion de la base de données locale (LocalStorage) pour l'application multi-agents GESTION DES PROJETS ET PROGRAMME DU MALI.
 */

const DB_KEY = 'pnud_multiagent_db_state';

// Structure initiale de test pour un projet type GESTION DES PROJETS ET PROGRAMME DU MALI : 
// "Projet d'Appui à la Transition Énergétique et au Développement Durable (PATEDD)"
const INITIAL_DATA = {
    project: {
        name: "Projet d'Appui à la Transition Énergétique et au Développement Durable (PATEDD)",
        code: "00123456",
        agency: "GESTION DES PROJETS ET PROGRAMME DU MALI / Ministère de l'Énergie",
        budget: 500000,
        currency: "USD",
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        specialist: {
            sector: "Non initialisé",
            title: "Spécialiste Sectoriel",
            avatar: "🧬",
            color: "#64748b",
            bio: "Cet agent s'adapte automatiquement à votre projet après analyse des TDR via API externe."
        }
    },
    activities: [
        { id: "act_1_1", code: "Act. 1.1", title: "Installation de mini-réseaux solaires dans 5 communes pilotes", output: "Produit 1 : Énergie Propre", status: "in_progress", quarter: "Q1", budget: 150000, spent: 120000, assignedTo: "Programme" },
        { id: "act_1_2", code: "Act. 1.2", title: "Formation technique de 20 électriciens communautaires (50% femmes)", output: "Produit 1 : Énergie Propre", status: "done", quarter: "Q1", budget: 30000, spent: 28500, assignedTo: "Programme" },
        { id: "act_2_1", code: "Act. 2.1", title: "Mise en place d'une ligne de micro-crédits pour l'entrepreneuriat vert", output: "Produit 2 : Inclusion Financière", status: "in_progress", quarter: "Q2", budget: 200000, spent: 85000, assignedTo: "Finances" },
        { id: "act_2_2", code: "Act. 2.2", title: "Accompagnement et structuration de 10 coopératives agricoles durables", output: "Produit 2 : Inclusion Financière", status: "todo", quarter: "Q3", budget: 60000, spent: 0, assignedTo: "Programme" },
        { id: "act_3_1", code: "Act. 3.1", title: "Évaluation finale d'impact social et environnemental du projet", output: "Produit 3 : Suivi & Gouvernance", status: "todo", quarter: "Q4", budget: 40000, spent: 0, assignedTo: "Suivi-Evaluation" }
    ],
    indicators: [
        { id: "ind_1", code: "Ind 1.1", name: "Taux d'accès à l'électricité renouvelable dans les communes pilotes", baseline: 5, target: 45, current: 28, unit: "%", outputId: "Produit 1", sdg: "ODD 7 - Énergie Propre", category: "Énergie", lastUpdated: "2026-06-15" },
        { id: "ind_2", code: "Ind 1.2", name: "Nombre de jeunes techniciens certifiés en installation solaire", baseline: 0, target: 20, current: 20, unit: "personnes", outputId: "Produit 1", sdg: "ODD 8 - Travail Décent", category: "Éducation", lastUpdated: "2026-04-02" },
        { id: "ind_3", code: "Ind 2.1", name: "Volume cumulé des micro-financements octroyés aux micro-entreprises vertes", baseline: 0, target: 150000, current: 75000, unit: "USD", outputId: "Produit 2", sdg: "ODD 1 - Pas de Pauvreté", category: "Finance", lastUpdated: "2026-07-10" },
        { id: "ind_4", code: "Ind 2.2", name: "Pourcentage de femmes membres des comités de gestion des coopératives", baseline: 12, target: 40, current: 30, unit: "%", outputId: "Produit 2", sdg: "ODD 5 - Égalité des Sexes", category: "Genre", lastUpdated: "2026-07-20" }
    ],
    financials: [
        { id: "tx_1", date: "2026-01-20", activityId: "act_1_1", description: "Achat de panneaux photovoltaïques et batteries - Lot 1", amount: 80000, type: "expense", status: "approved", loggedBy: "Comptable" },
        { id: "tx_2", date: "2026-02-14", activityId: "act_1_1", description: "Frais logistiques de transport de matériel solaire vers les communes", amount: 40000, type: "expense", status: "approved", loggedBy: "Comptable" },
        { id: "tx_3", date: "2026-03-01", activityId: "act_1_2", description: "Paiement du cabinet de formation en électricité photovoltaïque", amount: 22000, type: "expense", status: "approved", loggedBy: "Comptable" },
        { id: "tx_4", date: "2026-03-25", activityId: "act_1_2", description: "Achat de kits d'outillage pour les électriciens certifiés", amount: 6500, type: "expense", status: "approved", loggedBy: "Comptable" },
        { id: "tx_5", date: "2026-05-10", activityId: "act_2_1", description: "Première tranche du fonds de garantie de micro-crédits de la banque locale", amount: 85000, type: "expense", status: "approved", loggedBy: "Comptable" },
        { id: "tx_6", date: "2026-07-15", activityId: "act_2_1", description: "Frais d'évaluation technique préalable des demandes de crédit", amount: 1200, type: "expense", status: "pending", loggedBy: "Comptable" }
    ],
    emails: [
        { id: "mail_1", date: "2026-07-15T09:12:00Z", from: "Chef de Projet", to: "Agent Financier", subject: "Revue budgétaire du Q2 et préparation du Comité de Pilotage", content: "Bonjour, nous devons consolider les chiffres du Q2. Pouvez-vous préparer le rapport financier global et le taux de livraison ? Merci.", read: true },
        { id: "mail_2", date: "2026-07-16T14:35:00Z", from: "Agent Suivi-Évaluation", to: "Chef de Projet", subject: "Retard potentiel de collecte des données - Indicateur 2.2 (Coopératives)", content: "Bonjour, les données de terrain concernant le pourcentage de femmes dans la gestion des coopératives n'ont pas été entièrement reçues pour la zone Nord. Je propose d'organiser une mission de collecte d'urgence.", read: true },
        { id: "mail_3", date: "2026-07-20T10:00:00Z", from: "Agent Financier", to: "Chef de Projet", subject: "Bilan Provisoire Q2 - Delivery Rate stable", content: "Bonjour. J'ai calculé le Delivery Rate pour le Q2. Nous sommes à environ 46.7% d'exécution financière du budget annuel total engagé. Les détails sont disponibles dans la base de données.", read: false }
    ],
    calendar: [
        { id: "cal_1", date: "2026-07-25", title: "Comité de Pilotage Semestriel", description: "Présentation des résultats aux ministères et bailleurs de fonds.", type: "meeting" },
        { id: "cal_2", date: "2026-08-05", title: "Mission d'évaluation technique de terrain", description: "Visite de contrôle des installations solaires par l'Agent M&E.", type: "mission" },
        { id: "cal_3", date: "2026-08-20", title: "Audit Financier Annuel Obligatoire", description: "Contrôle des pièces comptables et conformité de la GESTION DES PROJETS ET PROGRAMME DU MALI.", type: "audit" }
    ],
    documents: [
        { id: "doc_1", date: "2026-01-10", name: "Prodoc_PATEDD_Signe.pdf", type: "Prodoc", size: "2.4 MB", uploadedBy: "Chef de Projet" },
        { id: "doc_2", date: "2026-02-15", name: "TDR_Formation_Electriciens_V3.pdf", type: "TDR", size: "450 KB", uploadedBy: "Programme" }
    ],
    logs: [
        { id: "log_1", timestamp: "2026-07-21T18:00:00Z", category: "SYSTEM", text: "Base de données initialisée avec succès dans le LocalStorage." },
        { id: "log_2", timestamp: "2026-07-21T18:05:00Z", category: "Chef de Projet", text: "Vérification de la conformité du plan de travail annuel avec le Prodoc." }
    ]
};

// Variables globales pour le mode hybride
window.USE_BACKEND = false;
window.STATE_CACHE = null;

// Détecter si le serveur backend est actif
async function checkBackendConnection() {
    try {
        const res = await fetch('/api/state');
        if (res.ok) {
            const data = await res.json();
            window.USE_BACKEND = true;
            console.log("[DB] Connexion backend établie. Mode Full-Stack actif.");
            
            if (data.status === 'empty') {
                window.STATE_CACHE = JSON.parse(JSON.stringify(INITIAL_DATA));
                await fetch('/api/state', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(INITIAL_DATA)
                });
                console.log("[DB] Fichier database.json initialisé sur le serveur.");
            } else {
                window.STATE_CACHE = data;
                console.log("[DB] Base de données chargée depuis le serveur.");
            }
            
            // Re-rendre l'application si elle est déjà initialisée
            if (window.app && window.app.renderAll) {
                window.app.renderAll();
            }
        }
    } catch (err) {
        console.log("[DB] Backend déconnecté. Passage en mode LocalStorage.");
    }
}

checkBackendConnection();

// Initialisation globale de la DB
function initDatabase() {
    if (!localStorage.getItem(DB_KEY)) {
        resetDatabase();
    }
}

// Réinitialisation de la DB avec les données par défaut
function resetDatabase() {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
    if (window.USE_BACKEND) {
        window.STATE_CACHE = JSON.parse(JSON.stringify(INITIAL_DATA));
        fetch('/api/state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(INITIAL_DATA)
        }).catch(err => console.error("[DB] Échec du reset sur le serveur:", err));
    }
    logEvent("SYSTEM", "Base de données réinitialisée aux valeurs d'usine de la GESTION DES PROJETS ET PROGRAMME DU MALI.");
}

// Lecture globale de l'état
function getDbState() {
    if (window.USE_BACKEND && window.STATE_CACHE) {
        return window.STATE_CACHE;
    }
    initDatabase();
    try {
        return JSON.parse(localStorage.getItem(DB_KEY));
    } catch (e) {
        console.error("Erreur de lecture de LocalStorage, réinitialisation...", e);
        resetDatabase();
        return INITIAL_DATA;
    }
}

// Sauvegarde globale de l'état
function saveDbState(state) {
    if (window.USE_BACKEND) {
        window.STATE_CACHE = state;
        fetch('/api/state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state)
        }).catch(err => console.error("[DB] Échec de l'écriture serveur:", err));
    }
    localStorage.setItem(DB_KEY, JSON.stringify(state));
}

// Ajouter une ligne de log
function logEvent(category, text) {
    const state = getDbState();
    const newLog = {
        id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString(),
        category: category,
        text: text
    };
    state.logs.unshift(newLog);
    // Garder seulement les 200 derniers logs pour éviter la saturation du localStorage
    if (state.logs.length > 200) {
        state.logs = state.logs.slice(0, 200);
    }
    saveDbState(state);
    
    // Dispatch d'un événement global pour l'UI
    window.dispatchEvent(new CustomEvent('db-log-added', { detail: newLog }));
}

// --- Fonctions utilitaires CRUD pour l'application ---

// Activités
function getActivities() {
    return getDbState().activities;
}

function updateActivity(activityId, updates) {
    const state = getDbState();
    const index = state.activities.findIndex(a => a.id === activityId);
    if (index !== -1) {
        state.activities[index] = { ...state.activities[index], ...updates };
        saveDbState(state);
        logEvent("DATABASE", `Activité ${state.activities[index].code} mise à jour par l'agent.`);
        return state.activities[index];
    }
    return null;
}

function addActivity(activity) {
    const state = getDbState();
    const newActivity = {
        id: "act_" + Date.now(),
        code: `Act. ${state.activities.length + 1}`,
        status: "todo",
        spent: 0,
        ...activity
    };
    state.activities.push(newActivity);
    saveDbState(state);
    logEvent("DATABASE", `Nouvelle activité créée : ${newActivity.code} - ${newActivity.title}`);
    return newActivity;
}

// Indicateurs
function getIndicators() {
    return getDbState().indicators;
}

function updateIndicator(indicatorId, value, agentName = "Suivi-Evaluation") {
    const state = getDbState();
    const index = state.indicators.findIndex(i => i.id === indicatorId);
    if (index !== -1) {
        const ind = state.indicators[index];
        const oldVal = ind.current;
        ind.current = Number(value);
        ind.lastUpdated = new Date().toISOString().split('T')[0];
        saveDbState(state);
        logEvent(agentName, `Indicateur ${ind.code} mis à jour : ${oldVal} ${ind.unit} -> ${value} ${ind.unit}`);
        return ind;
    }
    return null;
}

// Finances
function getTransactions() {
    return getDbState().financials;
}

function addTransaction(tx) {
    const state = getDbState();
    const newTx = {
        id: "tx_" + Date.now(),
        date: new Date().toISOString().split('T')[0],
        status: "approved",
        ...tx
    };
    state.financials.push(newTx);
    
    // Mettre à jour automatiquement le "spent" de l'activité liée si approuvé
    if (newTx.status === "approved" && newTx.activityId) {
        const actIndex = state.activities.findIndex(a => a.id === newTx.activityId);
        if (actIndex !== -1) {
            state.activities[actIndex].spent += Number(newTx.amount);
        }
    }
    
    saveDbState(state);
    logEvent("Comptable", `Transaction financière enregistrée : ${newTx.description} (${newTx.amount} USD)`);
    return newTx;
}

// Emails
function getEmails() {
    return getDbState().emails;
}

function sendEmail(email) {
    const state = getDbState();
    const newEmail = {
        id: "mail_" + Date.now(),
        date: new Date().toISOString(),
        read: false,
        ...email
    };
    state.emails.unshift(newEmail);
    saveDbState(state);
    logEvent(newEmail.from, `E-mail envoyé à ${newEmail.to} : "${newEmail.subject}"`);
    return newEmail;
}

// Calendrier
function getCalendarEvents() {
    return getDbState().calendar;
}

function addCalendarEvent(event) {
    const state = getDbState();
    const newEvent = {
        id: "cal_" + Date.now(),
        ...event
    };
    state.calendar.push(newEvent);
    saveDbState(state);
    logEvent("Gestion de Projet", `Événement planifié : ${newEvent.title} le ${newEvent.date}`);
    return newEvent;
}

// Documents
function getDocuments() {
    return getDbState().documents;
}

function addDocument(doc) {
    const state = getDbState();
    const newDoc = {
        id: "doc_" + Date.now(),
        date: new Date().toISOString().split('T')[0],
        ...doc
    };
    state.documents.unshift(newDoc);
    saveDbState(state);
    logEvent("SYSTEM", `Document déposé : ${newDoc.name} (${newDoc.size})`);
    return newDoc;
}

// Spécialiste Sectoriel
function getSpecialistAgent() {
    return getDbState().project.specialist;
}

function updateSpecialistAgent(updates) {
    const state = getDbState();
    state.project.specialist = { ...state.project.specialist, ...updates };
    saveDbState(state);
    logEvent("SYSTEM", `Profil de l'Agent Spécialiste Dynamique mis à jour : ${state.project.specialist.title}`);
    return state.project.specialist;
}

// Exportation des fonctions sur l'objet window pour les rendre disponibles globalement
window.UNDP_DB = {
    initDatabase,
    resetDatabase,
    getDbState,
    saveDbState,
    logEvent,
    getActivities,
    updateActivity,
    addActivity,
    getIndicators,
    updateIndicator,
    getTransactions,
    addTransaction,
    getEmails,
    sendEmail,
    getCalendarEvents,
    addCalendarEvent,
    getDocuments,
    addDocument,
    getSpecialistAgent,
    updateSpecialistAgent
};
