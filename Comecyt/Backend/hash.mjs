import bcrypt from 'bcryptjs';

const passwordPlano = '123456';

const generarHash = async () => {
    try {
        const hash = await bcrypt.hash(passwordPlano, 10);

        console.log('=================================');
        console.log('🔑 Contraseña:', passwordPlano);
        console.log('🔐 Hash generado:', hash);
        console.log('=================================');

        const esValido = await bcrypt.compare(passwordPlano, hash);
        console.log('✅ ¿El hash funciona?:', esValido);
        console.log('=================================');

        console.log('\nCopia este SQL:');
        console.log(`UPDATE usuarios SET contraseña = '${hash}' WHERE correo = 'saul@gmail.com';`);

    } catch (error) {
        console.error('💥 Error:', error);
    }
};

generarHash();