const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const projectDir = __dirname;
const desktopPath = path.join('C:', 'Users', 'Mr Barry', 'Desktop');
const shortcutPath = path.join(desktopPath, 'Gestion Projets Mali.lnk');
const batPath = path.join(projectDir, 'open_app.bat');

console.log("Creation du raccourci sur le Bureau...");

// Créer un script temporaire VBScript pour générer le raccourci sur le bureau
const tempVbsPath = path.join(projectDir, 'temp_desktop_shortcut.vbs');
const createShortcutVbs = `
Set WshShell = CreateObject("WScript.Shell")
Set shortcut = WshShell.CreateShortcut("${shortcutPath.replace(/\\/g, '\\\\')}")
shortcut.TargetPath = "${batPath.replace(/\\/g, '\\\\')}"
shortcut.WorkingDirectory = "${projectDir.replace(/\\/g, '\\\\')}"
shortcut.Description = "Lancer le Dashboard GESTION DES PROJETS ET PROGRAMME DU MALI"
shortcut.IconLocation = "shell32.dll, 14" ' Icone de globe/reseau/monde
shortcut.WindowStyle = 7 ' Lance la fenetre batch en mode minimise
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
        console.error("Erreur de creation du raccourci sur le bureau :", err);
    } else {
        console.log("Raccourci de Bureau cree avec succes !");
    }
});
