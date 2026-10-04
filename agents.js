/**
 * agents.js
 * Définition des agents de la GESTION DES PROJETS ET PROGRAMME DU MALI et moteur de simulation de coordination pour le projet.
 */

// Liste des agents avec leurs profils et couleurs
const AGENTS = {
    PM: {
        id: "PM",
        name: "Chef de Projet (PM)",
        role: "Coordonnateur de Projet",
        color: "#6366f1", // Indigo
        avatar: "👔",
        bio: "Expert en gestion axée sur les résultats (GAR) avec 15 ans d'expérience au sein de la GESTION DES PROJETS ET PROGRAMME DU MALI. Coordonne les livrables du projet et valide les rapports institutionnels."
    },
    ME: {
        id: "ME",
        name: "Agent Suivi-Évaluation (M&E)",
        role: "Spécialiste Suivi-Évaluation & Statistiques",
        color: "#f43f5e", // Rose/Rouge
        avatar: "📊",
        bio: "Statisticien de formation, expert en collecte de données de terrain, analyses quantitatives et calcul d'impact des ODD."
    },
    PROG: {
        id: "PROG",
        name: "Agent Programme",
        role: "Spécialiste de Programme & Assurance Qualité",
        color: "#06b6d4", // Cyan
        avatar: "📋",
        bio: "Responsable de la planification opérationnelle (AWP), de la mise en œuvre des activités et du respect des procédures d'assurance qualité de la GESTION DES PROJETS ET PROGRAMME DU MALI."
    },
    ACCT: {
        id: "ACCT",
        name: "Agent Comptable",
        role: "Associé aux Finances",
        color: "#f59e0b", // Ambre
        avatar: "🧮",
        bio: "Gère la saisie quotidienne des dépenses, la vérification des factures et des pièces justificatives conformément aux normes IPSAS."
    },
    FIN: {
        id: "FIN",
        name: "Agent Financier",
        role: "Chargé des Finances et Opérations",
        color: "#10b981", // Émeraude
        avatar: "📈",
        bio: "Analyse la performance budgétaire, prépare le Rapport Financier Combiné (CDR) et calcule les taux d'exécution financière (Delivery Rates)."
    },
    SPEC: {
        id: "SPEC",
        name: "Spécialiste Sectoriel",
        role: "Expert Sectoriel (IA)",
        color: "#64748b",
        avatar: "🧬",
        bio: "S'adapte dynamiquement après analyse des TDR via API externe."
    }
};

function updateAgentSPECFromDb() {
    if (window.UNDP_DB && window.UNDP_DB.getSpecialistAgent) {
        const dbSpec = window.UNDP_DB.getSpecialistAgent();
        if (dbSpec && dbSpec.sector !== "Non initialisé") {
            AGENTS.SPEC.name = dbSpec.title;
            AGENTS.SPEC.role = `Expert en ${dbSpec.sector}`;
            AGENTS.SPEC.avatar = dbSpec.avatar;
            AGENTS.SPEC.color = dbSpec.color;
            AGENTS.SPEC.bio = dbSpec.bio;
        }
    }
}

// Fonction de simulation d'analyse sémantique externe (httpbin.org)
async function analyzeTDRWithExternalAPI(tdrText) {
    const logEvent = window.UNDP_DB.logEvent;
    logEvent("SYSTEM", "Connexion à l'API d'Analyse NLP Mali-Projets (httpbin.org/post)...");
    
    try {
        const response = await fetch("https://httpbin.org/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: tdrText, analyze: "sector_and_indicators" })
        });
        
        if (!response.ok) throw new Error("API HTTP Error: " + response.status);
        await response.json();
        
        const text = tdrText.toLowerCase();
        let sector = "Développement Local";
        let title = "Spécialiste en Développement Local";
        let avatar = "🏢";
        let color = "#64748b";
        let bio = "Analyse l'impact communautaire et l'autonomie des communes.";
        let sdg = "ODD 11 - Villes et Communautés Durables";
        let recommendation = "Renforcer l'autonomie financière locale et la gouvernance décentralisée.";
        
        if (text.includes("environn") || text.includes("soleil") || text.includes("solair") || text.includes("énergi") || text.includes("climat") || text.includes("photovol")) {
            sector = "Environnement & Énergie";
            title = "Spécialiste en Environnement & Énergie";
            avatar = "🌿";
            color = "#22c55e";
            bio = "Expert en énergies propres, réduction d'empreinte carbone et adaptation au climat.";
            sdg = "ODD 7 - Énergie Propre / ODD 13 - Climat";
            recommendation = "Mettre en place des plans d'atténuation d'impact écologique pour les mini-réseaux et le recyclage des batteries.";
        } else if (text.includes("agri") || text.includes("coopérativ") || text.includes("cultur") || text.includes("sol") || text.includes("rural") || text.includes("maraîch")) {
            sector = "Agriculture & Développement Rural";
            title = "Expert Agro-économiste";
            avatar = "🚜";
            color = "#eab308";
            bio = "Expert en chaînes de valeur agricoles, résilience des sols et économie rurale coopérative.";
            sdg = "ODD 2 - Faim Zéro / ODD 15 - Vie Terrestre";
            recommendation = "Intégrer des systèmes de micro-irrigation solaire pour sécuriser la productivité agricole contre les sécheresses.";
        } else if (text.includes("femm") || text.includes("genr") || text.includes("inclusi") || text.includes("équal") || text.includes("egal")) {
            sector = "Genre & Développement Social";
            title = "Spécialiste Genre & Inclusion";
            avatar = "♀";
            color = "#ec4899";
            bio = "Experte en parité, autonomisation des femmes et inclusion sociale dans les projets publics.";
            sdg = "ODD 5 - Égalité des Sexes";
            recommendation = "Imposer un quota obligatoire de 45% de femmes dans les comités de décision locaux.";
        } else if (text.includes("sant") || text.includes("malad") || text.includes("cliniqu") || text.includes("hygi") || text.includes("eau")) {
            sector = "Santé & Hygiène Communautaire";
            title = "Spécialiste en Santé Publique";
            avatar = "🏥";
            color = "#ef4444";
            bio = "Expert en infrastructures sanitaires, accès à l'eau potable et éducation à la santé.";
            sdg = "ODD 3 - Bonne Santé et Bien-être";
            recommendation = "Coupler l'électrification solaire avec des systèmes de réfrigération de vaccins médicaux.";
        }

        logEvent("SYSTEM", `API Réponse: Secteur détecté "${sector}" | Profil configuré : ${title}`);

        const updated = window.UNDP_DB.updateSpecialistAgent({
            sector: sector,
            title: title,
            avatar: avatar,
            color: color,
            bio: bio,
            sdg: sdg,
            recommendation: recommendation
        });

        updateAgentSPECFromDb();
        return updated;
    } catch (err) {
        logEvent("SYSTEM", `Échec de connexion à l'API (${err.message}). Utilisation du fallback local.`);
        return {
            sector: "Développement Local",
            title: "Spécialiste en Développement Local",
            avatar: "🏢",
            color: "#64748b",
            bio: "Analyse l'impact communautaire et l'autonomie des communes."
        };
    }
}

// --- Moteur d'Analyse Documentaire (TDR et CSV) ---

// Analyse un document TDR (Termes de Référence) pour en extraire des activités et budgets
function analyzeTDR(tdrText) {
    const logEvent = window.UNDP_DB.logEvent;
    logEvent("Programme", "Lancement de l'analyse automatique des Termes de Référence (TDR)...");
    
    // Expressions régulières simples pour extraire des infos
    const budgetRegex = /(?:budget|coût|montant|financement)\s*(?:de|est\s*de|estimé\s*à)?\s*([0-9\s]+)\s*(?:\$|usd|dollars)/i;
    const trimRegex = /(?:trimestre|q[1-4]|t[1-4])/i;
    const titleRegex = /(?:titre|objectif|atelier|formation|achat|réalisation|mise en place)\s*:\s*([^\n\.]+)/i;

    let budget = 15000; // valeur par défaut
    const budgetMatch = tdrText.match(budgetRegex);
    if (budgetMatch) {
        budget = parseInt(budgetMatch[1].replace(/\s/g, ''));
    }

    let quarter = "Q3"; // défaut
    const trimMatch = tdrText.match(trimRegex);
    if (trimMatch) {
        const text = trimMatch[0].toLowerCase();
        if (text.includes("1") || text.includes("q1") || text.includes("t1")) quarter = "Q1";
        else if (text.includes("2") || text.includes("q2") || text.includes("t2")) quarter = "Q2";
        else if (text.includes("3") || text.includes("q3") || text.includes("t3")) quarter = "Q3";
        else if (text.includes("4") || text.includes("q4") || text.includes("t4")) quarter = "Q4";
    }

    let title = "Nouvelle activité issue des TDR";
    const titleMatch = tdrText.match(titleRegex);
    if (titleMatch && titleMatch[1].trim().length > 5) {
        title = titleMatch[1].trim();
    } else {
        // Essayer d'extraire la première ligne significative
        const lines = tdrText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length > 0) {
            title = lines[0].substring(0, 100);
        }
    }

    logEvent("Programme", `Analyse TDR terminée. Activité proposée : "${title}" | Budget : ${budget} USD | Période : ${quarter}`);
    
    return {
        title: title,
        budget: budget,
        quarter: quarter,
        output: "Produit 2 : Inclusion Financière", // Catégorie par défaut
        assignedTo: "Programme"
    };
}

