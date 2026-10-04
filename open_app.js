const { exec } = require('child_process');
const http = require('http');
const path = require('path');

const portsToTry = [3000, 3001, 3002, 3003, 3004, 3005];

function checkPort(port) {
    return new Promise((resolve) => {
        const req = http.get(`http://127.0.0.1:${port}/api/state`, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => {
            resolve(false);
        });
        req.setTimeout(400, () => {
            req.destroy();
            resolve(false);
        });
    });
}

async function main() {
    let activePort = null;
    for (const port of portsToTry) {
        const isUp = await checkPort(port);
        if (isUp) {
            activePort = port;
            break;
        }
    }

    if (activePort) {
        console.log(`Serveur actif trouvé sur le port ${activePort}. Ouverture dans le navigateur...`);
        exec(`start http://localhost:${activePort}`);
    } else {
        console.log("Le serveur n'est pas actif. Démarrage silencieux du serveur...");
        const vbsPath = path.join(__dirname, 'launch_silent.vbs');
        exec(`wscript.exe "${vbsPath}"`, async (err) => {
            if (err) {
                console.error("Erreur de démarrage du serveur :", err);
                return;
            }
            // Attendre 2 secondes que le serveur s'initialise et ré-essayer de trouver le port
            setTimeout(async () => {
                for (const port of portsToTry) {
                    const isUp = await checkPort(port);
                    if (isUp) {
                        activePort = port;
                        break;
                    }
                }
                if (activePort) {
                    exec(`start http://localhost:${activePort}`);
                } else {
                    console.log("Le serveur a démarré mais aucun port actif n'a été détecté dans les temps.");
                }
            }, 2000);
        });
    }
}

main();
