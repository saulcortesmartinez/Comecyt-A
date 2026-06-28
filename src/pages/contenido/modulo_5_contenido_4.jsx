// src/pages/contenido/modulo_5_contenido_4.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { Trophy, XCircle } from "lucide-react";
import "../..Css/modulo_5_contenido_4.css";
import Publicacion_fbImg from "../../assets/publicacion_fb.png";
import Seguridad_fbImg from "../../assets/seguridad_fb.png";
import Seguridad2_fbImg from "../../assets/seguridad2_fb.png";
import Paso2_fbImg from "../../assets/paso2_fb.png";
import RecuperarCon_fbImg from "../../assets/recuperarcon_fb.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const MODULO_ID = 5;
const NUM_CONTENIDO = 4;
const TIEMPO_JUEGO = 120;
const CALIFICACION_MINIMA = 2;

export default function Modulo5Contenido4() {
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
        {
            id: 1,
            question: "Recibes un correo de 'soporte@microsoft.com' que dice: 'Tu cuenta de Outlook será eliminada en 48 horas'. El link apunta a 'http://microsoft-seguridad.tk/verificar'. ¿Qué haces?",
            options: [
                "A) Doy clic porque no quiero perder mi correo",
                "B) Lo borro y no doy clic. Entro directo a outlook.com desde mi navegador",
                "C) Le respondo al correo preguntando por qué",
                "D) Reenvío el correo a mis contactos"
            ],
            correct: 1
        },
        {
            id: 2,
            question: "Te llega un correo de 'Paquetería DHL' con un archivo 'Guia_Aduana.pdf.exe'. Tú sí esperas un paquete de Amazon. ¿Qué haces?",
            options: [
                "A) Descargo el archivo porque sí estoy esperando un paquete",
                "B) No descargo nada. Los.exe son programas, no PDFs. Verifico directo en Amazon/DHL",
                "C) Le marco al número que viene en el correo",
                "D) Le pido a mi hijo que lo descargue en su computadora"
            ],
            correct: 1
        },
        {
            id: 3,
            question: "Recibes un correo de 'RH@tuempresa.com' pidiendo datos bancarios en un Google Forms para tu aguinaldo. El remitente es la contadora real. ¿Qué haces?",
            options: [
                "A) Lleno el formulario, es de la empresa",
                "B) No lleno nada. Voy personalmente con RH para confirmar",
                "C) Le contesto al correo confirmando",
                "D) Lo ignoro"
            ],
            correct: 1
        }
    ];

    const lanzarConfeti = () => { };

    // Cargar progreso
    useEffect(() => {
        const correo = localStorage.getItem("correo");
        const token = localStorage.getItem("token");
        if (!correo) { setProgresoCargado(true); return; }
        axios.post(`${API_URL}/api/alumno/progreso`, { correo }, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
            .then(res => {
                const mod = (res.data.modulos || []).find(m => m.modulo_id === MODULO_ID);
                if (mod) {
                    setTotalContenidos(mod.total_contenidos);
                    if (mod.progreso_actual >= NUM_CONTENIDO) {
                        setModoLibre(true);
                        setTimeLeft(0);
                        setTimerActive(false);
                        setScrolledBottom(true);
                    }
                }
            })
            .finally(() => setProgresoCargado(true));
    }, []);

    // Timer
    useEffect(() => {
        if (!progresoCargado || modoLibre || showResult) return;
        if (timerActive && timeLeft > 0) {
            const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(t);
        } else if (timeLeft === 0) {
            setTimerActive(false);
        }
    }, [timeLeft, timerActive, showResult, modoLibre, progresoCargado]);

    // Scroll gate
    useEffect(() => {
        const h = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 50) setScrolledBottom(true);
        };
        window.addEventListener("scroll", h);
        return () => window.removeEventListener("scroll", h);
    }, []);

    const handleAnswer = (qIdx, oIdx) => {
        if (showResult) return;
        if (timeLeft === 0 && !modoLibre) return;
        setAnswers({ ...answers, [qIdx]: oIdx });
    };

    const handleFinish = () => {
        let s = 0;
        questions.forEach((q, i) => { if (answers[i] === q.correct) s++; });
        setScore(s);
        setShowResult(true);
        setTimerActive(false);
        if (s >= CALIFICACION_MINIMA) lanzarConfeti();
    };

    const handleSiguiente = async () => {
        setGuardando(true);
        const correo = localStorage.getItem("correo");
        const token = localStorage.getItem("token");
        try {
            const r = await axios.post(
                `${API_URL}/api/alumno/progreso/actualizar`,
                { correo, modulo_id: MODULO_ID, progreso_actual: NUM_CONTENIDO },
                token ? { headers: { Authorization: `Bearer ${token}` } } : {}
            );
            if (r.data?.success) {
                window.scrollTo(0, 0);
                NUM_CONTENIDO >= totalContenidos ? navigate("/inicio") : navigate(`/modulo/${MODULO_ID}/contenido/${NUM_CONTENIDO + 1}`);
            }
        } finally {
            setGuardando(false);
        }
    };

    const formatTime = (s) => modoLibre ? "Modo Repaso 🔄" : `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    const allAnswered = Object.keys(answers).length === questions.length;
    const aprobo = score >= CALIFICACION_MINIMA;

    if (!progresoCargado) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#06b6d4' }}>Cargando reto...</div>;

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="game-card">
                    <div className="game-header">
                        <h2>📧 Reto 4: Correo Electrónico Experto</h2>
                        <p>Casos avanzados: dominios falsos, archivos.exe y suplantación interna.</p>
                    </div>

                    <div className="mb-6 text-center">
                        <div className="inline-block px-6 py-3 rounded-xl bg-cyan-500/20 border-2 border-cyan-400">
                            <p className="text-white text-2xl font-bold">⏰ {formatTime(timeLeft)}</p>
                        </div>
                    </div>

                    {!showResult && (
                        <div className="space-y-6">
                            {questions.map((q, qIdx) => (
                                <div key={q.id} className="bg-slate-800/50 p-6 rounded-xl border border-cyan-500/30">
                                    <p className="text-white text-lg font-semibold mb-4">
                                        <span className="text-cyan-400">{qIdx + 1}.</span> {q.question}
                                    </p>
                                    <div className="space-y-3">
                                        {q.options.map((opt, oIdx) => {
                                            const isSelected = answers[qIdx] === oIdx;
                                            return (
                                                <button
                                                    key={oIdx}
                                                    onClick={() => handleAnswer(qIdx, oIdx)}
                                                    disabled={showResult || (timeLeft === 0 && !modoLibre)}
                                                    className={`option-btn w-full text-left p-3 rounded-lg border ${isSelected ? 'bg-cyan-500/30 border-cyan-400' : 'bg-slate-700/50 border-slate-600'} text-white`}
                                                >
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!showResult && (timeLeft === 0 || allAnswered) && (
                        <button onClick={handleFinish} className="btn-finish-game mt-6 w-full py-3 bg-cyan-500 text-black font-bold rounded-lg">
                            {allAnswered ? '✅ TERMINAR Y VER RESULTADO' : '⏰ VER RESULTADO'}
                        </button>
                    )}

                    {showResult && (
                        <div className="victory-message text-center py-8">
                            {aprobo ? <Trophy size={80} color="#ffc107" className="mx-auto" /> : <XCircle size={80} color="#dc3545" className="mx-auto" />}
                            <h3 className="text-2xl text-white mt-4">{aprobo ? '¡Muy bien!' : 'Sigue practicando'}</h3>
                            <p className="text-white">Obtuviste {score} de {questions.length}</p>
                        </div>
                    )}

                    <footer className="contenido-footer mt-8">
                        <div className="botones-nav flex justify-between">
                            <button className="btn-anterior" onClick={() => navigate(-1)}>Anterior</button>
                            <button className="btn-siguiente" onClick={handleSiguiente} disabled={guardando}>
                                {guardando ? "Guardando..." : "Finalizar Módulo"}
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
