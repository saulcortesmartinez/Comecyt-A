// src/pages/contenido/modulo_5_contenido_4.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { Clock, Trophy, XCircle } from "lucide-react";
import '@/Css/modulo_5_contenido_4.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const MODULO_ID = 5;
const NUM_CONTENIDO = 4;

export default function Modulo5Contenido4() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(120);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    { id: 1, question: "Recibes un correo de 'soporte@microsoft.com'... 'http://microsoft-seguridad.tk/verificar'. ¿Qué haces?", options: ["A) Doy clic...","B) Lo borro y no doy clic. Entro directo a outlook.com","C) Le respondo...","D) Reenvío..."], correct: 1 },
    { id: 2, question: "Te llega un correo de 'Paquetería DHL'... 'Guia_Aduana.pdf.exe'... ¿Qué haces?", options: ["A) Descargo...","B) No descargo nada. Los.exe son programas...","C) Le marco...","D) Le pido a mi hijo..."], correct: 1 },
    { id: 3, question: "Recibes un correo de 'RH@tuempresa.com'... Google Forms... ¿Qué haces?", options: ["A) Lleno el formulario...","B) No lleno nada. Voy con RH...","C) Le contesto...","D) Lo ignoro..."], correct: 1 }
  ];

  const handleAnswer = (qIdx, oIdx) => {
    if (showResult || timeLeft === 0) return;
    setAnswers({...answers, [qIdx]: oIdx });
  };

  const handleFinish = () => {
    let s = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correct) s++; });
    setScore(s);
    setShowResult(true);
  };

  useEffect(() => {
    if (timeLeft > 0 &&!showResult) {
      const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timeLeft, showResult]);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen p-4">
      <h2>📧 Reto 4: Correo Electrónico Experto</h2>
      <p>⏰ {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</p>
      {questions.map((q, qIdx) => (
        <div key={q.id}>
          <p>{qIdx+1}. {q.question}</p>
          {q.options.map((opt, oIdx) => {
            const isSelected = answers[qIdx] === oIdx;
            return (
              <button key={oIdx} onClick={() => handleAnswer(qIdx, oIdx)} className={isSelected? 'selected' : ''}>
                {opt}
              </button>
            );
          })}
        </div>
      ))}
      <button onClick={handleFinish}>TERMINAR</button>
      {showResult && <p>Obtuviste {score} de 3</p>}
      <button onClick={() => navigate(-1)}>Anterior</button>
      <button onClick={() => navigate("/inicio")}>Finalizar Módulo</button>
    </div>
  );
}
