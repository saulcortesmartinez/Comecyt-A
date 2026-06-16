import "./BotonWhatsApp.css";

function BotonWhatsApp() {
    // CAMBIA ESTE NÚMERO POR TU CHIP TELCEL CUANDO LO TENGAS
    const numero = "527121265349";
    const mensaje = "Hola,%20necesito%20ayuda%20con%20ÁGORA%20-%20COMECYT";

    return (
        <a
            href={`https://wa.me/${numero}?text=${mensaje}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp-global"
            aria-label="Ayuda por WhatsApp"
        >
            <span style={{ fontSize: "24px" }}>📱</span>
            <div className="whatsapp-texto">
                <strong>Ayuda WhatsApp</strong>
                <small>+52 7121265349</small> {/* CAMBIA AQUÍ TAMBIÉN */}
            </div>
        </a>
    );
}

export default BotonWhatsApp;