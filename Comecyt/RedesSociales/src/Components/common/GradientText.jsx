// src/Components/GradientText.jsx

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, useMotionValue, useAnimationFrame, useTransform } from 'framer-motion';
import './GradientText.css';

export default function GradientText({
  children,
  className = '',
  colors = ['#5227FF', '#FF9FFC', '#B19EEF'],
  animationSpeed = 8,
  showBorder = false,
  direction = 'horizontal',
  pauseOnHover = false,
  yoyo = true,
  style = {} // Añadido para poder pasar estilos directamente al div contenedor
}) {
  const [isPaused, setIsPaused] = useState(false);
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef(null);

  const animationDuration = animationSpeed * 1000;

  useEffect(() => {
    let animationFrameId;
    const animate = (time) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }

      if (!isPaused) {
        const deltaTime = time - lastTimeRef.current;
        elapsedRef.current += deltaTime;

        if (yoyo) {
          const fullCycle = animationDuration * 2;
          const cycleTime = elapsedRef.current % fullCycle;

          if (cycleTime < animationDuration) {
            progress.set((cycleTime / animationDuration) * 100);
          } else {
            progress.set(100 - ((cycleTime - animationDuration) / animationDuration) * 100);
          }
        } else {
          progress.set((elapsedRef.current / animationDuration) % 1 * 100);
        }
      }
      lastTimeRef.current = time;
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      elapsedRef.current = 0;
      progress.set(0);
    };
  }, [animationDuration, isPaused, progress, yoyo]);

  const backgroundPosition = useTransform(progress, p => {
    if (direction === 'horizontal') {
      return `${p}% 50%`;
    } else if (direction === 'vertical') {
      return `50% ${p}%`;
    } else {
      return `${p}% 50%`;
    }
  });

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) setIsPaused(true);
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) setIsPaused(false);
  }, [pauseOnHover]);

  const gradientAngle =
    direction === 'horizontal' ? 'to right' : direction === 'vertical' ? 'to bottom' : 'to bottom right';
  const gradientColors = [...colors, colors[0]].join(', ');

  const gradientBaseStyle = {
    backgroundImage: `linear-gradient(${gradientAngle}, ${gradientColors})`,
    backgroundSize: direction === 'horizontal' ? '300% 100%' : direction === 'vertical' ? '100% 300%' : '300% 300%',
    backgroundRepeat: 'repeat'
  };

  return (
    <motion.div
      className={`animated-gradient-text ${showBorder ? 'with-border' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style} // Pasa los estilos directos aquí
    >
      {showBorder && <motion.div className="gradient-overlay" style={{ ...gradientBaseStyle, backgroundPosition }} />}
      <motion.div className="text-content" style={{ ...gradientBaseStyle, backgroundPosition }}>
        {children}
      </motion.div>
    </motion.div>
  );
}