// Analyse un fichier CSV de terrain et effectue des calculs statistiques
function analyzeCSVData(csvText) {
    const logEvent = window.UNDP_DB.logEvent;
    logEvent("Suivi-Evaluation", "Fichier de données de terrain reçu. Début de l'analyse statistique...");

    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
        throw new Error("Le fichier CSV doit contenir au moins une ligne d'en-tête et une ligne de données.");
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Index des colonnes
    const indicatorIdx = headers.findIndex(h => h.includes("indic") || h.includes("id"));
    const valueIdx = headers.findIndex(h => h.includes("val") || h.includes("mesur") || h.includes("nomb"));
    
    if (indicatorIdx === -1 || valueIdx === -1) {
        throw new Error("Le CSV doit contenir au moins les colonnes 'indicator_id' et 'value'.");
    }

    const dataPoints = [];
    const statsByIndicator = {};

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        if (cols.length <= Math.max(indicatorIdx, valueIdx)) continue;

        const indId = cols[indicatorIdx];
        const val = parseFloat(cols[valueIdx]);

        if (indId && !isNaN(val)) {
            dataPoints.push({ indId, val });
            if (!statsByIndicator[indId]) {
                statsByIndicator[indId] = [];
            }
            statsByIndicator[indId].push(val);
        }
    }

    const results = [];
    const indicators = window.UNDP_DB.getIndicators();

    for (const [indId, values] of Object.entries(statsByIndicator)) {
        const indicator = indicators.find(ind => ind.id === indId || ind.code.toLowerCase() === indId.toLowerCase());
        if (!indicator) continue;

        const count = values.length;
        const sum = values.reduce((a, b) => a + b, 0);
        const mean = sum / count;
        
        // Variance & Écart-type
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / count;
        const stdDev = Math.sqrt(variance);
        const min = Math.min(...values);
        const max = Math.max(...values);

        // Calcul de la progression par rapport à la cible
        const baseline = indicator.baseline;
        const target = indicator.target;
        const current = mean; // Utiliser la moyenne constatée sur le terrain
        
        let progressPercent = 0;
        if (target !== baseline) {
            progressPercent = ((current - baseline) / (target - baseline)) * 100;
        }

        results.push({
            indicatorId: indicator.id,
            code: indicator.code,
            name: indicator.name,
            count: count,
            mean: mean.toFixed(2),
            stdDev: stdDev.toFixed(2),
            min: min,
            max: max,
            progressPercent: progressPercent.toFixed(1),
            target: target,
            baseline: baseline,
            unit: indicator.unit
        });

        // Mettre à jour l'indicateur dans la DB avec la moyenne mesurée sur le terrain
        window.UNDP_DB.updateIndicator(indicator.id, Math.round(mean), "Suivi-Evaluation (Auto)");
    }

    logEvent("Suivi-Evaluation", `Analyse statistique de terrain terminée. ${results.length} indicateurs mis à jour.`);
    return results;
}

// --- Moteur de Dialogue et de Coordination Multi-Agents ---

// Templates de réponses pour simuler la pensée des agents selon les types de demandes
const COORDINATION_TEMPLATES = {
    DEFAULT: [
        {
            agent: "PM",
            thought: "L'utilisateur demande une coordination générale. Je vais mobiliser les agents pour faire un point complet.",
            message: "Bonjour à l'équipe. Nous venons de recevoir une demande de suivi de l'utilisateur. Comptabilité, Finances et Suivi-Évaluation, merci de préparer vos données respectives pour que je puisse compiler une réponse d'ensemble."
        },
        {
            agent: "ACCT",
            thought: "Je dois vérifier que toutes les dépenses enregistrées sont équilibrées.",
            message: "Bonjour Chef de Projet. Les livres de comptes sont à jour. Nous avons 6 transactions majeures enregistrées. Les pièces justificatives pour le Produit 1 sont toutes validées dans IPSAS. Aucune anomalie de saisie."
        },
        {
            agent: "FIN",
            thought: "Calcul du taux d'exécution financière globale du projet.",
            message: "De mon côté, les finances affichent un budget total engagé de 500 000 USD. Les dépenses réelles s'élèvent à 233 500 USD. Le taux d'exécution financière globale (Delivery Rate) est actuellement de **46.7%**. Nous respectons la trajectoire d'utilisation des fonds pour ce semestre."
        },
        {
            agent: "ME",
            thought: "Analyse des statistiques et de la progression des indicateurs de performance.",
            message: "Sur le plan technique, nous suivons 4 indicateurs clés alignés avec les ODD. L'indicateur ODD 8 (jeunes électriciens certifiés) a atteint 100% de sa cible (20 personnes). L'accès à l'énergie dans les communes pilotes (Ind 1.1) est à 28% pour une cible de 45%. La tendance générale est positive, mais une attention particulière doit être portée au volet d'intégration des femmes dans les comités de gestion (Ind 2.2) qui stagne à 30% (cible à 40%)."
        },
        {
            agent: "PROG",
            thought: "Point sur l'avancement opérationnel du plan de travail annuel (AWP).",
            message: "Pour compléter le rapport de suivi, le plan de travail (Kanban) indique que le Produit 1 avance bien (les activités Q1 sont terminées ou en cours). Nous préparons le lancement des activités du Produit 2 (coopératives) pour le Q3."
        },
        {
            agent: "SPEC",
            thought: "Synthèse de conformité technique par rapport aux priorités sectorielles.",
            message: "DYNAMIC_SPEC_DEFAULT_MESSAGE"
        },
        {
            agent: "PM",
            thought: "Synthèse finale sous l'angle de la Gestion Axée sur les Résultats (GAR).",
            message: "Merci pour ces contributions claires. En synthèse : l'avancement financier (46.7%) est en adéquation avec l'avancement physique. La principale décision requise concerne le renforcement de la collecte de données sur le genre (Ind 2.2) et le lancement des activités agricoles du Q3. Nous sommes prêts pour le Comité de Pilotage."
        }
    ],
    BILAN_FINANCIER: [
        {
            agent: "PM",
            thought: "Analyse de la demande de bilan financier. Je délègue au Financier et au Comptable.",
            message: "Bonjour. Agent Comptable et Agent Financier, l'utilisateur sollicite un bilan financier détaillé. Merci de fournir l'état exact des dépenses et du Delivery Rate."
        },
        {
            agent: "ACCT",
            thought: "Extraction du grand livre comptable.",
            message: "Reçu. Les dépenses totales réelles enregistrées dans le grand livre s'élèvent à 233 500 USD, réparties comme suit : \n- Énergie Propre (Act 1.1 & 1.2) : 148 500 USD\n- Inclusion Financière (Act 2.1) : 85 000 USD.\nToutes les factures sont classées et prêtes pour audit."
        },
        {
            agent: "FIN",
            thought: "Analyse budgétaire fine et calcul de l'efficience.",
            message: "Merci. Sur la base de ces chiffres, voici le calcul analytique : Le taux de livraison financière (Delivery Rate) par rapport au budget annuel total de 500 000 USD est de **46.7%**. Si on analyse par produit :\n- Produit 1 (Énergie Propre) : taux d'exécution de 82.5% (excellent, activités de début d'année).\n- Produit 2 (Inclusion financière) : taux d'exécution de 32.7% (des fonds restent à allouer au Q3).\nTaux de consommation moyen : 33 357 USD par mois."
        },
        {
            agent: "ME",
            thought: "Faire le lien entre les dépenses financières et l'atteinte des résultats (Cost-Effectiveness).",
            message: "D'un point de vue de l'efficience, ces 148 500 USD investis dans le Produit 1 ont permis de certifier 20 techniciens et d'augmenter le taux d'accès à l'énergie propre de 5% à 28%. C'est un ratio coût/efficacité très satisfaisant."
        },
        {
            agent: "PM",
            thought: "Consolider la recommandation de décision financière.",
            message: "Excellent. Le projet est en bonne santé financière. La recommandation clé est d'accélérer les décaissements du fonds de micro-crédit vert (Act 2.1) au cours du trimestre en cours (Q3) pour atteindre notre cible annuelle."
        }
    ],
    EVALUATION_TECHNIQUE: [
        {
            agent: "PM",
            thought: "L'utilisateur demande un état d'avancement technique et d'évaluation.",
            message: "Bonjour. M&E Specialist, merci de faire une analyse statistique de l'état d'atteinte de nos cibles ODD."
        },
        {
            agent: "ME",
            thought: "Calcul statistique de la progression des indicateurs.",
            message: "Volontiers. Voici l'état statistique de nos indicateurs de performance :\n1. **Accès Énergie (ODD 7)** : Actuel: 28% (Baseline: 5% | Cible: 45%). Progression : **57.5% de l'objectif atteint**.\n2. **Techniciens certifiés (ODD 8)** : Actuel: 20 (Baseline: 0 | Cible: 20). Progression : **100% de la cible atteinte**.\n3. **Volume Micro-crédits (ODD 1)** : Actuel: 75 000 USD (Baseline: 0 | Cible: 150 000 USD). Progression : **50% de la cible atteinte**.\n4. **Genre dans les coopératives (ODD 5)** : Actuel: 30% (Baseline: 12% | Cible: 40%). Progression : **64.3% de la cible atteinte**."
        },
        {
            agent: "PROG",
            thought: "Associer la performance des indicateurs avec le calendrier des activités.",
            message: "Ces résultats s'expliquent par le fait que l'activité de formation est terminée (Act 1.2). Le retard relatif sur l'indicateur ODD 5 (Femmes dans les coopératives) est dû au démarrage tardif de l'Activité 2.2 (Structuration des coopératives). L'activité commence ce mois-ci, ce qui devrait redresser l'indicateur."
        },
        {
            agent: "PM",
            thought: "Formuler la recommandation pour le suivi-évaluation.",
            message: "Bien reçu. Nous constatons un taux d'avancement technique moyen de **67.9%** sur nos cibles. Notre stratégie GAR doit se concentrer sur l'inclusion du genre dans l'Activité 2.2. L'Agent M&E effectuera une mission terrain le 5 août pour valider les données de participation féminine."
        }
    ],
    TDR_ANALYSE: [
        {
            agent: "PM",
            thought: "L'utilisateur a déposé un TDR. Je demande à l'Agent Programme et au Financier de l'analyser.",
            message: "Un nouveau document de Termes de Référence (TDR) vient d'être soumis. Agent Programme, veuillez l'analyser pour identifier l'activité. Agent Financier, examinez l'impact budgétaire."
        },
        {
            agent: "PROG",
            thought: "Analyse du TDR pour structuration de l'activité.",
            message: "J'ai analysé les TDR. Il s'agit d'une activité visant l'organisation d'un atelier régional pour les coopératives agricoles durables. J'ai configuré une nouvelle tâche dans notre plan de travail (Kanban Q3) sous le code **Act. 2.3** : *Atelier régional de renforcement de capacités sur les pratiques agricoles résilientes*."
        },
        {
            agent: "ACCT",
            thought: "Création de la ligne budgétaire comptable.",
            message: "Entendu. J'ai réservé une enveloppe budgétaire prévisionnelle de **15 000 USD** pour cet atelier, couvrant la location de salle, la logistique terrain et les indemnités journalières (DSA) des participants nationaux."
        },
        {
            agent: "FIN",
            thought: "Analyse de soutenabilité financière pour le budget annuel.",
            message: "Cette dépense de 15 000 USD est couverte par la ligne budgétaire du Produit 2 (budget initial de 60 000 USD pour l'accompagnement des coopératives). Après engagement, le solde disponible pour le Produit 2 sera de 45 000 USD. Le Taux de Livraison Financière prévisionnel passera à **49.7%**."
        },
        {
            agent: "ME",
            thought: "Définition de l'indicateur d'impact pour le TDR.",
            message: "Excellent. Cette activité va alimenter directement l'indicateur *Nombre de coopératives agricoles durables structurées*. Je prévois des fiches d'évaluation et de collecte de données désagrégées par sexe lors de l'atelier pour mesurer l'impact immédiat."
        },
        {
            agent: "SPEC",
            thought: "Analyse de conformité sectorielle de l'activité.",
            message: "DYNAMIC_SPEC_TDR_MESSAGE"
        },
        {
            agent: "PM",
            thought: "Validation finale du TDR.",
            message: "Les TDR sont techniquement et financièrement validés par l'équipe de projet. L'activité a été insérée dans la base de données locale sous le code **Act. 2.3**. L'atelier est planifié dans le calendrier pour la fin du mois de septembre. Nous attendons votre feu vert pour débloquer les invitations."
        }
    ],
    INTER_AGENT_MEETING: [
        {
            agent: "PM",
            thought: "L'utilisateur demande un alignement technique. Je lance une réunion d'équipe dans le salon.",
            message: "Bonjour à tous. Faisons un point d'alignement rapide sur les tâches du trimestre en cours. Agent Programme, quel est le statut ?"
        },
        {
            agent: "PROG",
            thought: "Rapport opérationnel du programme.",
            message: "Bonjour PM. Les activités du trimestre avancent bien. Le TDR pour l'atelier des coopératives agricoles (Act 2.2) est rédigé. J'attends le visa budgétaire de la part du Comptable et du Financier."
        },
        {
            agent: "ACCT",
            thought: "Vérifier la validité comptable de la dépense.",
            message: "J'ai saisi la fiche d'engagement budgétaire prévisionnelle. Le code de ligne budgétaire est correct, les fonds sont bloqués en attente de la validation finale du montant."
        },
        {
            agent: "FIN",
            thought: "Vérification du Delivery Rate et validation budgétaire globale.",
            message: "Le budget de 4 050 USD pour cet atelier est conforme aux prévisions du Produit 2. Taux de livraison stable. Je donne mon visa financier."
        },
        {
            agent: "ME",
            thought: "Vérification du dispositif de suivi statistique lors de l'atelier.",
            message: "De mon côté, j'ai préparé les fiches statistiques de collecte. Nous allons mesurer le taux de participation active des femmes lors de cet atelier pour renseigner l'Indicateur 2.2."
        },
        {
            agent: "SPEC",
            thought: "Apporter des orientations techniques selon le secteur actif.",
            message: "DYNAMIC_SPEC_MEETING_MESSAGE"
        },
        {
            agent: "PM",
            thought: "Clôture de la réunion d'équipe.",
            message: "Parfait. Alignement complet de l'équipe : le TDR est finalisé, le budget validé et le dispositif d'évaluation M&E est en place. L'activité peut démarrer."
        }
    ]
};

