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
    let stateLinesToMove = [];
    
    const toRemove = [
      'const [puedeAvanzar, setPuedeAvanzar] = useState(false);',
      'const [guardando, setGuardando] = useState(false);',
      'const [progresoCargado, setProgresoCargado] = useState(false);'
    ];

    let removed = { puedeAvanzar: false, guardando: false, progresoCargado: false };

    for (let j = 0; j < lines.length; j++) {
        const line = lines[j];
        if (toRemove.some(s => line.includes(s))) {
            if (line.includes('puedeAvanzar')) removed.puedeAvanzar = true;
            if (line.includes('guardando')) removed.guardando = true;
            if (line.includes('progresoCargado')) removed.progresoCargado = true;
        } else {
            newLines.push(line);
        }
    }

    let insertIndex = -1;
    for (let j = 0; j < newLines.length; j++) {
        if (newLines[j].includes('const navigate = useNavigate();')) {
            insertIndex = j + 1;
            break;
        }
    }
    if (insertIndex === -1) {
        for (let j = 0; j < newLines.length; j++) {
            if (newLines[j].includes('export default function')) {
                insertIndex = j + 1;
                break;
            }
        }
    }

    if (insertIndex !== -1) {
        if (removed.puedeAvanzar) newLines.splice(insertIndex, 0, '  const [puedeAvanzar, setPuedeAvanzar] = useState(false);');
        if (removed.guardando) newLines.splice(insertIndex, 0, '  const [guardando, setGuardando] = useState(false);');
        if (removed.progresoCargado) newLines.splice(insertIndex, 0, '  const [progresoCargado, setProgresoCargado] = useState(false);');
    }

    content = newLines.join('\n');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
    }
}
