/**
 * app.js
 * Contrôleur d'interface utilisateur et orchestrateur de l'application multi-agents GESTION DES PROJETS ET PROGRAMME DU MALI.
 */

const app = (function() {
    // Raccourcis d'accès aux modules globaux
    const DB = window.UNDP_DB;
    const AGENTS = window.UNDP_AGENTS;
    
    // État local de la page active
    let activeTab = 'dashboard';
    let activeDbTable = 'activities';
    let currentTDRProposal = null;

    // --- Initialisation ---
    function init() {
        DB.initDatabase();
        setupEventListeners();
        renderAll();
        
        // Message d'accueil du Chef de Projet
        sendAgentInitialWelcome();
    }

    // --- Écouteurs d'événements ---
    function setupEventListeners() {
        // Changement d'onglets principaux
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.getAttribute('data-tab');
                switchTab(tab);
            });
        });

        // Onglets d'exploration de la base de données
        document.querySelectorAll('.table-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.table-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                activeDbTable = tab.getAttribute('data-table');
                renderDatabaseTable();
            });
        });

        // Écouteur de filtres Kanban
        document.getElementById('kanban-quarter-filter').addEventListener('change', () => {
            renderKanban();
        });

        // Écouteur d'événements de log de la DB
        window.addEventListener('db-log-added', (e) => {
            // Re-rendre le journal des logs sur le tableau de bord
            renderLogFeed();
            // Re-rendre le compteur de logs
            const state = DB.getDbState();
            document.getElementById('log-count').innerText = `${state.logs.length} logs`;
        });
    }

    // --- Navigation ---
    function switchTab(tabId) {
        activeTab = tabId;
        
        // Classes actives de la barre latérale
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            }
        });

        // Visibilité des sections de contenu
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        const targetPanel = document.getElementById(`tab-${tabId}`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }

        // Mettre à jour le titre de la page
        const titles = {
            dashboard: 'Tableau de Bord du Projet',
            logframe: 'Cadre Logique & Indicateurs (ODD)',
            kanban: 'Plan de Travail Annuel (AWP)',
            documents: 'Centre de Gestion Documentaire',
            reports: 'Centre de Rapports & Exports PDF',
            chat: 'Console de Coordination Multi-Agents',
            database: 'Explorateur de Base de Données'
        };
        document.getElementById('page-title').innerText = titles[tabId] || 'Gestion de Projet';

        // Re-rendre les éléments spécifiques à l'onglet
        renderAll();
    }

    // --- Rendu Global ---
    function renderAll() {
        const state = DB.getDbState();
        
        // Métadonnées projet
        document.getElementById('sidebar-project-code').innerText = `${state.project.code} - AWP`;
        document.getElementById('project-fullname').innerText = state.project.name;
        document.getElementById('header-budget').innerText = `${state.project.budget.toLocaleString()} USD`;

        // Calculer les statistiques globales
        const totalSpent = state.activities.reduce((sum, a) => sum + a.spent, 0);
        const deliveryRate = ((totalSpent / state.project.budget) * 100).toFixed(1);
        
        document.getElementById('header-delivery-rate').innerText = `${deliveryRate}%`;
        // Mettre à jour les labels de l'agent spécialiste dynamique dans l'onglet rapports et générateur
        const dbSpec = DB.getSpecialistAgent();
        const specNameElem = document.getElementById('report-spec-name');
        if (specNameElem && dbSpec) {
            specNameElem.innerText = dbSpec.title;
            document.getElementById('report-spec-role').innerText = dbSpec.sector === "Non initialisé" ? "Expert IA" : `Expert en ${dbSpec.sector}`;
            
            const tdrSpecOpt = document.getElementById('tdr-spec-option');
            if (tdrSpecOpt) {
                tdrSpecOpt.innerText = `${dbSpec.title} - Mission d'Expertise Sectorielle (IA)`;
            }
        }

        // Rendu de l'onglet actif
        if (activeTab === 'dashboard') {
            renderDashboardKPIs(totalSpent, deliveryRate, state);
            renderBudgetChart(state);
            renderAgentsStatusList();
            renderDashboardCalendar(state.calendar);
            renderLogFeed();
        } else if (activeTab === 'logframe') {
            renderIndicators();
        } else if (activeTab === 'kanban') {
            renderKanban();
        } else if (activeTab === 'documents') {
            renderDocumentsTable(state.documents);
        } else if (activeTab === 'chat') {
            renderChatAgentsList();
        } else if (activeTab === 'database') {
            renderDatabaseTable();
        }
    }

    // --- RENDU D'ONGLET : Dashboard ---
    function renderDashboardKPIs(totalSpent, deliveryRate, state) {
        document.getElementById('kpi-spent').innerText = `${totalSpent.toLocaleString()} USD`;
        document.getElementById('kpi-spent-rate').innerText = `${deliveryRate}% du budget annuel consommé`;

        // Calcul des indicateurs atteints
        const indicators = state.indicators;
        let completedTargets = 0;
        let sumProgress = 0;
        indicators.forEach(i => {
            const range = i.target - i.baseline;
            const progress = range !== 0 ? ((i.current - i.baseline) / range) * 100 : 0;
            sumProgress += progress;
            if (progress >= 100) completedTargets++;
        });
        const avgProgress = (sumProgress / indicators.length).toFixed(1);

        document.getElementById('kpi-targets').innerText = `${completedTargets} / ${indicators.length}`;
        document.getElementById('kpi-targets-avg').innerText = `${avgProgress}% de progression moyenne ODD`;

        // Activités Kanban
        const totalActs = state.activities.length;
        const doneActs = state.activities.filter(a => a.status === 'done').length;
        document.getElementById('kpi-activities').innerText = `${doneActs} / ${totalActs}`;
        document.getElementById('kpi-activities-status').innerText = `${state.activities.filter(a => a.status === 'in_progress').length} en cours, ${state.activities.filter(a => a.status === 'todo').length} planifiées`;

        // Événements calendrier
        document.getElementById('kpi-calendar').innerText = `${state.calendar.length} Jalons`;
        const upcoming = state.calendar.slice(0, 1)[0];
        document.getElementById('kpi-calendar-next').innerText = upcoming ? `Prochain: ${upcoming.title} (${upcoming.date})` : 'Aucun jalon planifié';
    }

    function renderBudgetChart(state) {
        const container = document.getElementById('budget-chart-container');
        container.innerHTML = '';

        // Regrouper le budget et les dépenses réelles par Composante/Produit
        const outputs = {
            "Produit 1": { title: "P1: Énergie Propre", budget: 0, spent: 0 },
            "Produit 2": { title: "P2: Finance Verte", budget: 0, spent: 0 },
            "Produit 3": { title: "P3: Gouvernance M&E", budget: 0, spent: 0 }
        };

        state.activities.forEach(act => {
            const key = act.output.split(' : ')[0]; // Extraire "Produit 1"
            if (outputs[key]) {
                outputs[key].budget += act.budget;
                outputs[key].spent += act.spent;
            }
        });

        // Trouver la valeur maximale pour mettre à l'échelle
        let maxVal = 10000;
        for (const out of Object.values(outputs)) {
            if (out.budget > maxVal) maxVal = out.budget;
            if (out.spent > maxVal) maxVal = out.spent;
        }

        // Générer le code HTML des barres
        for (const [key, data] of Object.entries(outputs)) {
            const budgetHeight = (data.budget / maxVal) * 80; // Pourcentage de la hauteur max du graphe
            const spentHeight = (data.spent / maxVal) * 80;
            const rate = data.budget > 0 ? ((data.spent / data.budget) * 100).toFixed(0) : 0;

            const group = document.createElement('div');
            group.className = 'chart-bar-group';
            group.innerHTML = `
                <div class="chart-bars">
                    <div class="bar-budget" style="height: ${budgetHeight}%;" title="Budget: ${data.budget.toLocaleString()} USD">
                        <span class="chart-bar-value" style="color: var(--color-primary-light);">${Math.round(data.budget/1000)}k</span>
                    </div>
                    <div class="bar-spent" style="height: ${spentHeight}%;" title="Dépense: ${data.spent.toLocaleString()} USD">
                        <span class="chart-bar-value" style="color: var(--color-rose);">${Math.round(data.spent/1000)}k</span>
                    </div>
                </div>
                <div class="chart-label">
                    <div>${data.title}</div>
                    <strong style="color: var(--color-emerald); font-size: 0.75rem;">DR: ${rate}%</strong>
                </div>
            `;
            container.appendChild(group);
        }
    }

    function renderAgentsStatusList() {
        if (AGENTS.updateAgentSPECFromDb) AGENTS.updateAgentSPECFromDb();
        const list = document.getElementById('agents-status-list');
        list.innerHTML = '';

        for (const [id, agent] of Object.entries(AGENTS.AGENTS)) {
            const item = document.createElement('div');
            item.className = 'agent-status-item';
            item.innerHTML = `
                <div class="agent-avatar-circle" style="border-color: ${agent.color}; background: ${agent.color}20;">
                    ${agent.avatar}
                </div>
                <div class="agent-meta-info">
                    <div class="agent-meta-name">${agent.name}</div>
                    <div class="agent-meta-role">${agent.role}</div>
                </div>
                <div class="agent-status-pulse" style="background-color: ${agent.color}; box-shadow: 0 0 8px ${agent.color};"></div>
            `;
            list.appendChild(item);
        }
    }

    function renderDashboardCalendar(events) {
        const list = document.getElementById('dashboard-calendar-list');
        list.innerHTML = '';
        
        events.slice(0, 3).forEach(e => {
            const item = document.createElement('li');
            item.className = 'calendar-item';
            
            let color = 'var(--color-primary)';
            if (e.type === 'mission') color = 'var(--color-rose)';
            if (e.type === 'audit') color = 'var(--color-amber)';

            item.style.borderLeftColor = color;
            item.innerHTML = `
                <div class="cal-details">
                    <span class="cal-title">${e.title}</span>
                    <span class="cal-desc">${e.description}</span>
                </div>
                <span class="cal-date-badge">${new Date(e.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
            `;
            list.appendChild(item);
        });
    }

    function renderLogFeed() {
        const feed = document.getElementById('dashboard-log-feed');
        if (!feed) return;
        feed.innerHTML = '';

        const state = DB.getDbState();
        state.logs.slice(0, 10).forEach(log => {
            const time = new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const entry = document.createElement('div');
            entry.className = `log-entry log-${log.category.replace(/ /g, '')}`;
            entry.innerHTML = `
                <span class="log-timestamp">[${time}]</span>
                <span class="log-cat" style="color: ${getAgentColor(log.category)};">${log.category} :</span>
                <span class="log-text">${log.text}</span>
            `;
            feed.appendChild(entry);
        });
    }

    function getAgentColor(catName) {
        if (catName === 'Chef de Projet') return 'var(--color-indigo)';
        if (catName === 'Suivi-Evaluation') return 'var(--color-rose)';
        if (catName === 'Programme') return 'var(--color-cyan)';
        if (catName === 'Comptable') return 'var(--color-amber)';
        if (catName === 'Finances') return 'var(--color-emerald)';
        return 'var(--color-primary-light)';
    }

    // --- RENDU D'ONGLET : Cadre Logique ---
    function renderIndicators() {
        const grid = document.getElementById('indicators-grid');
        grid.innerHTML = '';

        const indicators = DB.getIndicators();
        indicators.forEach(ind => {
            // Calculer le taux de réalisation
            const range = ind.target - ind.baseline;
            const currentOffset = ind.current - ind.baseline;
            const percent = range !== 0 ? ((currentOffset / range) * 100).toFixed(1) : 0;
            const cappedPercent = Math.min(100, Math.max(0, percent));

            const card = document.createElement('div');
            card.className = 'indicator-card';
            card.innerHTML = `
                <div class="ind-card-header">
                    <span class="ind-code-badge">${ind.code}</span>
                    <span class="ind-sdg-tag">${ind.sdg}</span>
                </div>
                <div class="ind-name">${ind.name}</div>
                <div class="ind-progress-section">
                    <div class="ind-values-row">
                        <span>Réf: ${ind.baseline} ${ind.unit}</span>
                        <strong style="color: var(--text-main); font-size: 1rem;">Actuel: ${ind.current} ${ind.unit}</strong>
                        <span>Cible: ${ind.target} ${ind.unit}</span>
                    </div>
                    <div class="ind-progress-bar-bg">
                        <div class="ind-progress-bar-fill" style="width: ${cappedPercent}%;"></div>
                    </div>
                    <div class="ind-footer-row">
                        <span class="ind-updated">Mise à jour: ${ind.lastUpdated}</span>
                        <button class="btn btn-outline-primary btn-sm" onclick="app.showUpdateIndicatorPrompt('${ind.id}', ${ind.current})">
                            ✏️ Corriger la Mesure
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function showUpdateIndicatorPrompt(indId, currentVal) {
        const val = prompt(`Saisissez la nouvelle mesure de terrain constatée :`, currentVal);
        if (val !== null && !isNaN(val)) {
            DB.updateIndicator(indId, Number(val), "Suivi-Evaluation");
            renderIndicators();
        }
    }

    // --- RENDU D'ONGLET : Kanban ---
    function renderKanban() {
        const filter = document.getElementById('kanban-quarter-filter').value;
        
        // Vider les colonnes
        document.getElementById('cards-todo').innerHTML = '';
        document.getElementById('cards-in_progress').innerHTML = '';
        document.getElementById('cards-review').innerHTML = '';
        document.getElementById('cards-done').innerHTML = '';

        const activities = DB.getActivities();
        const counts = { todo: 0, in_progress: 0, review: 0, done: 0 };

        activities.forEach(act => {
            // Filtrer par trimestre
            if (filter !== 'all' && act.quarter !== filter) return;

            counts[act.status]++;

            const card = document.createElement('div');
            card.className = 'kanban-card';
            card.setAttribute('draggable', 'true');
            card.innerHTML = `
                <div class="kcard-header">
                    <span class="kcard-code">${act.code}</span>
                    <span class="kcard-quarter">${act.quarter}</span>
                </div>
                <div class="kcard-title">${act.title}</div>
                <div class="kcard-meta">
                    <span class="kcard-budget" title="Budget engagé">${act.budget.toLocaleString()} $</span>
                    <span class="kcard-agent">${act.assignedTo}</span>
                    <select class="kcard-status-select" onchange="app.changeActivityStatus('${act.id}', this.value)">
                        <option value="todo" ${act.status === 'todo' ? 'selected' : ''}>À Faire</option>
                        <option value="in_progress" ${act.status === 'in_progress' ? 'selected' : ''}>En Cours</option>
                        <option value="review" ${act.status === 'review' ? 'selected' : ''}>En Revue</option>
                        <option value="done" ${act.status === 'done' ? 'selected' : ''}>Terminé</option>
                    </select>
                </div>
            `;
            
            document.getElementById(`cards-${act.status}`).appendChild(card);
        });

        // Renseigner les compteurs
        document.getElementById('count-todo').innerText = counts.todo;
        document.getElementById('count-in_progress').innerText = counts.in_progress;
        document.getElementById('count-review').innerText = counts.review;
        document.getElementById('count-done').innerText = counts.done;
    }

    function changeActivityStatus(actId, newStatus) {
        DB.updateActivity(actId, { status: newStatus });
        
        // Ajuster automatiquement les dépenses si validé
        const activities = DB.getActivities();
        const act = activities.find(a => a.id === actId);
        
        if (newStatus === 'done' && act.spent === 0) {
            DB.updateActivity(actId, { spent: act.budget });
            DB.logEvent("Comptable", `Activité ${act.code} complétée. Ajustement automatique des dépenses réelles à 100% (soit ${act.budget} USD).`);
        }
        
        renderKanban();
    }

    // --- RENDU D'ONGLET : Centre de Documents ---
    function renderDocumentsTable(documents) {
        const tbody = document.getElementById('documents-table-body');
        tbody.innerHTML = '';

        documents.forEach(doc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>📁 ${doc.name}</strong></td>
                <td>${doc.date}</td>
                <td><span class="badge-review">${doc.type}</span></td>
                <td>${doc.size}</td>
                <td>${doc.uploadedBy}</td>
                <td>
                    <button class="btn btn-outline-primary btn-sm" onclick="alert('Téléchargement du fichier de terrain (${doc.name}) simulé avec succès.')">
                        ⬇ Ouvrir
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function getSectorAvatar(sector) {
        if (sector.includes("Environnement")) return "🌿";
        if (sector.includes("Agri")) return "🚜";
        if (sector.includes("Genre")) return "♀";
        if (sector.includes("Santé")) return "🏥";
        return "🧬";
    }
    function getSectorColor(sector) {
        if (sector.includes("Environnement")) return "#22c55e";
        if (sector.includes("Agri")) return "#eab308";
        if (sector.includes("Genre")) return "#ec4899";
        if (sector.includes("Santé")) return "#ef4444";
        return "#64748b";
    }
    function getSectorSDG(sector) {
        if (sector.includes("Environnement")) return "ODD 7 / ODD 13";
        if (sector.includes("Agri")) return "ODD 2 / ODD 15";
        if (sector.includes("Genre")) return "ODD 5 - Égalité des Sexes";
        if (sector.includes("Santé")) return "ODD 3 - Bonne Santé";
        return "ODD 11 - Villes Durables";
    }

    // Traiter la soumission d'un TDR (Appel API externe ou locale)
    async function processTDRSubmission() {
        const text = document.getElementById('tdr-input-text').value;
        if (!text.trim()) {
            alert("Veuillez coller le contenu des Termes de Référence (TDR) avant d'analyser.");
            return;
        }

        const btn = document.querySelector('button[onclick="app.processTDRSubmission()"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = "⏳ Analyse en cours via API...";
        btn.disabled = true;

        try {
            let proposal = null;
            let sectorDetected = null;

            if (window.USE_BACKEND) {
                // Tenter d'utiliser Gemini via le serveur backend
                const apiRes = await fetch('/api/analyze-tdr', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tdrText: text })
                });

                if (apiRes.ok) {
                    const data = await apiRes.json();
                    
                    if (data.error === "apiKey_missing") {
                        DB.logEvent("SYSTEM", "Clé API Gemini absente. Analyse sectorielle de repli activée.");
                        await AGENTS.analyzeTDRWithExternalAPI(text);
                    } else if (data.sector) {
                        sectorDetected = data.sector;
                        DB.logEvent("SYSTEM", `TDR analysé par Gemini ! Secteur détecté : ${data.sector}`);
                        
                        // Mettre à jour les métadonnées de l'agent spécialiste dans la DB
                        DB.updateSpecialistAgent({
                            sector: data.sector,
                            title: data.title || `Expert en ${data.sector}`,
                            avatar: getSectorAvatar(data.sector),
                            color: getSectorColor(data.sector),
                            bio: `Analyste d'expertise sectorielle en ${data.sector} pour la GESTION DES PROJETS ET PROGRAMME DU MALI.`,
                            sdg: getSectorSDG(data.sector),
                            recommendation: data.recommendation
                        });
                        
                        // Mettre à jour l'agent en mémoire
                        AGENTS.updateAgentSPECFromDb();
                    }
                }
            } else {
                // Utiliser le fallback sémantique local (httpbin.org)
                await AGENTS.analyzeTDRWithExternalAPI(text);
            }

            // Générer la proposition d'activité locale à insérer
            proposal = AGENTS.analyzeTDR(text);
            proposal.assignedTo = "Spécialiste";
            currentTDRProposal = proposal;

            // Afficher l'aperçu du résultat
            document.getElementById('tdr-res-title').innerText = proposal.title;
            document.getElementById('tdr-res-budget').innerText = `${proposal.budget.toLocaleString()} USD`;
            document.getElementById('tdr-res-quarter').innerText = proposal.quarter;
            document.getElementById('tdr-res-output').innerText = proposal.output;
            
            document.getElementById('tdr-result-container').classList.remove('hidden');
            
            // Re-rendre le tableau de bord
            renderAll();
        } catch (err) {
            alert("Erreur lors de l'analyse : " + err.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    function confirmTDRActivity() {
        if (!currentTDRProposal) return;

        // 1. Ajouter l'activité dans le Kanban
        const newAct = DB.addActivity({
            title: currentTDRProposal.title,
            budget: currentTDRProposal.budget,
            quarter: currentTDRProposal.quarter,
            output: currentTDRProposal.output,
            assignedTo: currentTDRProposal.assignedTo
        });

        // 2. Ajouter un enregistrement de document dans le centre documentaire
        DB.addDocument({
            name: `TDR_Atelier_${newAct.code.replace(/ /g, '')}.pdf`,
            type: "TDR Analysé",
            size: "145 KB",
            uploadedBy: "Programme (IA)"
        });

        // 3. Ajouter une transaction prévisionnelle / engagement
        DB.addTransaction({
            activityId: newAct.id,
            description: `Provision budgétaire : ${newAct.title}`,
            amount: newAct.budget,
            type: "expense",
            status: "approved",
            loggedBy: "Comptable"
        });

        alert(`Succès ! Nouvelle activité ${newAct.code} insérée dans le plan de travail. Budget alloué.`);
        
        // Reset l'UI du formulaire
        document.getElementById('tdr-input-text').value = '';
        document.getElementById('tdr-result-container').classList.add('hidden');
        currentTDRProposal = null;
        
        renderAll();
    }

    // Traiter un fichier de données terrain CSV
    function processCSVSubmission() {
        const text = document.getElementById('csv-input-text').value;
        if (!text.trim()) {
            alert("Veuillez copier/coller les lignes CSV pour l'analyse.");
            return;
        }

        try {
            const results = AGENTS.analyzeCSVData(text);
            
            // Rendre le tableau
            const tbody = document.getElementById('csv-res-tbody');
            tbody.innerHTML = '';

            results.forEach(res => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${res.code}</strong></td>
                    <td>${res.count} relevés</td>
                    <td><strong class="text-primary">${res.mean} ${res.unit}</strong></td>
                    <td>± ${res.stdDev}</td>
                    <td><span class="text-green">${res.progressPercent}% cible</span></td>
                `;
                tbody.appendChild(tr);
            });

            // Insérer le document
            DB.addDocument({
                name: `Donnees_Terrain_Collecte_${Date.now().toString().substring(8)}.csv`,
                type: "Données de Terrain",
                size: `${Math.round(text.length / 100) / 10} KB`,
                uploadedBy: "Suivi-Évaluation (IA)"
            });

            document.getElementById('csv-result-container').classList.remove('hidden');
            document.getElementById('csv-input-text').value = '';
            
            // Re-rendre
            renderAll();
            alert("Données statistiques de terrain intégrées avec succès. Indicateurs réévalués !");
        } catch (e) {
            alert("Erreur lors de l'analyse statistique : " + e.message);
        }
    }

    // --- RENDU D'ONGLET : Rapports ---
    function previewAgentReport(agentId) {
        const report = AGENTS.generateAgentReport(agentId);
        showReportModal(report.title, report.contentHtml);
    }

    function previewFinalReport() {
        const report = AGENTS.generateFinalDecisionReport();
        showReportModal(report.title, report.contentHtml);
    }

    function previewAgentTDR() {
        const agentId = document.getElementById('tdr-agent-selector').value;
        const report = AGENTS.generateAgentTDR(agentId);
        showReportModal(report.title, report.contentHtml);
    }

    function showReportModal(title, html) {
        document.getElementById('modal-report-title').innerText = title;
        document.getElementById('modal-report-body').innerHTML = html;
        document.getElementById('report-modal').classList.remove('hidden');
    }

    function closeReportModal() {
        document.getElementById('report-modal').classList.add('hidden');
    }

    // --- RENDU D'ONGLET : Console de Coordination (Chat) ---
    function renderChatAgentsList() {
        if (AGENTS.updateAgentSPECFromDb) AGENTS.updateAgentSPECFromDb();
        const list = document.getElementById('chat-members-list');
        list.innerHTML = '';

        for (const [id, agent] of Object.entries(AGENTS.AGENTS)) {
            const card = document.createElement('div');
            card.className = 'chat-member-card';
            card.innerHTML = `
                <span class="cmc-avatar">${agent.avatar}</span>
                <div>
                    <div class="cmc-name">${agent.name}</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted);">${agent.role}</div>
                </div>
            `;
            list.appendChild(card);
        }
    }

    function sendAgentInitialWelcome() {
        const container = document.getElementById('chat-messages-container');
        container.innerHTML = '';
        appendChatMessage("PM", "Bonjour ! Je suis le Chef de Projet (PM) de l'équipe de coordination de la GESTION DES PROJETS ET PROGRAMME DU MALI.\n\nMes collaborateurs Comptable, Financier, Programme, Suivi-Évaluation et Spécialiste Sectoriel sont connectés. Comment puis-je vous aider ?\n\nVous pouvez me demander un bilan financier, un bilan d'évaluation ODD, lancer une réunion d'alignement inter-agents (tapez 'lancer une réunion'), ou déposer vos TDR pour analyse.");
    }

    function appendChatMessage(senderId, text) {
        const container = document.getElementById('chat-messages-container');
        const bubble = document.createElement('div');
        
        const isUser = senderId === 'USER';
        bubble.className = `chat-bubble ${isUser ? 'user-bubble' : ''}`;
        
        const avatar = isUser ? '👤' : AGENTS.AGENTS[senderId].avatar;
        const name = isUser ? 'Vous (Directeur National)' : AGENTS.AGENTS[senderId].name;
        
        bubble.innerHTML = `
            <div class="bubble-avatar">${avatar}</div>
            <div class="bubble-content">
                <div class="bubble-sender sender-${senderId}">${name}</div>
                <div class="bubble-text">${text}</div>
            </div>
        `;
        
        container.appendChild(bubble);
        container.scrollTop = container.scrollHeight;
    }

    async function sendUserMessage() {
        const input = document.getElementById('chat-user-input');
        const text = input.value.trim();
        if (!text) return;

        appendChatMessage('USER', text);
        input.value = '';

        if (window.USE_BACKEND) {
            // Extraire l'historique récent de l'UI
            const history = [];
            const bubbles = document.querySelectorAll('.chat-bubble');
            bubbles.forEach(b => {
                const nameNode = b.querySelector('.bubble-sender');
                const textNode = b.querySelector('.bubble-text');
                if (nameNode && textNode) {
                    history.push({
                        sender: nameNode.innerText,
                        text: textNode.innerText
                    });
                }
            });

            // Afficher l'indicateur de saisie global
            const indicator = document.getElementById('agent-typing-indicator');
            document.getElementById('typing-avatar').innerText = "🧬";
            document.getElementById('typing-name').innerText = "Coordination IA";
            indicator.classList.remove('hidden');

            try {
                const dbSpec = DB.getSpecialistAgent();
                const chatRes = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: text,
                        history: history,
                        currentSector: dbSpec.sector
                    })
                });

                if (chatRes.ok) {
                    const steps = await chatRes.json();
                    indicator.classList.add('hidden');
                    
                    if (steps.error === "apiKey_missing") {
                        DB.logEvent("SYSTEM", "Clé API Gemini absente. Réponses de coordination simulées.");
                        const localSteps = AGENTS.runAgentCoordination(text);
                        executeCoordinationSequence(localSteps, 0);
                    } else if (Array.isArray(steps)) {
                        executeCoordinationSequence(steps, 0);
                    }
                } else {
                    throw new Error("HTTP " + chatRes.status);
                }
            } catch (err) {
                console.error("[Chat API Error]", err);
                indicator.classList.add('hidden');
                const localSteps = AGENTS.runAgentCoordination(text);
                executeCoordinationSequence(localSteps, 0);
            }
        } else {
            // Simulation locale
            const steps = AGENTS.runAgentCoordination(text);
            executeCoordinationSequence(steps, 0);
        }
    }

    function sendSuggestedQuery(text) {
        const input = document.getElementById('chat-user-input');
        if (input) {
            input.value = text;
            sendUserMessage();
        }
    }

    function executeCoordinationSequence(steps, index) {
        const indicator = document.getElementById('agent-typing-indicator');
        
        if (index >= steps.length) {
            indicator.classList.add('hidden');
            return;
        }

        const step = steps[index];
        const agent = AGENTS.AGENTS[step.agent];

        // Configurer l'indicateur de saisie
        document.getElementById('typing-avatar').innerText = agent.avatar;
        document.getElementById('typing-name').innerText = agent.name;
        indicator.classList.remove('hidden');
        
        // Auto-scroll pour voir l'indicateur
        const container = document.getElementById('chat-messages-container');
        container.scrollTop = container.scrollHeight;

        // Délai de réflexion simulé
        setTimeout(() => {
            indicator.classList.add('hidden');
            
            // Enregistrer la pensée dans les logs techniques
            DB.logEvent(agent.name, `[Pensée de coordination] ${step.thought}`);
            
            // Afficher le message d'agent
            appendChatMessage(step.agent, step.message);
            
            // Étape suivante
            executeCoordinationSequence(steps, index + 1);
        }, 1500);
    }

    function clearChat() {
        sendAgentInitialWelcome();
    }

    // --- RENDU D'ONGLET : Exploration Database ---
    function renderDatabaseTable() {
        const tableData = DB.getDbState()[activeDbTable] || [];
        
        const thead = document.querySelector('#db-data-table thead');
        const tbody = document.querySelector('#db-data-table tbody');
        
        thead.innerHTML = '';
        tbody.innerHTML = '';

        if (tableData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Table vide.</td></tr>';
            return;
        }

        // Récupérer les clés pour former les en-têtes
        const keys = Object.keys(tableData[0]);
        
        const headerTr = document.createElement('tr');
        keys.forEach(k => {
            const th = document.createElement('th');
            th.innerText = k;
            headerTr.appendChild(th);
        });
        thead.appendChild(headerTr);

        // Peupler le tableau
        tableData.forEach(row => {
            const tr = document.createElement('tr');
            keys.forEach(k => {
                const td = document.createElement('td');
                const val = row[k];
                if (typeof val === 'object' && val !== null) {
                    td.innerText = JSON.stringify(val);
                } else {
                    td.innerText = val;
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    // Exporter la DB locale en fichier JSON
    function exportDatabase() {
        const stateStr = localStorage.getItem('pnud_multiagent_db_state');
        if (!stateStr) return;

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(stateStr);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "pnud_db_backup.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        
        DB.logEvent("SYSTEM", "Base de données exportée avec succès sous format JSON.");
    }

    // Importer une DB locale depuis un fichier JSON
    function importDatabase(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const parsed = JSON.parse(e.target.result);
                // Vérification simple du schéma
                if (parsed.project && parsed.activities && parsed.indicators) {
                    localStorage.setItem('pnud_multiagent_db_state', JSON.stringify(parsed));
                    alert("Import de la base de données de la GESTION DES PROJETS ET PROGRAMME DU MALI effectué avec succès. Rechargement...");
                    location.reload();
                } else {
                    alert("Erreur de schéma : Le fichier JSON ne correspond pas à une base de GESTION DES PROJETS ET PROGRAMME DU MALI valide.");
                }
            } catch (err) {
                alert("Erreur lors de la lecture du fichier JSON : " + err.message);
            }
        };
        reader.readAsText(file);
    }

    // --- Gestion des Formulaires et Modals ---
    function showNewActivityModal() {
        document.getElementById('activity-modal').classList.remove('hidden');
    }

    function closeActivityModal() {
        document.getElementById('activity-modal').classList.add('hidden');
    }

    function submitActivityForm(e) {
        e.preventDefault();
        const title = document.getElementById('act-title').value;
        const budget = parseInt(document.getElementById('act-budget').value);
        const quarter = document.getElementById('act-quarter').value;
        const output = document.getElementById('act-output').value;
        const assignedTo = document.getElementById('act-assigned').value;

        DB.addActivity({ title, budget, quarter, output, assignedTo });
        
        // Enregistrer la transaction budgétaire
        DB.addTransaction({
            description: `Provision : ${title}`,
            amount: budget,
            type: "expense",
            status: "approved",
            loggedBy: "Comptable"
        });

        closeActivityModal();
        document.getElementById('activity-form').reset();
        renderAll();
        
        alert("Activité enregistrée avec succès.");
    }

    function showNewIndicatorModal() {
        document.getElementById('indicator-modal').classList.remove('hidden');
    }

    document.closeIndicatorModal = function() {
        document.getElementById('indicator-modal').classList.add('hidden');
    }

    function submitIndicatorForm(e) {
        e.preventDefault();
        const name = document.getElementById('ind-name').value;
        const baseline = parseInt(document.getElementById('ind-baseline').value);
        const target = parseInt(document.getElementById('ind-target').value);
        const unit = document.getElementById('ind-unit').value;
        const sdg = document.getElementById('ind-sdg').value;

        const state = DB.getDbState();
        const newInd = {
            id: "ind_" + Date.now(),
            code: `Ind ${state.indicators.length + 1}.1`,
            name: name,
            baseline: baseline,
            target: target,
            current: baseline, // Par défaut la valeur actuelle est la référence
            unit: unit,
            sdg: sdg,
            outputId: "Produit 2",
            category: "Général",
            lastUpdated: new Date().toISOString().split('T')[0]
        };

        state.indicators.push(newInd);
        DB.saveDbState(state);
        DB.logEvent("Suivi-Evaluation", `Nouvel indicateur créé : ${newInd.code} - ${newInd.name}`);

        document.getElementById('indicator-modal').classList.add('hidden');
        document.getElementById('indicator-form').reset();
        renderAll();
        
        alert("Indicateur enregistré avec succès.");
    }

    // Rendre les fonctions d'interface accessibles à l'objet global window
    return {
        init,
        changeActivityStatus,
        processTDRSubmission,
        confirmTDRActivity,
        processCSVSubmission,
        previewAgentReport,
        previewFinalReport,
        closeReportModal,
        sendUserMessage,
        sendSuggestedQuery,
        clearChat,
        exportDatabase,
        importDatabase,
        showNewActivityModal,
        closeActivityModal,
        submitActivityForm,
        showNewIndicatorModal,
        closeIndicatorModal: function() { document.getElementById('indicator-modal').classList.add('hidden'); },
        submitIndicatorForm,
        showUpdateIndicatorPrompt,
        previewAgentTDR
    };
})();

// Lancer au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
    app.init();
});