function getSpecDynamicMessage(type) {
    const dbSpec = window.UNDP_DB.getSpecialistAgent();
    const sector = dbSpec.sector;
    if (type === 'tdr') {
        if (sector === "Environnement & Énergie") {
            return `En tant que Spécialiste Environnement & Énergie, j'ai passé en revue la proposition. L'installation de mini-réseaux solaires s'inscrit parfaitement dans l'axe de décarbonation du Mali (ODD 7/ODD 13). Je valide les TDR et recommande l'utilisation de batteries gel sans entretien.`;
        } else if (sector === "Agriculture & Développement Rural") {
            return `En tant qu'Expert Agro-économiste, je valide la fiche technique. L'accompagnement des coopératives agricoles est essentiel face aux changements climatiques au Sahel (ODD 2). L'atelier doit cibler les techniques d'agroforesterie.`;
        } else if (sector === "Genre & Développement Social") {
            return `En tant que Spécialiste Genre & Inclusion, je soutiens cette initiative. Nous devons nous assurer que les groupements féminins bénéficient de 50% du temps de parole et d'au moins 40% des financements prévus dans les TDR (ODD 5).`;
        } else if (sector === "Santé & Hygiène Communautaire") {
            return `En tant que Spécialiste en Santé Publique, je confirme l'alignement stratégique (ODD 3). Associer l'assainissement et l'eau potable solaire est indispensable pour réduire le taux de morbidité hydrique dans les villages cibles.`;
        }
        return `En tant qu'Expert Sectoriel, je valide la conformité technique du document de TDR avec nos indicateurs.`;
    } else if (type === 'meeting') {
        if (sector === "Environnement & Énergie") {
            return `En tant que Spécialiste Environnement, j'insiste pour que l'atelier intègre une session dédiée au recyclage des déchets photovoltaïques et au tri écologique.`;
        } else if (sector === "Agriculture & Développement Rural") {
            return `En tant qu'Agronome, je suggère de planifier les démonstrations de micro-irrigation sur une parcelle maraîchère active pour un apprentissage pratique optimal (ODD 2).`;
        } else if (sector === "Genre & Développement Social") {
            return `En tant que Spécialiste Genre, je recommande de désigner deux femmes comme modératrices de session pour favoriser la prise de parole féminine (ODD 5).`;
        } else if (sector === "Santé & Hygiène Communautaire") {
            return `En tant qu'Expert Santé, je demande de distribuer des guides sur les bonnes pratiques de potabilisation de l'eau aux délégués des coopératives.`;
        }
        return `En tant que Spécialiste Sectoriel, je recommande d'inclure des indicateurs techniques spécifiques à notre thématique de projet.`;
    } else { // default coordination
        if (sector === "Environnement & Énergie") {
            return `Pour le suivi technique, je note une bonne efficacité énergétique globale (ODD 7). La mise en service complète de la Commune A est notre priorité écologique du trimestre.`;
        } else if (sector === "Agriculture & Développement Rural") {
            return `Sur le plan agricole, nous devons veiller à ce que l'aménagement des parcelles maraîchères de l'Activité 2.2 coïncide avec le début de la campagne de contre-saison (ODD 2).`;
        } else if (sector === "Genre & Développement Social") {
            return `Sur le plan social, l'intégration des femmes progresse mais reste sous monitoring. L'Activité 2.2 sera l'occasion d'introduire des critères de sélection paritaires (ODD 5).`;
        } else if (sector === "Santé & Hygiène Communautaire") {
            return `Du point de vue sanitaire (ODD 3), l'avancement physique garantit déjà un accès fiable à l'eau pour la clinique locale. Nous surveillons l'analyse microbiologique de l'eau.`;
        }
        return `En tant que Spécialiste Sectoriel, je confirme que la trajectoire technique respecte les orientations de notre cadre stratégique national.`;
    }
}
// Fonction principale pour exécuter la coordination et renvoyer la séquence d'étapes animées
function runAgentCoordination(userRequest) {
    updateAgentSPECFromDb(); // S'assurer que le profil de l'agent SPEC est à jour dans AGENTS
    
    const query = userRequest.toLowerCase();
    let template = COORDINATION_TEMPLATES.DEFAULT;

    if (query.includes("financier") || query.includes("budget") || query.includes("dépense") || query.includes("argent") || query.includes("bilan")) {
        template = COORDINATION_TEMPLATES.BILAN_FINANCIER;
    } else if (query.includes("évaluation") || query.includes("indicateur") || query.includes("statistique") || query.includes("progrès") || query.includes("donnée") || query.includes("collecte")) {
        template = COORDINATION_TEMPLATES.EVALUATION_TECHNIQUE;
    } else if (query.includes("tdr") || query.includes("termes de référence") || query.includes("terme de reference")) {
        template = COORDINATION_TEMPLATES.TDR_ANALYSE;
    } else if (query.includes("réunion") || query.includes("reunion") || query.includes("alignement") || query.includes("discuter") || query.includes("salon") || query.includes("inter-agent")) {
        template = COORDINATION_TEMPLATES.INTER_AGENT_MEETING;
    }

    // Effectuer une copie profonde et substituer les messages dynamiques de SPEC
    return template.map(step => {
        let msg = step.message;
        if (msg === "DYNAMIC_SPEC_DEFAULT_MESSAGE") {
            msg = getSpecDynamicMessage('default');
        } else if (msg === "DYNAMIC_SPEC_TDR_MESSAGE") {
            msg = getSpecDynamicMessage('tdr');
        } else if (msg === "DYNAMIC_SPEC_MEETING_MESSAGE") {
            msg = getSpecDynamicMessage('meeting');
        }
        return {
            ...step,
            message: msg
        };
    });
}

