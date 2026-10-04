const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const projectDir = __dirname;
const startupFolder = path.join(
    process.env.APPDATA,
    'Microsoft',
    'Windows',
    'Start Menu',
    'Programs',
    'Startup'
);

// 1. Créer le fichier run.bat
const runBatContent = `@echo off\r\ncd /d "${projectDir}"\r\nnode server.js\r\n`;
const runBatPath = path.join(projectDir, 'run.bat');
fs.writeFileSync(runBatPath, runBatContent, 'utf8');
console.log("Fichier run.bat créé.");

// 2. Créer le fichier launch_silent.vbs
const vbsContent = `Set WshShell = CreateObject("WScript.Shell")\r\nWshShell.Run """C:\\Program Files\\nodejs\\node.exe"" ""${path.join(projectDir, 'server.js')}""", 0, false\r\n`;
const vbsPath = path.join(projectDir, 'launch_silent.vbs');
fs.writeFileSync(vbsPath, vbsContent, 'utf8');
console.log("Fichier launch_silent.vbs créé.");

// 3. Créer un script temporaire VBS pour générer un raccourci dans le dossier de démarrage
const shortcutPath = path.join(startupFolder, 'MaliAgentsDashboard.lnk');
const tempVbsPath = path.join(projectDir, 'temp_shortcut.vbs');
const createShortcutVbs = `
Set WshShell = CreateObject("WScript.Shell")
Set shortcut = WshShell.CreateShortcut("${shortcutPath.replace(/\\/g, '\\\\')}")
shortcut.TargetPath = "${vbsPath.replace(/\\/g, '\\\\')}"
shortcut.WorkingDirectory = "${projectDir.replace(/\\/g, '\\\\')}"
shortcut.Description = "Demarrage automatique du serveur GESTION DES PROJETS ET PROGRAMME DU MALI"
shortcut.Save
`;

fs.writeFileSync(tempVbsPath, createShortcutVbs, 'utf8');

exec(`cscript //nologo "${tempVbsPath}"`, (err) => {
    try {
        if (fs.existsSync(tempVbsPath)) {
            fs.unlinkSync(tempVbsPath);
        }
    } catch (e) {}

    if (err) {
        console.error("Erreur lors de la création du raccourci dans le dossier de démarrage :", err);
    } else {
        console.log("Raccourci de démarrage créé avec succès dans le dossier de démarrage Windows !");
        console.log("L'application démarrera désormais automatiquement et silencieusement à chaque allumage de l'ordinateur.");
    }
});
