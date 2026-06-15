const fs = require('fs');
const path = require('path');

const dir = '/Users/saulmartinez/Downloads/Comecyt/Comecyt/RedesSociales/src/pages/contenido';

for (let i = 1; i <= 31; i++) {
    const filename = "modulo_1_contenido_" + i;
    const file = fs.readdirSync(dir).find(f => f.startsWith(filename) && f.endsWith('.jsx'));
    if (!file) continue;

    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    const lines = content.split('\n');
    let newLines = [];
    
    for (let j = 0; j < lines.length; j++) {
        const line = lines[j];
        if (!line.includes('const [puedeAvanzar, setPuedeAvanzar] = useState(false);')) {
            newLines.push(line);
        }
    }

    content = newLines.join('\n');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
    }
}
