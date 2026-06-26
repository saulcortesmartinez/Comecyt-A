// src/pages/contenido/modulo_5_contenido_4.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { Clock, Trophy, XCircle } from "lucide-react";
import '@/Css/modulo_5_contenido_4.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const MODULO_ID = 5;
const NUM_CONTENIDO = 4;
const TIEMPO_JUEGO = 120;
const CALIFICACION_MINIMA = 2;

const Modulo5Contenido4 = () => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(TIEMPO_JUEGO);
    const [timerActive, setTimerActive] = useState(true);
    const [scrolledBottom, setScrolledBottom] = useState(false);
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [modoLibre, setModoLibre] = useState(false);
    const [totalContenidos, setTotalContenidos] = useState(4);
    const [progresoCargado, setProgresoCargado] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const questions = [
        { id: 1, question: "Recibes un correo de 'soporte@microsoft.com' que dice: 'Tu cuenta de Outlook será eliminada en 48 horas por inactividad. Haz clic aquí para mantener tu cuenta activa'. El correo tiene el logo de Microsoft y se ve profesional, pero cuando pasas el mouse sobre el botón, abajo en el navegador aparece: 'http://microsoft-seguridad.tk/verificar'. ¿Qué haces?", options: ["A) Doy clic porque no quiero perder mi correo y mis fotos de años","B) Lo borro y no doy clic. El dominio.tk y 'microsoft-seguridad' no son de Microsoft. Entro directo a outlook.com desde mi navegador","C) Le respondo al correo preguntando por qué van a eliminar mi cuenta","D) Reenvío el correo a mis contactos para avisarles que Microsoft está borrando cuentas"], correct: 1 },
        { id: 2, question: "Te llega un correo de 'Paquetería DHL' con asunto: 'Paquete retenido en aduana'. El correo dice que tienes un paquete de Amazon que no pagó impuestos y que debes descargar el archivo 'Guia_Aduana.pdf.exe' para ver el monto a pagar y liberar tu paquete. Tú sí esperas un paquete de Amazon. ¿Qué haces?", options: ["A) Descargo el archivo porque sí estoy esperando un paquete y necesito saber cuánto pagar","B) No descargo nada. Los archivos.exe son programas, no PDFs. Entro a Amazon o DHL directo con mi número de guía para verificar","C) Le marco al número que viene en el correo para preguntar por mi paquete","D) Le pido a mi hijo que lo descargue en su computadora para ver si es seguro"], correct: 1 },
        { id: 3, question: "Recibes un correo de 'RH@tuempresa.com' que dice: 'Actualización urgente de nómina. Por favor confirma tus datos bancarios en el siguiente formulario para recibir tu aguinaldo completo'. El correo viene del dominio de tu empresa y el remitente es el nombre de la contadora que sí trabaja ahí. El link te lleva a un Google Forms. ¿Qué haces?", options: ["A) Lleno el formulario, es de la empresa y necesito mi aguinaldo","B) No lleno nada. Voy personalmente con RH o marco a la extensión de la contadora para confirmar si ellas mandaron ese correo","C) Le contesto al correo confirmando que ya llené el formulario","D) Lo ignoro, si es importante me buscarán en persona"], correct: 1 }
    ];

    const lanzarConfeti = () => {};
    useEffect(() => { const correo = localStorage.getItem("correo"); const token = localStorage.getItem("token"); if (!correo) { setProgresoCargado(true); return; } axios.post(`${API_URL}/api/alumno/progreso`, { correo }, token? { headers: { Authorization: `Bearer ${token}` } } : {}).then(res => { const mod = (res.data.modulos || []).find(m => m.modulo_id === MODULO_ID); if (mod) { setTotalContenidos(mod.total_contenidos); if (mod.progreso_actual >= NUM_CONTENIDO) setModoLibre(true); } }).catch(()=>{}).finally(()=> setProgresoCargado(true)); }, []);
    useEffect(() => { if (!progresoCargado) return; if (modoLibre) { setTimeLeft(0); setTimerActive(false); setScrolledBottom(true); return; } if (timerActive && timeLeft > 0 &&!showResult) { const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000); return () => clearTimeout(t); } else if (timeLeft === 0) { setTimerActive(false); } }, [timeLeft, timerActive, showResult, modoLibre, progresoCargado]);
    useEffect(() => { const h = () => { if (window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 50) setScrolledBottom(true); }; window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
    const handleAnswer = (qIdx, oIdx) => { if (showResult) return; if (timeLeft === 0 &&!modoLibre) return; setAnswers({...answers, [qIdx]: oIdx }); };
    const handleFinish = () => { let s = 0; questions.forEach((q, i) => { if (answers[i] === q.correct) s++; }); setScore(s); setShowResult(true); setTimerActive(false); if (s >= CALIFICACION_MINIMA) lanzarConfeti(); };
    const handleSiguiente = async () => { setGuardando(true); const correo = localStorage.getItem("correo"); const token = localStorage.getItem("token"); try { const r = await axios.post(`${API_URL}/api/alumno/progreso/actualizar`, { correo, modulo_id: MODULO_ID, progreso_actual: NUM_CONTENIDO }, token? { headers: { Authorization: `Bearer ${token}` } } : {}); if (r.data?.success) { window.scrollTo(0,0); NUM_CONTENIDO >= totalContenidos? navigate("/inicio") : navigate(`/modulo/${MODULO_ID}/contenido/${NUM_CONTENIDO + 1}`); } } finally { setGuardando(false); } };
    const reintentar = () => { setAnswers({}); setShowResult(false); setScore(0); setTimeLeft(TIEMPO_JUEGO); setTimerActive(true); setScrolledBottom(false); };
    const formatTime = (s) => modoLibre? "Modo Repaso 🔄" : `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
    const allAnswered = Object.keys(answers).length === 3;
    const aprobo = score >= CALIFICACION_MINIMA;
    if (!progresoCargado) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',color:'#06b6d4'}}>Cargando reto...</div>;
    return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen p-4 md:p-8"><div className="max-w-5xl mx-auto"><div className="game-card">
    <div className="game-header"><h2><span>📧</span> Reto 4: Correo Electrónico Experto</h2><p>Casos avanzados: dominios falsos, archivos.exe y suplantación interna. Tienes <strong>2 minutos</strong>.</p></div>
    <div className="mb-6 text-center"><div className={`inline-block px-6 py-3 rounded-xl ${timeLeft < 30 &&!modoLibre? 'bg-red-500/20 border-red-400' : 'bg-cyan-500/20 border-cyan-400'} border-2`}><p className="text-white text-2xl font-bold">⏰ {formatTime(timeLeft)}</p></div></div>
    {!showResult && <div className="space-y-6">{questions.map((q, qIdx) => (
    <div key={q.id} className="bg-slate-800/50 p-6 rounded-xl border border-cyan-500/30">
    <p className="text-white text-lg font-semibold mb-4"><span className="text-cyan-400">{qIdx+1}.</span> {q.question}</p>
    <div className="space-y-3">{q.options.map((opt, oIdx) => { const isSelected = answers[qIdx] === oIdx; return (
    <button key={oIdx} onClick={() => handleAnswer(qIdx, oIdx)} disabled={showResult || (timeLeft===0 &&!modoLibre)} className={`option-btn ${isSelected? 'selected' : ''}`}>{opt}</button>
    )})}</div></div>))}</div>}
    {!showResult && (timeLeft===0 || allAnswered) && <button onClick={handleFinish} className="btn-finish-game">{allAnswered? '✅ TERMINAR Y VER RESULTADO' : '⏰ SE ACABÓ EL TIEMPO - VER RESULTADO'}</button>}
    {showResult && <div className="victory-message">{aprobo? <><Trophy size={80} color="#ffc107" /><h3>¡{score===3?'LEYENDA':'MUY BIEN'}!</h3></> : <><XCircle size={80} color="#dc3545" /><h3>ALERTA MÁXIMA</h3></>}<p>Obtuviste {score} de 3</p></div>}
    <footer className="contenido-footer mt-8"><div className="botones-nav">
    <button className="btn-anterior" onClick={()=>navigate(-1)}>Anterior</button>
    <button className="btn-siguiente" onClick={handleSiguiente} disabled={guardando}>{guardando? "Guardando..." : "Finalizar Módulo"}</button>
    </div></footer>
    </div></div></div>);
};
export default Modulo5Contenido4;
