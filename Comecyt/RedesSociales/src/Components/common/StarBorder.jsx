// src/Components/StarBorder.jsx

import React from 'react';
import './StarBorder.css'; // Importa los estilos CSS

const StarBorder = ({
    as: Component = 'button', // 'as' permite usarlo con diferentes elementos HTML
    className = '',
    color = '#00ffcc', // Color por defecto (puedes ajustar el color principal de tu tema)
    speed = '6s',
    thickness = 1, // Grosor del padding para el efecto
    children,
    ...rest
}) => {
    return (
        <Component
            className={`star-border-container ${className}`}
            // Quitamos el padding aquí y lo manejamos en el CSS del inner-content
            {...rest}
        >
            <div
                className="border-gradient-bottom"
                style={{
                    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`, // Ajustado el gradiente
                    animationDuration: speed
                }}
            ></div>
            <div
                className="border-gradient-top"
                style={{
                    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`, // Ajustado el gradiente
                    animationDuration: speed
                }}
            ></div>
            <div className="inner-content">{children}</div> {/* Contenido real del botón */}
        </Component>
    );
};

export default StarBorder;