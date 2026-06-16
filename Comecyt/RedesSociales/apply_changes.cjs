const fs = require('fs');
const path = require('path');

const dir = '/Users/saulmartinez/Downloads/Comecyt/Comecyt/RedesSociales/src/pages/contenido';

const files = [
    'modulo_1_contenido_1.jsx', 'modulo_1_contenido_2.jsx', 'modulo_1_contenido_3.jsx', 
    'modulo_1_contenido_4.jsx', 'modulo_1_contenido_5.jsx', 'modulo_1_contenido_6.jsx',
    'modulo_1_contenido_7.jsx', 'modulo_1_contenido_8_Eval.jsx', 'modulo_1_contenido_9.jsx',
    'modulo_1_contenido_10.jsx', 'modulo_1_contenido_11.jsx', 'modulo_1_contenido_12.jsx',
    'modulo_1_contenido_13.jsx', 'modulo_1_contenido_14_Eval.jsx', 'modulo_1_contenido_15.jsx',
    'modulo_1_contenido_16.jsx', 'modulo_1_contenido_17.jsx', 'modulo_1_contenido_18.jsx',
    'modulo_1_contenido_19.jsx', 'modulo_1_contenido_20.jsx', 'modulo_1_contenido_21_Eval.jsx',
    'modulo_1_contenido_22.jsx', 'modulo_1_contenido_23.jsx', 'modulo_1_contenido_24.jsx',
    'modulo_1_contenido_25.jsx', 'modulo_1_contenido_26.jsx', 'modulo_1_contenido_27.jsx',
    'modulo_1_contenido_28.jsx', 'modulo_1_contenido_29_Eval.jsx', 'modulo_1_contenido_30_Reto.jsx',
    'modulo_1_contenido_31_Reto.jsx'
];

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

let modifiedCount = 0;

for (const file of files) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Agregar import axios si no existe
    if (!content.includes('import axios')) {
        const importMatch = content.match(/import .*?;?\n/g);
        if (importMatch) {
            const lastImport = importMatch[importMatch.length - 1];
            content = content.replace(lastImport, lastImport + 'import axios from "axios";\n');
        } else {
            content = 'import axios from "axios";\n' + content;
        }
    }

    // 2. Agregar states faltantes después del último useState
    const useStateMatches = [...content.matchAll(/const \[[a-zA-Z0-9_]+,\s*set[a-zA-Z0-9_]+\] = useState\([^)]*\);/g)];
    if (useStateMatches.length > 0) {
        const lastUseState = useStateMatches[useStateMatches.length - 1][0];
        let statesToAdd = [];
        
        if (!content.includes('guardando')) {
            statesToAdd.push('  const [guardando, setGuardando] = useState(false);');
        }
        if (!content.includes('progresoCargado')) {
            statesToAdd.push('  const [progresoCargado, setProgresoCargado] = useState(false);');
        }
        if (!content.includes('puedeAvanzar')) {
            statesToAdd.push('  const [puedeAvanzar, setPuedeAvanzar] = useState(false);');
        }

        if (statesToAdd.length > 0) {
            content = content.replace(lastUseState, lastUseState + '\n' + statesToAdd.join('\n'));
        }
    }

    // 3. Reemplazar o insertar finalizarContenido
    const regexFinalizar = /const finalizarContenido = (?:async )?\(\) => \{[\s\S]*?\n  \};\n/g;
    const regexIrSiguiente = /const irSiguiente = (?:async )?\(\) => \{[\s\S]*?\n  \};\n/g;
    const regexHandleNext = /const handleNext = (?:async )?\(\) => \{[\s\S]*?\n  \};\n/g;
    const regexHandleSiguiente = /const handleSiguiente = (?:async )?\(\) => \{[\s\S]*?\n  \};\n/g;
    const regexSiguienteContenido = /const siguienteContenido = (?:async )?\(\) => \{[\s\S]*?\n  \};\n/g;

    let replaced = false;
    if (regexFinalizar.test(content)) {
        content = content.replace(regexFinalizar, finalizarContenidoStr + '\n');
        replaced = true;
    } else if (regexIrSiguiente.test(content)) {
        content = content.replace(regexIrSiguiente, finalizarContenidoStr + '\n');
        replaced = true;
    } else if (regexHandleNext.test(content)) {
        content = content.replace(regexHandleNext, finalizarContenidoStr + '\n');
        replaced = true;
    } else if (regexHandleSiguiente.test(content)) {
        content = content.replace(regexHandleSiguiente, finalizarContenidoStr + '\n');
        replaced = true;
    } else if (regexSiguienteContenido.test(content)) {
        content = content.replace(regexSiguienteContenido, finalizarContenidoStr + '\n');
        replaced = true;
    } else {
        // Insertar antes del return del componente principal
        const returnMatch = content.match(/\n\s*return\s*\(\s*<div/);
        if (returnMatch) {
            content = content.replace(returnMatch[0], finalizarContenidoStr + '\n' + returnMatch[0]);
            replaced = true;
        }
    }

    // 4. Modificar el botón
    const btnRegex = /<button[^>]*btn-siguiente[^>]*onClick=\{([^}]+)\}[^>]*disabled=\{([^}]+)\}[^>]*>/g;
    content = content.replace(btnRegex, (match, onClickVal, disabledVal) => {
        let newMatch = match.replace(`onClick={${onClickVal}}`, `onClick={finalizarContenido}`);
        newMatch = newMatch.replace(`disabled={${disabledVal}}`, `disabled={guardando || !puedeAvanzar}`);
        return newMatch;
    });

    // Casos donde no tenía disabled o estaba formateado diferente
    const btnRegex2 = /<button([^>]*)onClick=\{([^}]+)\}([^>]*)>/g;
    content = content.replace(btnRegex2, (match, before, onClickVal, after) => {
        if (match.includes('btn-anterior') || match.includes('Anterior') || match.includes('quiz')) return match;
        
        let newMatch = match.replace(`onClick={${onClickVal}}`, `onClick={finalizarContenido}`);
        if (!newMatch.includes('disabled={')) {
            newMatch = newMatch.replace('>', ` disabled={guardando || !puedeAvanzar}>`);
        }
        return newMatch;
    });

    fs.writeFileSync(filePath, content, 'utf-8');
    modifiedCount++;
}

console.log("✅ Archivos modificados correctamente: " + modifiedCount);