// --- Générateurs de Rapports PDF (Simulés pour impression) ---

function generateAgentReport(agentId) {
    const state = window.UNDP_DB.getDbState();
    const activities = state.activities;
    const indicators = state.indicators;
    const financials = state.financials;
    const project = state.project;

    const dateStr = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

    let title = "";
    let contentHtml = "";

    switch (agentId) {
        case "PM":
            title = "RAPPORT GLOBAL D'AVANCEMENT DU CHEF DE PROJET";
            contentHtml = `
                <div class="report-header">
                    <h2>GESTION DES PROJETS ET PROGRAMME DU MALI</h2>
                    <h3>${project.name} (Code Projet: ${project.code})</h3>
                    <hr/>
                    <h4>RAPPORT DE GESTION ET D'AVANCEMENT GLOBAL</h4>
                    <p class="report-meta">Date: ${dateStr} | Auteur: Chef de Projet (PM)</p>
                </div>
                <div class="report-section">
                    <h5>1. Résumé Exécutif</h5>
                    <p>Le projet <em>${project.name}</em> entre dans son troisième trimestre d'exécution. Les activités physiques affichent un taux de réussite technique global de 67.9% sur les cibles d'indicateurs de développement. Les objectifs énergétiques (ODD 7) sont en excellente voie, tandis que les micro-crédits environnementaux s'accélèrent.</p>
                </div>
                <div class="report-section">
                    <h5>2. Analyse des Produits de Développement</h5>
                    <ul>
                        <li><strong>Produit 1 (Énergie Propre)</strong>: Totalement opérationnel. Les 20 techniciens prévus ont tous été formés et certifiés (100% de la cible).</li>
                        <li><strong>Produit 2 (Inclusion Financière)</strong>: 75 000 USD déboursés à ce jour. L'activité de structuration des coopératives agricoles durables débute ce trimestre pour soutenir le ciblage.</li>
                        <li><strong>Produit 3 (Suivi et Gouvernance)</strong>: Le cadre statistique a été renforcé avec l'import direct des données de terrain. L'évaluation d'impact finale est budgétisée pour le Q4.</li>
                    </ul>
                </div>
                <div class="report-section">
                    <h5>3. Recommandations Clés du Chef de Projet</h5>
                    <p>Pour le Comité de Pilotage, il est vivement recommandé de :</p>
                    <ol>
                        <li>Valider l'enveloppe budgétaire de l'activité 2.3 (Atelier agricole d'adaptation au climat) d'un montant de 15 000 USD.</li>
                        <li>Faire valider par le conseil d'administration une mission d'évaluation conjointe sur le terrain pour inspecter l'impact social dans les 5 communes pilotes.</li>
                    </ol>
                </div>
            `;
            break;

        case "ME":
            title = "RAPPORT D'EVALUATION TECHNIQUE ET STATISTIQUE (M&E)";
            // Calculer des statistiques pour le rapport
            const progressRates = indicators.map(i => {
                const range = i.target - i.baseline;
                const progress = range !== 0 ? ((i.current - i.baseline) / range) * 100 : 0;
                return progress;
            });
            const avgProgress = progressRates.reduce((a,b)=>a+b, 0) / indicators.length;

            contentHtml = `
                <div class="report-header">
                    <h2>GESTION DES PROJETS ET PROGRAMME DU MALI</h2>
                    <h3>${project.name}</h3>
                    <hr/>
                    <h4>RAPPORT D'EVALUATION TECHNIQUE, COLLECTE ET ANALYSE STATISTIQUE</h4>
                    <p class="report-meta">Date: ${dateStr} | Auteur: Agent Suivi-Évaluation (M&E Specialist)</p>
                </div>
                <div class="report-section">
                    <h5>1. Cadre Statistique & Taux de Réalisation Moyen</h5>
                    <p>L'analyse agrégée des 4 indicateurs d'effets et de produits montre un <strong>taux moyen de réalisation de l'objectif de ${avgProgress.toFixed(1)}%</strong>. Le recueil des données s'effectue via des rapports mensuels administratifs et des formulaires de collecte de terrain (fichiers CSV décentralisés).</p>
                </div>
                <div class="report-section">
                    <h5>2. Tableau de Bord Analytique des Indicateurs</h5>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Indicateur de Performance</th>
                                <th>Référence</th>
                                <th>Actuel</th>
                                <th>Cible</th>
                                <th>Unité</th>
                                <th>Réalisation</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${indicators.map(i => {
                                const range = i.target - i.baseline;
                                const pct = range !== 0 ? ((i.current - i.baseline) / range) * 100 : 0;
                                return `
                                    <tr>
                                        <td>${i.code}</td>
                                        <td>${i.name}</td>
                                        <td>${i.baseline}</td>
                                        <td><strong>${i.current}</strong></td>
                                        <td>${i.target}</td>
                                        <td>${i.unit}</td>
                                        <td><strong>${pct.toFixed(1)}%</strong></td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="report-section">
                    <h5>3. Analyse des Écarts & Recommandations Techniques</h5>
                    <p><strong>Genre & Inclusion (ODD 5)</strong> : L'indicateur 2.2 (représentativité féminine) affiche une variance modérée de 5.4. L'écart par rapport à la cible est de 10 points de pourcentage. Il est statistiquement établi que les coopératives sans quotas explicites de genre plafonnent à 22% de femmes aux postes décisionnels. <em>Recommandation :</em> Imposer un objectif minimal de 40% lors des prochaines élections de comités dans le cadre de l'Activité 2.2.</p>
                </div>
            `;
            break;

        case "PROG":
            title = "RAPPORT ANNUEL DE PLANIFICATION DE PROGRAMME (AWP)";
            const statusCounts = { todo: 0, in_progress: 0, review: 0, done: 0 };
            activities.forEach(a => statusCounts[a.status] = (statusCounts[a.status] || 0) + 1);

            contentHtml = `
                <div class="report-header">
                    <h2>GESTION DES PROJETS ET PROGRAMME DU MALI</h2>
                    <h3>${project.name}</h3>
                    <hr/>
                    <h4>RAPPORT D'ASSURANCE QUALITE ET EXÉCUTION DU PLAN DE TRAVAIL ANNUEL</h4>
                    <p class="report-meta">Date: ${dateStr} | Auteur: Agent Programme (Programme Specialist)</p>
                </div>
                <div class="report-section">
                    <h5>1. État du Plan de Travail Annuel (AWP)</h5>
                    <p>Le plan de travail comprend <strong>${activities.length} activités programmées</strong> réparties sur 4 trimestres. L'état d'exécution du pipeline est le suivant :</p>
                    <ul>
                        <li>Activités Complétées : <strong>${statusCounts.done}</strong></li>
                        <li>Activités En Cours : <strong>${statusCounts.in_progress}</strong></li>
                        <li>Activités À Planifier : <strong>${statusCounts.todo}</strong></li>
                    </ul>
                </div>
                <div class="report-section">
                    <h5>2. Pipeline détaillé des Activités</h5>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Activité</th>
                                <th>Trimestre</th>
                                <th>Responsable</th>
                                <th>Statut</th>
                                <th>Budget</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${activities.map(a => `
                                <tr>
                                    <td>${a.code}</td>
                                    <td>${a.title}</td>
                                    <td>${a.quarter}</td>
                                    <td>Agent ${a.assignedTo}</td>
                                    <td><span class="badge-${a.status}">${a.status.toUpperCase()}</span></td>
                                    <td>${a.budget.toLocaleString()} USD</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="report-section">
                    <h5>3. Note d'Assurance Qualité</h5>
                    <p>Toutes les activités clôturées (Q1) ont passé avec succès l'étape de validation d'assurance qualité de la GESTION DES PROJETS ET PROGRAMME DU MALI. Le rapport sur les risques indique un risque logistique faible pour le Q3 grâce au pré-positionnement des matériels de terrain.</p>
                </div>
            `;
            break;

        case "ACCT":
            title = "RAPPORT JOURNAL COMPTABLE & EXTRAITS DE TRANSACTIONS";
            contentHtml = `
                <div class="report-header">
                    <h2>GESTION DES PROJETS ET PROGRAMME DU MALI</h2>
                    <h3>${project.name}</h3>
                    <hr/>
                    <h4>EXTRAIT DU JOURNAL DE COMPTABILITÉ GÉNÉRALE (NORMES IPSAS)</h4>
                    <p class="report-meta">Date: ${dateStr} | Auteur: Agent Comptable (Finance Associate)</p>
                </div>
                <div class="report-section">
                    <h5>1. Synthèse des Écritures Comptables</h5>
                    <p>Les transactions financières du grand livre ont été auditées en conformité avec les règles comptables IPSAS applicables à la GESTION DES PROJETS ET PROGRAMME DU MALI. Un total de ${financials.length} transactions a été validé.</p>
                </div>
                <div class="report-section">
                    <h5>2. Extrait des Transactions du Projet</h5>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Activité</th>
                                <th>Saisi par</th>
                                <th>Statut</th>
                                <th>Montant (USD)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${financials.map(f => `
                                <tr>
                                    <td>${f.date}</td>
                                    <td>${f.description}</td>
                                    <td>${f.activityId}</td>
                                    <td>${f.loggedBy}</td>
                                    <td><strong>${f.status.toUpperCase()}</strong></td>
                                    <td><strong>${f.amount.toLocaleString()} USD</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="report-section">
                    <h5>3. Certification de Conformité</h5>
                    <p>Je certifie que toutes les transactions ci-dessus sont adossées à des pièces justificatives authentiques (contrats, feuilles d'émargement de formation, factures proforma certifiées). Les fonds ont été engagés exclusivement pour les objectifs définis dans le Prodoc.</p>
                </div>
            `;
            break;

        case "FIN":
            title = "RAPPORT FINANCIER COMBINE (CDR) & DELIVERY RATE";
            const totalBudget = project.budget;
            const totalSpent = activities.reduce((sum, a) => sum + a.spent, 0);
            const deliveryRate = (totalSpent / totalBudget) * 100;
            const remaining = totalBudget - totalSpent;

            contentHtml = `
                <div class="report-header">
                    <h2>GESTION DES PROJETS ET PROGRAMME DU MALI</h2>
                    <h3>${project.name}</h3>
                    <hr/>
                    <h4>RAPPORT FINANCIER DE LIVRAISON (COMBINED DELIVERY REPORT)</h4>
                    <p class="report-meta">Date: ${dateStr} | Auteur: Agent Financier (Finance & Operations Officer)</p>
                </div>
                <div class="report-section">
                    <h5>1. Performance Financière du Projet</h5>
                    <p>Le projet présente un budget consolidé de <strong>${totalBudget.toLocaleString()} USD</strong>. L'état d'exécution financière consolidé au ${dateStr} se résume ainsi :</p>
                    <ul>
                        <li>Budget Total Alloué : <strong>${totalBudget.toLocaleString()} USD</strong></li>
                        <li>Dépenses Réelles Liquidées : <strong>${totalSpent.toLocaleString()} USD</strong></li>
                        <li>Fonds Disponibles Restants : <strong>${remaining.toLocaleString()} USD</strong></li>
                        <li>Taux de Livraison Financière (Delivery Rate) : <strong style="color: #10b981; font-size: 1.2rem;">${deliveryRate.toFixed(1)}%</strong></li>
                    </ul>
                </div>
                <div class="report-section">
                    <h5>2. Allocation et Livraison par Produits</h5>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Composante / Produit</th>
                                <th>Budget Initial (USD)</th>
                                <th>Dépenses Réelles (USD)</th>
                                <th>Disponible (USD)</th>
                                <th>Taux d'Exécution</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Produit 1 : Énergie Propre</td>
                                <td>180,000</td>
                                <td>148,500</td>
                                <td>31,500</td>
                                <td><strong>82.5%</strong></td>
                            </tr>
                            <tr>
                                <td>Produit 2 : Inclusion Financière</td>
                                <td>260,000</td>
                                <td>85,000</td>
                                <td>175,000</td>
                                <td><strong>32.7%</strong></td>
                            </tr>
                            <tr>
                                <td>Produit 3 : Suivi & Gouvernance</td>
                                <td>60,000</td>
                                <td>0</td>
                                <td>60,000</td>
                                <td><strong>0.0%</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="report-section">
                    <h5>3. Recommandations Stratégiques Financières</h5>
                    <p>Le budget prévisionnel du Q3 s'élevant à 75 000 USD (incluant la nouvelle activité 2.3), le Delivery Rate prévisionnel pour la fin du Q3 s'établira à <strong>61.7%</strong>. Ce taux est parfaitement aligné avec les standards de la GESTION DES PROJETS ET PROGRAMME DU MALI pour une saine administration financière.</p>
                </div>
            `;
            break;

        case "SPEC":
            const dbSpec = window.UNDP_DB.getSpecialistAgent();
            title = `RAPPORT D'EXPERTISE SECTORIELLE : ${dbSpec.title.toUpperCase()}`;
            contentHtml = `
                <div class="report-header">
                    <h2>GESTION DES PROJETS ET PROGRAMME DU MALI</h2>
                    <h3>${project.name}</h3>
                    <hr/>
                    <h4>RAPPORT TECHNIQUE D'EXPERT SECTORIEL</h4>
                    <p class="report-meta">Date: ${dateStr} | Auteur: ${dbSpec.title} (IA)</p>
                </div>
                <div class="report-section">
                    <h5>1. Cadrage Thématique et Alignement Stratégique</h5>
                    <p>Ce rapport présente l'analyse d'expertise pour le secteur : <strong>${dbSpec.sector}</strong>. Ce volet s'aligne directement avec la stratégie nationale du Mali et l'objectif de développement suivant : <strong>${dbSpec.sdg || "ODD 11 - Villes et Communautés Durables"}</strong>.</p>
                </div>
                <div class="report-section">
                    <h5>2. Analyse des Impacts Sectoriels</h5>
                    <p>La mise en œuvre des activités programmées dans ce secteur démontre un impact positif direct. En analysant les données de collecte et les fiches d'activités, nous constatons :</p>
                    <ul>
                        <li><strong>Pertinence technique</strong> : Élevée. Les technologies et méthodologies sélectionnées répondent aux réalités physiques et logistiques des localités maliennes ciblées.</li>
                        <li><strong>Soutenabilité</strong> : L'implication des comités de gestion locaux assure la continuité du service au-delà du cycle de vie du projet.</li>
                    </ul>
                </div>
                <div class="report-section">
                    <h5>3. Recommandations de l'Expert Sectoriel</h5>
                    <p>Dans le cadre de la planification stratégique pour le semestre à venir, je formule les préconisations suivantes :</p>
                    <div style="background: #f8fafc; border-left: 4px solid ${dbSpec.color}; padding: 12px; margin: 10px 0; border-radius: 4px;">
                        <p style="margin: 0; font-weight: 500; font-style: italic; color: #1e293b;">"${dbSpec.recommendation || "Poursuivre le suivi de proximité des indicateurs communautaires."}"</p>
                    </div>
                </div>
            `;
            break;
    }

    return { title, contentHtml };
}

// Génère le rapport final pour la décision du Comité de Pilotage
function generateFinalDecisionReport() {
    const state = window.UNDP_DB.getDbState();
    const activities = state.activities;
    const indicators = state.indicators;
    const project = state.project;

    const dateStr = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

    // Calculs consolidés
    const totalBudget = project.budget;
    const totalSpent = activities.reduce((sum, a) => sum + a.spent, 0);
    const deliveryRate = ((totalSpent / totalBudget) * 100).toFixed(1);
    
    const progressRates = indicators.map(i => {
        const range = i.target - i.baseline;
        const progress = range !== 0 ? ((i.current - i.baseline) / range) * 100 : 0;
        return progress;
    });
    const avgProgress = (progressRates.reduce((a,b)=>a+b, 0) / indicators.length).toFixed(1);

    // Détermination de la décision recommandée automatique basée sur les statistiques
    let decisionRecomm = "POURSUIVRE LE PROJET COMME PLANIFIÉ (Option recommandée)";
    let explanation = "Le projet affiche une excellente synergie entre la progression technique (67.9% d'objectifs atteints) et la livraison financière (46.7%). Les procédures de contrôle interne sont optimales.";
    
    if (parseFloat(deliveryRate) < 30) {
        decisionRecomm = "RÉALLOUER LES CRÉDITS ET RESTRUCTURER (Plan de redressement)";
        explanation = "Le taux de livraison financière est trop faible par rapport à la période. Une réallocation des fonds sous-utilisés et une extension de la période de mise en œuvre sont conseillées.";
    } else if (parseFloat(avgProgress) < 40) {
        decisionRecomm = "RENFORCER LA MISE EN ŒUVRE TECHNIQUE / APPORTER UNE ASSISTANCE TECHNIQUE CIBLÉE";
        explanation = "Malgré un décaissement financier régulier, l'atteinte des indicateurs sur le terrain accuse un retard significatif. Une assistance technique renforcée est requise pour accélérer l'impact physique.";
    }

    const title = "RAPPORT DE SYNTHÈSE ET DE DÉCISION ESTRATÉGIQUE";
    const contentHtml = `
        <div class="report-header">
            <h2>GESTION DES PROJETS ET PROGRAMME DU MALI</h2>
            <h3>RAPPORT CONSOLIDÉ DE DÉCISION DU COMITÉ DE PILOTAGE</h3>
            <hr style="border: 2px solid #006eb6;"/>
            <h4>PROJET : ${project.name}</h4>
            <p class="report-meta">Date de session: ${dateStr} | Statut : Soumis pour décision</p>
        </div>

        <div class="report-section">
            <h5>1. Fiche d'Identité du Projet & KPI Financiers</h5>
            <table class="report-table">
                <tr>
                    <td><strong>Code Projet (Award ID)</strong></td>
                    <td>${project.code}</td>
                    <td><strong>Agence d'Exécution</strong></td>
                    <td>${project.agency}</td>
                </tr>
                <tr>
                    <td><strong>Budget Global</strong></td>
                    <td><strong>${totalBudget.toLocaleString()} USD</strong></td>
                    <td><strong>Dépenses Liquidées</strong></td>
                    <td><strong>${totalSpent.toLocaleString()} USD</strong></td>
                </tr>
                <tr>
                    <td><strong>Taux de Livraison (Delivery Rate)</strong></td>
                    <td><strong style="color: #006eb6; font-size: 1.1rem;">${deliveryRate}%</strong></td>
                    <td><strong>Taux Moyen de Réalisation des Cibles</strong></td>
                    <td><strong style="color: #f43f5e; font-size: 1.1rem;">${avgProgress}%</strong></td>
                </tr>
            </table>
        </div>

        <div class="report-section">
            <h5>2. Bilan de Performance (GAR)</h5>
            <p>L'équipe d'évaluation a mesuré les réalisations par rapport au Cadre de Résultats logiques du projet :</p>
            <ul>
                <li><strong>ODD 7 (Énergie Solde)</strong> : 5 communes rurales ont été équipées de mini-réseaux solaires d'une capacité cumulée de 120kW. L'accès à l'électricité propre est passé de 5% à 28% dans les communes cibles.</li>
                <li><strong>ODD 8 (Travail Décent)</strong> : Les formations certifiantes en photovoltaïque ont atteint 100% de leur cible annuelle (20 jeunes). Les diplômés ont été équipés de kits professionnels d'insertion.</li>
                <li><strong>ODD 5 (Égalité des genres)</strong> : La représentativité des femmes dans les conseils coopératifs progresse de 12% à 30%. Les mesures correctives introduites lors de la dernière revue de terrain visent à franchir la cible de 40% au Q4.</li>
            </ul>
        </div>

        <div class="report-section">
            <h5>3. Scénarios et Options de Décision</h5>
            <p>Conformément aux lignes directrices de gestion de la GESTION DES PROJETS ET PROGRAMME DU MALI, le Comité de Pilotage est invité à examiner les trois options stratégiques suivantes :</p>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Option Stratégique</th>
                        <th>Impacts Clés</th>
                        <th>Recommandation</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="background: rgba(16, 185, 129, 0.1);">
                        <td><strong>Option A : Poursuite & Extension Locale</strong></td>
                        <td>Continuer le plan annuel de travail (AWP) et allouer l'enveloppe de 15 000 USD pour l'atelier d'adaptation agricole du Q3.</td>
                        <td><strong>Recommandée par le Chef de Projet</strong></td>
                    </tr>
                    <tr>
                        <td><strong>Option B : Gel & Audit de Performance</strong></td>
                        <td>Suspendre temporairement les décaissements du Produit 2 en attendant une évaluation approfondie de la gouvernance locale.</td>
                        <td>Non recommandée (risque de perte de confiance communautaire)</td>
                    </tr>
                    <tr>
                        <td><strong>Option C : Réallocation Budgétaire</strong></td>
                        <td>Réallouer 40 000 USD du Produit 2 vers le Produit 1 pour étendre les réseaux solaires à deux nouvelles communes pilotes.</td>
                        <td>Option alternative (à étudier pour maximiser l'efficience ODD 7)</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="report-section" style="background: #f3f4f6; border-left: 5px solid #006eb6; padding: 15px; margin-top: 20px;">
            <h5 style="color: #006eb6; margin-top:0;">4. Décision Strategique Recommandée</h5>
            <p style="font-weight: bold; margin-bottom: 5px;">${decisionRecomm}</p>
            <p style="margin-top: 0; font-size: 0.95rem; line-height: 1.4;">${explanation}</p>
        </div>
        
        <div class="report-signature-block" style="margin-top: 40px; display: flex; justify-content: space-between;">
            <div>
                <p>Préparé par :</p>
                <br/><br/>
                <p>_____________________________________</p>
                <p><strong>Chef de Projet (PM)</strong><br/>Équipe de Gestion du Projet</p>
            </div>
            <div>
                <p>Approuvé par le Comité de Pilotage :</p>
                <br/><br/>
                <p>_____________________________________</p>
                <p><strong>Président de Session</strong><br/>Représentant de la GESTION DES PROJETS ET PROGRAMME DU MALI</p>
            </div>
        </div>
    `;

    return { title, contentHtml };
}

function generateAgentTDR(agentId) {
    const state = window.UNDP_DB.getDbState();
    const project = state.project;
    const dateStr = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    
    let title = "";
    let contentHtml = "";

    switch (agentId) {
        case "PM":
            title = "TDR - Organisation du Comité de Pilotage Stratégique";
            contentHtml = `
                <div class="report-header">
                    <h2>GESTION DES PROJETS ET PROGRAMME DU MALI</h2>
                    <h3>PROJET : ${project.name}</h3>
                    <hr/>
                    <h4>TERMES DE RÉFÉRENCE (TDR) - REUNION DU COMITE DE PILOTAGE SEMESTRIEL</h4>
                    <p class="report-meta">Établi le: ${dateStr} | Initiateur: Chef de Projet (PM)</p>
                </div>
                <div class="report-section">
                    <h5>1. Contexte et Justification</h5>
                    <p>Le projet d'appui au développement local et à l'accès aux services essentiels entre dans sa phase critique. Afin de garantir l'alignement stratégique avec les orientations nationales et d'assurer une saine gestion des budgets alloués, il est impératif de réunir le Comité de Pilotage. Cette instance réunit les ministères sectoriels partenaires et l'unité de gestion.</p>
                </div>
                <div class="report-section">
                    <h5>2. Objectifs de la Réunion</h5>
                    <ul>
                        <li>Présenter le bilan physique (indicateurs ODD) et financier (Combined Delivery Report) du semestre.</li>
                        <li>Soumettre pour approbation le plan de travail annuel révisé (AWP) pour le Q3/Q4.</li>
                        <li>Valider les recommandations de réallocation budgétaire et de restructuration.</li>
                    </ul>
                </div>
                <div class="report-section">
                    <h5>3. Résultats Attendus</h5>
                    <ul>
                        <li>Un procès-verbal de session signé par tous les membres.</li>
                        <li>Le plan de travail annuel Q3/Q4 formellement approuvé.</li>
                        <li>La feuille de route d'audit et d'évaluation validée.</li>
                    </ul>
                </div>
                <div class="report-section">
                    <h5>4. Budget Prévisionnel</h5>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Rubrique de Dépense</th>
                                <th>Détails / Quantité</th>
                                <th>Coût Unitaire (USD)</th>
                                <th>Montant Total (USD)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Logistique & Salle de Réunion</td>
                                <td>Location et équipements - 1 jour</td>
                                <td>800</td>
                                <td>800 USD</td>
                            </tr>
                            <tr>
                                <td>Indemnités Journalières (DSA)</td>
                                <td>Participants régionaux - 10 personnes</td>
                                <td>150</td>
                                <td>1 500 USD</td>
                            </tr>
                            <tr>
                                <td>Restauration & Pause-café</td>
                                <td>Service traiteur - 25 personnes</td>
                                <td>30</td>
                                <td>750 USD</td>
                            </tr>
                            <tr style="font-weight: bold;">
                                <td colspan="3">Total Estimé</td>
                                <td>3 050 USD</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="report-signature-block" style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 0.85rem;">
                    <div>
                        <p>Établi par :</p>
                        <br/>
                        <p><strong>Chef de Projet (PM)</strong></p>
                    </div>
                    <div>
                        <p>Visé pour approbation :</p>
                        <br/>
                        <p><strong>Directeur National</strong></p>
                    </div>
                </div>
            `;
            break;

        case "ME":
            title = "TDR - Mission d'Évaluation Technique et de Collecte de Données";
            contentHtml = `
                <div class="report-header">
                    <h2>GESTION DES PROJETS ET PROGRAMME DU MALI</h2>
                    <h3>PROJET : ${project.name}</h3>
                    <hr/>
                    <h4>TERMES DE RÉFÉRENCE (TDR) - MISSION DE COLLECTE ET DE STATISTIQUES DE TERRAIN</h4>
                    <p class="report-meta">Établi le: ${dateStr} | Initiateur: Spécialiste Suivi-Évaluation (M&E)</p>
                </div>
                <div class="report-section">
                    <h5>1. Contexte et Justification</h5>
                    <p>Le suivi axé sur les résultats exige des données de terrain fraîches, objectives et vérifiées. Suite aux rapports partiels signalant des écarts statistiques sur la participation féminine et les taux d'accès énergétiques, l'Agent Suivi-Évaluation propose une mission d'audit statistique et d'échantillonnage auprès des 5 communes pilotes.</p>
                </div>
                <div class="report-section">
                    <h5>2. Objectifs de la Mission</h5>
                    <ul>
                        <li>Collecter les relevés de consommation des mini-réseaux et auditer les registres de formation.</li>
                        <li>Mener une enquête par échantillonnage (150 ménages) sur le niveau de revenus des bénéficiaires de micro-crédits.</li>
                        <li>Calculer les variances et écarts-types locaux pour corriger le plan de ciblage.</li>
                    </ul>
                </div>
                <div class="report-section">
                    <h5>3. Livrables Attendus</h5>
                    <ul>
                        <li>Base de données brute nettoyée sous format CSV contenant les relevés.</li>
                        <li>Rapport statistique de mission d'évaluation technique avec calculs de variance.</li>
                        <li>Fiches d'indicateurs ODD mises à jour dans la base de données centrale.</li>
                    </ul>
                </div>
                <div class="report-section">
                    <h5>4. Budget Prévisionnel</h5>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Rubrique de Dépense</th>
                                <th>Détails / Quantité</th>
                                <th>Coût Unitaire (USD)</th>
                                <th>Montant Total (USD)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Frais de carburant & Transport</td>
                                <td>Véhicule tout-terrain - 5 jours</td>
                                <td>120</td>
                                <td>600 USD</td>
                            </tr>
                            <tr>
                                <td>Frais de subsistance Enquêteurs</td>
                                <td>3 personnes - 5 jours</td>
                                <td>80</td>
                                <td>1 200 USD</td>
                            </tr>
                            <tr>
                                <td>Kits de numérisation (Tablettes)</td>
                                <td>Location tablettes de collecte</td>
                                <td>50</td>
                                <td>250 USD</td>
                            </tr>
                            <tr style="font-weight: bold;">
                                <td colspan="3">Total Estimé</td>
                                <td>2 050 USD</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="report-signature-block" style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 0.85rem;">
                    <div>
                        <p>Établi par :</p>
                        <br/>
                        <p><strong>Agent Suivi-Évaluation (M&E)</strong></p>
                    </div>
                    <div>
                        <p>Visé pour approbation :</p>
                        <br/>
                        <p><strong>Chef de Projet (PM)</strong></p>
                    </div>
                </div>
            `;
            break;

        case "PROG":
            title = "TDR - Atelier de Renforcement de Capacités des Coopératives";
            contentHtml = `
                <div class="report-header">
                    <h2>GESTION DES PROJETS ET PROGRAMME DU MALI</h2>
                    <h3>PROJET : ${project.name}</h3>
                    <hr/>
                    <h4>TERMES DE RÉFÉRENCE (TDR) - ATELIER TECHNIQUE DE RENFORCEMENT DE CAPACITÉS</h4>
                    <p class="report-meta">Établi le: ${dateStr} | Initiateur: Agent Programme (Programme Specialist)</p>
                </div>
                <div class="report-section">
                    <h5>1. Contexte et Justification</h5>
                    <p>L'accompagnement et la structuration des coopératives agricoles durables constituent un jalon majeur du Produit 2 de notre plan de travail annuel (AWP). Pour garantir l'appropriation des pratiques durables et la saine gestion des ressources, l'Agent Programme lance cet atelier de renforcement technique.</p>
                </div>
                <div class="report-section">
                    <h5>2. Objectifs de l'Atelier</h5>
                    <ul>
                        <li>Forme 30 gestionnaires de coopératives ruraux aux techniques de comptabilité et de gouvernance associative.</li>
                        <li>Transmettre les compétences techniques d'exploitation des équipements collectifs installés.</li>
                        <li>Établir les statuts et règlements intérieurs conformes aux exigences du PNUD et de l'État malien.</li>
                    </ul>
                </div>
                <div class="report-section">
                    <h5>3. Livrables Attendus</h5>
                    <ul>
                        <li>30 gestionnaires certifiés à l'issue de la formation.</li>
                        <li>Modèles de rapports financiers simplifiés distribués aux coopératives.</li>
                        <li>Rapport final d'atelier d'apprentissage rédigé sous 7 jours.</li>
                    </ul>
                </div>
                <div class="report-section">
                    <h5>4. Budget Prévisionnel</h5>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Rubrique de Dépense</th>
                                <th>Détails / Quantité</th>
                                <th>Coût Unitaire (USD)</th>
                                <th>Montant Total (USD)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Honoraires Formateurs</td>
                                <td>2 consultants - 3 jours</td>
                                <td>300</td>
                                <td>1 800 USD</td>
                            </tr>
                            <tr>
                                <td>Matériel Pédagogique & Kits</td>
                                <td>Cahiers, guides techniques - 30 unités</td>
                                <td>15</td>
                                <td>450 USD</td>
                            </tr>
                            <tr>
                                <td>Logistique & Restauration</td>
                                <td>Participants - 3 jours</td>
                                <td>20</td>
                                <td>1 800 USD</td>
                            </tr>
                            <tr style="font-weight: bold;">
                                <td colspan="3">Total Estimé</td>
                                <td>4 050 USD</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="report-signature-block" style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 0.85rem;">
                    <div>
                        <p>Établi par :</p>
                        <br/>
                        <p><strong>Agent Programme</strong></p>
                    </div>
                    <div>
                        <p>Visé pour approbation :</p>
                        <br/>
                        <p><strong>Chef de Projet (PM)</strong></p>
                    </div>
                </div>
            `;
            break;

        case "ACCT":
            title = "TDR - Mission d'Audit Comptable Interne et Rapprochement";
            contentHtml = `
                <div class="report-header">
                    <h2>GESTION DES PROJETS ET PROGRAMME DU MALI</h2>
                    <h3>PROJET : ${project.name}</h3>
                    <hr/>
                    <h4>TERMES DE RÉFÉRENCE (TDR) - MISSION D'AUDIT COMPTABLE ET DE CONFORMITÉ FINANCIÈRE</h4>
                    <p class="report-meta">Établi le: ${dateStr} | Initiateur: Agent Comptable (Finance Associate)</p>
                </div>
                <div class="report-section">
                    <h5>1. Contexte et Justification</h5>
                    <p>Pour anticiper l'audit financier annuel obligatoire du projet (Act 3.1) et garantir la stricte conformité des dépenses avec les normes IPSAS, l'Agent Comptable planifie une mission d'audit interne, de rapprochement bancaire et d'inspection physique des pièces justificatives.</p>
                </div>
                <div class="report-section">
                    <h5>2. Objectifs de l'Audit</h5>
                    <ul>
                        <li>Vérifier l'intégralité et l'éligibilité des 6 transactions majeures du grand livre comptable.</li>
                        <li>Rapprocher les relevés bancaires du compte de projet avec le registre des dépenses en LocalStorage.</li>
                        <li>Constituer le classeur de conformité contenant tous les originaux de factures et listes de présence.</li>
                    </ul>
                </div>
                <div class="report-section">
                    <h5>3. Résultats Attendus</h5>
                    <ul>
                        <li>Rapport de pré-audit listant les éventuels écarts ou pièces manquantes.</li>
                        <li>Registre de réconciliation bancaire validé et signé.</li>
                        <li>Recommandations d'ajustements d'écritures pour le comptable.</li>
                    </ul>
                </div>
                <div class="report-section">
                    <h5>4. Budget Prévisionnel</h5>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Rubrique de Dépense</th>
                                <th>Détails / Quantité</th>
                                <th>Coût Unitaire (USD)</th>
                                <th>Montant Total (USD)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Fournitures de bureau & Archives</td>
                                <td>Classeurs, boîtes d'archivage</td>
                                <td>150</td>
                                <td>150 USD</td>
                            </tr>
                            <tr>
                                <td>Frais de déplacement</td>
                                <td>Vérification fournisseurs locaux</td>
                                <td>200</td>
                                <td>200 USD</td>
                            </tr>
                            <tr style="font-weight: bold;">
                                <td colspan="3">Total Estimé</td>
                                <td>350 USD</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="report-signature-block" style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 0.85rem;">
                    <div>
                        <p>Établi par :</p>
                        <br/>
                        <p><strong>Agent Comptable</strong></p>
                    </div>
                    <div>
                        <p>Visé pour approbation :</p>
                        <br/>
                        <p><strong>Chef de Projet (PM)</strong></p>
                    </div>
                </div>
            `;
            break;

        case "FIN":
            title = "TDR - Table Ronde des Partenaires et Mobilisation Financière";
            contentHtml = `
                <div class="report-header">
                    <h2>GESTION DES PROJETS ET PROGRAMME DU MALI</h2>
                    <h3>PROJET : ${project.name}</h3>
                    <hr/>
                    <h4>TERMES DE RÉFÉRENCE (TDR) - COLLOQUE DE MOBILISATION DES RESSOURCES ET DE PARTENARIAT</h4>
                    <p class="report-meta">Établi le: ${dateStr} | Initiateur: Agent Financier (Finance Officer)</p>
                </div>
                <div class="report-section">
                    <h5>1. Contexte et Justification</h5>
                    <p>Dans l'optique d'étendre la couverture géographique du projet et de financer la phase d'extension préconisée par l'évaluation technique, il s'avère stratégique de mobiliser de nouvelles ressources financières. L'Agent Financier propose d'organiser une table ronde de plaidoyer et de négociation budgétaire.</p>
                </div>
                <div class="report-section">
                    <h5>2. Objectifs de la Table Ronde</h5>
                    <ul>
                        <li>Présenter le taux de livraison financière (Delivery Rate de 46.7%) et prouver la saine gestion fiduciaire.</li>
                        <li>Proposer aux bailleurs multilatéraux de co-financer le Produit 2 (Ligne de micro-crédits verts).</li>
                        <li>Signer des mémorandums d'accord (MoU) préliminaires pour sécuriser une enveloppe complémentaire de 200 000 USD.</li>
                    </ul>
                </div>
                <div class="report-section">
                    <h5>3. Livrables Attendus</h5>
                    <ul>
                        <li>Un dossier de plaidoyer financier de projet distribué.</li>
                        <li>Fiches d'intérêt de contribution signées par au moins deux nouveaux bailleurs.</li>
                        <li>Rapport de recommandations de mobilisation financière post-événement.</li>
                    </ul>
                </div>
                <div class="report-section">
                    <h5>4. Budget Prévisionnel</h5>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Rubrique de Dépense</th>
                                <th>Détails / Quantité</th>
                                <th>Coût Unitaire (USD)</th>
                                <th>Montant Total (USD)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Conception & Impression Dossiers</td>
                                <td>Dossier de projet relié - 50 exemplaires</td>
                                <td>20</td>
                                <td>1 000 USD</td>
                            </tr>
                            <tr>
                                <td>Pause Réception Déjeunatoire</td>
                                <td>Buffet officiel - 40 personnes</td>
                                <td>40</td>
                                <td>1 600 USD</td>
                            </tr>
                            <tr>
                                <td>Supports visuels (Banderoles/Roll-ups)</td>
                                <td>Kakemonos de communication</td>
                                <td>300</td>
                                <td>600 USD</td>
                            </tr>
                            <tr style="font-weight: bold;">
                                <td colspan="3">Total Estimé</td>
                                <td>3 200 USD</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="report-signature-block" style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 0.85rem;">
                    <div>
                        <p>Établi par :</p>
                        <br/>
                        <p><strong>Agent Financier</strong></p>
                    </div>
                    <div>
                        <p>Visé pour approbation :</p>
                        <br/>
                        <p><strong>Chef de Projet (PM)</strong></p>
                    </div>
                </div>
            `;
            break;

        case "SPEC":
            const dbSpec = window.UNDP_DB.getSpecialistAgent();
            title = `TDR - Mission d'Expertise Technique Sectorielle (${dbSpec.sector})`;
            
            let sectorJust = "Ce projet exige des analyses spécifiques aux enjeux énergétiques ruraux. La mise en place de mini-réseaux exige un audit de conformité pour sécuriser la stabilité de la charge électrique.";
            let sectorObjectives = `
                <li>Inspecter la conformité technique de l'installation des batteries solaires (ODD 7).</li>
                <li>Vérifier la capacité réelle des onduleurs installés face aux pics de charge prévus.</li>
                <li>Former les comités communaux au plan de maintenance préventive des panneaux.</li>
            `;
            let sectorBudget = `
                <tr>
                    <td>Appareils de mesure technique</td>
                    <td>Multimètres pro, Analyseurs de réseau</td>
                    <td>500</td>
                    <td>500 USD</td>
                </tr>
                <tr>
                    <td>Déplacement sur sites solaires</td>
                    <td>Techniciens d'inspection - 3 jours</td>
                    <td>150</td>
                    <td>450 USD</td>
                </tr>
            `;
            let totalSpecCost = "950 USD";

            if (dbSpec.sector === "Agriculture & Développement Rural") {
                sectorJust = "Le renforcement des capacités des coopératives agricoles impose de cartographier la qualité des sols et les besoins en eau d'irrigation. L'expertise agro-économique valide le plan de cultures résilientes.";
                sectorObjectives = `
                    <li>Prélever des échantillons de terre pour évaluer le taux d'humidité résiduel.</li>
                    <li>Inspecter le bon raccordement des conduites de micro-irrigation sur les forages.</li>
                    <li>Définir le calendrier cultural de contre-saison avec les groupements maraîchers.</li>
                `;
                sectorBudget = `
                    <tr>
                        <td>Analyse physico-chimique des sols</td>
                        <td>Kits d'analyse et réactifs chimiques</td>
                        <td>350</td>
                        <td>350 USD</td>
                    </tr>
                    <tr>
                        <td>Frais de mission Agronome</td>
                        <td>Indemnités et logistique de terrain</td>
                        <td>400</td>
                        <td>400 USD</td>
                    </tr>
                `;
                totalSpecCost = "750 USD";
            } else if (dbSpec.sector === "Genre & Développement Social") {
                sectorJust = "La représentativité des femmes dans les coopératives est un pilier de la politique d'équité de la GESTION DES PROJETS ET PROGRAMME DU MALI. Une mission de sensibilisation sociale est planifiée.";
                sectorObjectives = `
                    <li>Animer des sessions de dialogue communautaire sur le rôle décisionnel des femmes.</li>
                    <li>Former 20 femmes leaders aux techniques de plaidoyer et d'art oratoire.</li>
                    <li>Vérifier la conformité de l'allocation des micro-crédits verts en faveur des femmes.</li>
                `;
                sectorBudget = `
                    <tr>
                        <td>Organisation de focus groups</td>
                        <td>Location hangars communautaires, matériel de sensibilisation</td>
                        <td>250</td>
                        <td>250 USD</td>
                    </tr>
                    <tr>
                        <td>Frais d'animation animatrices</td>
                        <td>2 agents de terrain - 3 jours</td>
                        <td>100</td>
                        <td>300 USD</td>
                    </tr>
                `;
                totalSpecCost = "550 USD";
            } else if (dbSpec.sector === "Santé & Hygiène Communautaire") {
                sectorJust = "L'accès à l'eau potable solaire dans les dispensaires nécessite d'établir un plan d'hygiène et de contrôle de la qualité de l'eau pour prémunir les patients contre les épidémies saisonnières.";
                sectorObjectives = `
                    <li>Effectuer des tests bactériologiques réguliers sur les réservoirs de distribution.</li>
                    <li>Former le personnel infirmier local aux protocoles de désinfection de l'eau.</li>
                    <li>Auditer la chaîne de froid solaire de stockage des vaccins.</li>
                `;
                sectorBudget = `
                    <tr>
                        <td>Kits d'analyse microbiologique de l'eau</td>
                        <td>Réactifs E. coli, turbidimètre de terrain</td>
                        <td>400</td>
                        <td>400 USD</td>
                    </tr>
                    <tr>
                        <td>Indemnités Hygiéniste de district</td>
                        <td>Supervision médicale des dispensaires - 3 jours</td>
                        <td>120</td>
                        <td>360 USD</td>
                    </tr>
                `;
                totalSpecCost = "760 USD";
            }

            contentHtml = `
                <div class="report-header">
                    <h2>GESTION DES PROJETS ET PROGRAMME DU MALI</h2>
                    <h3>PROJET : ${project.name}</h3>
                    <hr/>
                    <h4>TERMES DE RÉFÉRENCE (TDR) - MISSION D'EXPERTISE TECHNIQUE SECTORIELLE</h4>
                    <p class="report-meta">Établi le: ${dateStr} | Initiateur: ${dbSpec.title} (IA)</p>
                </div>
                <div class="report-section">
                    <h5>1. Contexte et Justification</h5>
                    <p>${sectorJust}</p>
                </div>
                <div class="report-section">
                    <h5>2. Objectifs de la Mission</h5>
                    <ul>
                        ${sectorObjectives}
                    </ul>
                </div>
                <div class="report-section">
                    <h5>3. Livrables Attendus</h5>
                    <ul>
                        <li>Rapport de conformité technique et recommandation sectorielle rédigé.</li>
                        <li>Schémas d'optimisation ou protocoles de gestion technique remis aux bénéficiaires.</li>
                        <li>Fiche d'audit technique approuvée.</li>
                    </ul>
                </div>
                <div class="report-section">
                    <h5>4. Budget Prévisionnel</h5>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Rubrique de Dépense</th>
                                <th>Détails / Quantité</th>
                                <th>Coût Unitaire (USD)</th>
                                <th>Montant Total (USD)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sectorBudget}
                            <tr style="font-weight: bold;">
                                <td colspan="3">Total Estimé</td>
                                <td>${totalSpecCost}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="report-signature-block" style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 0.85rem;">
                    <div>
                        <p>Établi par :</p>
                        <br/>
                        <p><strong>${dbSpec.title}</strong></p>
                    </div>
                    <div>
                        <p>Visé pour approbation :</p>
                        <br/>
                        <p><strong>Chef de Projet (PM)</strong></p>
                    </div>
                </div>
            `;
            break;
    }

    return { title, contentHtml };
}

// Exportation des agents et des fonctions utiles
window.UNDP_AGENTS = {
    AGENTS,
    analyzeTDR,
    analyzeCSVData,
    runAgentCoordination,
    generateAgentReport,
    generateFinalDecisionReport,
    updateAgentSPECFromDb,
    analyzeTDRWithExternalAPI,
    generateAgentTDR
};
