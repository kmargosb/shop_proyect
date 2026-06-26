import 'dotenv/config';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

async function main() {
  // No permitir ejecutar en producción
  if (process.env.NODE_ENV === 'production') {
    throw new Error('No se puede ejecutar createAdmin en producción');
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Debes definir ADMIN_EMAIL y ADMIN_PASSWORD en el archivo .env');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      name: 'Admin',
      email,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Administrador listo');
  console.log('📧 Email:', admin.email);
  console.log('👤 Nombre:', admin.name);
  console.log('🛡️ Rol:', admin.role);
}

main()
  .catch((err) => {
    console.error('🔥 Error creando administrador:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
