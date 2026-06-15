const fs = require('fs');
const path = require('path');

const dir = '/Users/saulmartinez/Downloads/Comecyt/Comecyt/RedesSociales/src/pages/contenido';
const files = [];
for (let i = 1; i <= 31; i++) {
    const filename = `modulo_1_contenido_${i}`;
    const file = fs.readdirSync(dir).find(f => f.startsWith(filename) && f.endsWith('.jsx'));
    if (file && !files.includes(file)) files.push(file);
}

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

let fixedCount = 0;
let errors = [];

for (const file of files) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // 1. Remove ANY existing finalizarContenido block (it might be duplicated or misplaced)
    // We match from "const finalizarContenido = async () => {" down to its closing "  };"
    // Since we know the exact string we inserted (or very similar):
    const regexFinalizarBlock = /const finalizarContenido = async \(\) => \{[\s\S]*?finally \{\s*setGuardando\(false\);\s*\}\s*\};\s*/g;
    content = content.replace(regexFinalizarBlock, '');

    // 2. Remove ANY existing irSiguiente, handleNext, etc. just in case
    content = content.replace(/const irSiguiente = (?:async )?\(\) => \{[\s\S]*?finally \{\s*setGuardando\(false\);\s*\}\s*\};\s*/g, '');
    content = content.replace(/const irSiguiente = (?:async )?\(\) => \{[\s\S]*?\}\s*\};\s*/g, ''); // fallback
    // For specific files like 9, it had: const irSiguiente = async () => { ... }
    const regexIrSig = /\/\/ ✅ CAMBIO 3: irSiguiente con fix para último contenido[\s\S]*?const irSiguiente = async \(\) => \{[\s\S]*?finally \{\s*setGuardando\(false\);\s*\}\s*\};\s*/g;
    content = content.replace(regexIrSig, '');

    const regexIrSig2 = /const irSiguiente = async \(\) => \{[\s\S]*?finally \{\s*setGuardando\(false\);\s*\}\s*\};\s*/g;
    content = content.replace(regexIrSig2, '');

    const regexHandleNext = /const handleNext = async \(\) => \{[\s\S]*?finally \{\s*setGuardando\(false\);\s*\}\s*\};\s*/g;
    content = content.replace(regexHandleNext, '');

    const regexHandleSiguiente = /const handleSiguiente = async \(\) => \{[\s\S]*?finally \{\s*setGuardando\(false\);\s*\}\s*\};\s*/g;
    content = content.replace(regexHandleSiguiente, '');

    const regexSiguienteContenido = /const siguienteContenido = async \(\) => \{[\s\S]*?finally \{\s*setGuardando\(false\);\s*\}\s*\};\s*/g;
    content = content.replace(regexSiguienteContenido, '');


    // Now find the LAST `return (` or `return <div` to insert before it
    const lines = content.split('\n');
    let lastReturnIndex = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes('return') && (lines[i].includes('(') || lines[i+1]?.includes('<') || lines[i].includes('<div'))) {
            // Also ensure it is the main component return by checking indentation
            // It should be indented with 2 spaces max
            if (lines[i].match(/^\s{0,2}return/)) {
                lastReturnIndex = i;
                break;
            }
        }
    }

    if (lastReturnIndex !== -1) {
        lines.splice(lastReturnIndex, 0, finalizarContenidoStr);
        content = lines.join('\n');
    } else {
        errors.push(file + " - no last return found");
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        fixedCount++;
    }
}

console.log("Archivos corregidos:", fixedCount);
if (errors.length > 0) {
    console.error("Errores:", errors);
}
