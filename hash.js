import bcrypt from 'bcryptjs';

const passwordPlano = '123456';
const hash = await bcrypt.hash(passwordPlano, 10);

console.log('=================================');
console.log('🔑 Contraseña:', passwordPlano);
console.log('🔐 Hash generado:', hash);
console.log('=================================');
console.log(\`UPDATE usuarios SET contraseña = '\${hash}' WHERE correo = 'saul@gmail.com';\`);
