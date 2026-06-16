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
    'modulo_1_contenido_31_Reto.jsx', 'modulo_1_contenido_32_Reto.jsx'
];

let tableRows = [];
let errorFilesReport = [];

for (const file of files) {
    const filePath = path.join(dir, file);
    let status = "OK";
    let importAxios = "Agregará";
    let stateGuardando = "Agregará";
    let funcFinalizar = "Insertará";
    let botonPlan = "Cambiará";
    let observaciones = [];

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // 1. Verificación de states faltantes
        const hasPuedeAvanzar = content.includes('puedeAvanzar');
        const hasProgresoCargado = content.includes('progresoCargado');
        const hasUseEffectProgress = content.includes('setProgresoCargado') && content.includes('useEffect');

        if (!hasPuedeAvanzar) {
            observaciones.push("Agregar state puedeAvanzar");
        }
        if (!hasProgresoCargado) {
            observaciones.push("Agregar state progresoCargado");
        }
        
        // Report if useEffect progress is missing when progresoCargado is false or being added
        if (!hasUseEffectProgress && !hasProgresoCargado) {
            observaciones.push("FALTA useEffect que carga progreso");
            status = "WARN"; // Still processing it, but warn
        } else if (!hasUseEffectProgress) {
             observaciones.push("FALTA useEffect que carga progreso");
             status = "WARN";
        }

        if (!hasPuedeAvanzar || !hasProgresoCargado) {
            errorFilesReport.push({
                file,
                missing: [
                    !hasPuedeAvanzar ? 'puedeAvanzar' : null,
                    !hasProgresoCargado ? 'progresoCargado' : null
                ].filter(Boolean),
                missingUseEffect: !hasUseEffectProgress
            });
        }

        // Import axios
        if (content.includes('import axios from')) {
            importAxios = "Existe";
        }

        // Función finalizarContenido
        if (content.includes('const finalizarContenido = async () => {') || content.includes('const finalizarContenido = async() => {') || content.includes('const finalizarContenido = () => {') || content.includes('const finalizarContenido =async ()')) {
            funcFinalizar = "Reemplazará";
        }

    } catch (e) {
        status = "ERROR";
        observaciones.push("Archivo no encontrado o ilegible");
    }

    tableRows.push(`| ${file} | ${status} | ${importAxios} | ${stateGuardando} | ${funcFinalizar} | ${botonPlan} | ${observaciones.join(', ')} |`);
}

let result = '### 1. Archivos que marcaron ERROR previamente\n\n';
errorFilesReport.forEach(e => {
    result += `- **${e.file}**:\n  - Le falta: ${e.missing.join(', ')}\n  - ¿Falta useEffect de progreso?: ${e.missingUseEffect ? 'SÍ' : 'NO'}\n`;
});

result += '\n### 3. Plan de Implementación Actualizado\n\n';
result += '| Archivo | Estado | Import axios | State guardando | finalizarContenido | Botón | Observaciones |\n';
result += '|---|---|---|---|---|---|---|\n';
result += tableRows.join('\n');
console.log(result);
