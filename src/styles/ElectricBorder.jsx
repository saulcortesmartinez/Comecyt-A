import React, { useEffect, useRef, useCallback } from 'react'; // <--- ESTO FALTABA
import './ElectricBorder.css';

const ElectricBorder = ({
    children,
    color = '#00ffcc',
    speed = 1,
    chaos = 0.12,
    borderRadius = 15,
    className,
    style
}) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const animationRef = useRef(null);
    const timeRef = useRef(0);
    const lastFrameTimeRef = useRef(0);

    const random = useCallback(x => (Math.sin(x * 12.9898) * 43758.5453) % 1, []);

    const noise2D = useCallback((x, y) => {
        const i = Math.floor(x); const j = Math.floor(y);
        const fx = x - i; const fy = y - j;
        const a = random(i + j * 57); const b = random(i + 1 + j * 57);
        const c = random(i + (j + 1) * 57); const d = random(i + 1 + (j + 1) * 57);
        const ux = fx * fx * (3.0 - 2.0 * fx); const uy = fy * fy * (3.0 - 2.0 * fy);
        return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
    }, [random]);

    const octavedNoise = useCallback((x, octaves, lacunarity, gain, baseAmplitude, baseFrequency, time, seed, baseFlatness) => {
        let y = 0; let amplitude = baseAmplitude; let frequency = baseFrequency;
        for (let i = 0; i < octaves; i++) {
            let octaveAmplitude = amplitude;
            if (i === 0) octaveAmplitude *= baseFlatness;
            y += octaveAmplitude * noise2D(frequency * x + seed * 100, time * frequency * 0.3);
            frequency *= lacunarity; amplitude *= gain;
        }
        return y;
    }, [noise2D]);

    const getRoundedRectPoint = useCallback((t, left, top, width, height, radius) => {
        const sw = width - 2 * radius; const sh = height - 2 * radius;
        const ca = (Math.PI * radius) / 2;
        const total = 2 * sw + 2 * sh + 4 * ca;
        const dist = t * total;
        let acc = 0;
        if (dist <= acc + sw) return { x: left + radius + (dist - acc), y: top };
        acc += sw;
        if (dist <= acc + ca) {
            const p = (dist - acc) / ca; const ang = -Math.PI / 2 + p * (Math.PI / 2);
            return { x: left + width - radius + radius * Math.cos(ang), y: top + radius + radius * Math.sin(ang) };
        }
        acc += ca;
        if (dist <= acc + sh) return { x: left + width, y: top + radius + (dist - acc) };
        acc += sh;
        if (dist <= acc + ca) {
            const p = (dist - acc) / ca; const ang = p * (Math.PI / 2);
            return { x: left + width - radius + radius * Math.cos(ang), y: top + height - radius + radius * Math.sin(ang) };
        }
        acc += ca;
        if (dist <= acc + sw) return { x: left + width - radius - (dist - acc), y: top + height };
        acc += sw;
        if (dist <= acc + ca) {
            const p = (dist - acc) / ca; const ang = Math.PI / 2 + p * (Math.PI / 2);
            return { x: left + radius + radius * Math.cos(ang), y: top + height - radius + radius * Math.sin(ang) };
        }
        acc += ca;
        if (dist <= acc + sh) return { x: left, y: top + height - radius - (dist - acc) };
        acc += sh;
        const p = (dist - acc) / ca; const ang = Math.PI + p * (Math.PI / 2);
        return { x: left + radius + radius * Math.cos(ang), y: top + radius + radius * Math.sin(ang) };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current; const container = containerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext('2d');
        const borderOffset = 60;

        const updateSize = () => {
            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = (rect.width + borderOffset * 2) * dpr;
            canvas.height = (rect.height + borderOffset * 2) * dpr;
            canvas.style.width = `${rect.width + borderOffset * 2}px`;
            canvas.style.height = `${rect.height + borderOffset * 2}px`;
            ctx.scale(dpr, dpr);
            return { w: rect.width + borderOffset * 2, h: rect.height + borderOffset * 2 };
        };

        let { w, h } = updateSize();

        const draw = (now) => {
            const dt = (now - lastFrameTimeRef.current) / 1000;
            timeRef.current += dt * speed;
            lastFrameTimeRef.current = now;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineCap = 'round';

            const bw = w - borderOffset * 2; const bh = h - borderOffset * 2;
            const rad = Math.min(borderRadius, Math.min(bw, bh) / 2);
            const samples = Math.floor((2 * (bw + bh) + 2 * Math.PI * rad) / 2);

            ctx.beginPath();
            for (let i = 0; i <= samples; i++) {
                const p = i / samples;
                const pt = getRoundedRectPoint(p, borderOffset, borderOffset, bw, bh, rad);
                const xn = octavedNoise(p * 8, 10, 1.6, 0.7, chaos, 10, timeRef.current, 0, 0);
                const yn = octavedNoise(p * 8, 10, 1.6, 0.7, chaos, 10, timeRef.current, 1, 0);
                const dx = pt.x + xn * 60; const dy = pt.y + yn * 60;
                if (i === 0) ctx.moveTo(dx, dy); else ctx.lineTo(dx, dy);
            }
            ctx.closePath(); ctx.stroke();
            animationRef.current = requestAnimationFrame(draw);
        };

        animationRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animationRef.current);
    }, [color, speed, chaos, borderRadius, getRoundedRectPoint, octavedNoise]);

    return (
        <div ref={containerRef} className={`electric-border ${className ?? ''}`} style={{ ...style, borderRadius }}>
            <div className="eb-canvas-container" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <canvas ref={canvasRef} className="eb-canvas" />
            </div>
            <div className="eb-layers"><div className="eb-glow-1" /><div className="eb-glow-2" /></div>
            <div className="eb-content" style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        </div>
    );
};

export default ElectricBorder;