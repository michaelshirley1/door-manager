const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ENV_FILE = path.join(__dirname, '.env');
const DEFAULT_API_URL = 'https://localhost:64868';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question, defaultValue) {
    return new Promise(resolve => {
        const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
        rl.question(prompt, answer => resolve(answer.trim() || defaultValue || ''));
    });
}

function readExistingEnv() {
    if (!fs.existsSync(ENV_FILE)) return {};
    const values = {};
    for (const line of fs.readFileSync(ENV_FILE, 'utf8').split('\n')) {
        const [key, ...rest] = line.split('=');
        if (key && rest.length) values[key.trim()] = rest.join('=').trim();
    }
    return values;
}

async function main() {
    console.log('\nDoorShop Admin — Setup\n');

    const existing = readExistingEnv();

    const apiUrl = await ask('API URL', existing.API_URL || DEFAULT_API_URL);

    const envContent = `API_URL=${apiUrl}\n`;
    fs.writeFileSync(ENV_FILE, envContent);
    console.log(`\n.env written.`);

    const installDeps = await ask('Install dependencies? (y/n)', 'y');
    if (installDeps.toLowerCase() === 'y') {
        console.log('\nRunning npm install...');
        execSync('npm install', { stdio: 'inherit' });
    }

    console.log('\nSetup complete. Run "npm start" to start the dev server.\n');
    rl.close();
}

main().catch(err => {
    console.error(err);
    rl.close();
    process.exit(1);
});
