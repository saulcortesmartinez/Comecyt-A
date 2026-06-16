const fs = require('fs');
const path = require('path');

const dir = '/Users/saulmartinez/Downloads/Comecyt/Comecyt/RedesSociales/src/pages/contenido';
const files = [];
for (let i = 1; i <= 31; i++) {
    const filename = `modulo_1_contenido_${i}`;
    const file = fs.readdirSync(dir).find(f => f.startsWith(filename) && f.endsWith('.jsx'));
    if (file && !files.includes(file)) files.push(file);
}
// don't touch 32_Reto.jsx since we did it manually and user said it's ok

const finalizarContenidoStr = `
  const finalizarContenido = async () => {
    console.log('🚀 [DEBUG] puedeAvanzar:', puedeAvanzar);
    console.log('🚀 [DEBUG] progresoCargado:', progresoCargado);
    
    if (!puedeAvanzar) {
        console.log('❌ [DEBUG] No puede avanzar aún');
        return;
    }
    setGuardando(true);
    const correo = localStorage.getItem("correo");
    try {
        if (correo) {
            console.log('📤 Enviando:', { 
                correo, 
                modulo_id: MODULO_ID, 
                progreso_actual: NUM_CONTENIDO 
            });
            const response = await axios.post(\`\${API_URL}/api/alumno/progreso/actualizar\`, {
                correo,
                modulo_id: MODULO_ID,
                progreso_actual: NUM_CONTENIDO,
            });
            console.log('💾 Respuesta COMPLETA:', response.data);
            if (response.status === 200 && response.data.progreso_actual) {
                console.log('✅ [DEBUG] Entrando al navigate');
                window.scrollTo(0, 0);
                navigate(\`/modulo/\${MODULO_ID}/contenido/\${NUM_CONTENIDO + 1}\`);
            } else {
                console.log('❌ [DEBUG] Error en respuesta:', response.data);
                alert('Error al guardar progreso. Intenta de nuevo.');
            }
        }
    } catch (err) {
        console.error("❌ Error al guardar:", err.response?.data || err);
        alert('Error de conexión al guardar progreso');
    } finally {
        setGuardando(false);
    }
  };
`;

let failedFiles = [];

for (const file of files) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf-8');
    let needsSave = false;

    // 1. Check if it has finalizarContenido
    if (!content.includes('const finalizarContenido')) {
        failedFiles.push({ file, missing: 'finalizarContenido' });
        // Try to insert it before the last return (
        const lines = content.split('\n');
        let returnIndex = -1;
        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].includes('return') && (lines[i].includes('(') || lines[i+1]?.includes('<'))) {
                returnIndex = i;
                break;
            }
        }
        if (returnIndex !== -1) {
            lines.splice(returnIndex, 0, finalizarContenidoStr);
            content = lines.join('\n');
            needsSave = true;
        } else {
            console.error("No se pudo encontrar un return en " + file);
        }
    }

    // 2. Check for useStates
    const statesToAdd = [];
    if (!content.includes('const [guardando,')) statesToAdd.push('  const [guardando, setGuardando] = useState(false);');
    if (!content.includes('const [progresoCargado,')) statesToAdd.push('  const [progresoCargado, setProgresoCargado] = useState(false);');
    if (!content.includes('const [puedeAvanzar,')) statesToAdd.push('  const [puedeAvanzar, setPuedeAvanzar] = useState(false);');

    if (statesToAdd.length > 0) {
        const lastMissingState = statesToAdd.join('\n');
        failedFiles.push({ file, missing: statesToAdd.map(s => s.trim()) });
        
        // Find last useState
        const lines = content.split('\n');
        let lastStateIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('useState(')) {
                lastStateIndex = i;
            }
        }
        if (lastStateIndex !== -1) {
            lines.splice(lastStateIndex + 1, 0, lastMissingState);
            content = lines.join('\n');
            needsSave = true;
        } else {
            // Find component start
            let compIndex = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('export default function')) {
                    compIndex = i;
                    break;
                }
            }
            if (compIndex !== -1) {
                lines.splice(compIndex + 1, 0, lastMissingState);
                content = lines.join('\n');
                needsSave = true;
            }
        }
    }

    if (needsSave) {
        fs.writeFileSync(filePath, content, 'utf-8');
    }
}

console.log("Archivos arreglados:", JSON.stringify(failedFiles, null, 2));
