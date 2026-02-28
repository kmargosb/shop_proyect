import "dotenv/config"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"

async function main() {
  // 🚫 No permitir ejecutar en producción
  if (process.env.NODE_ENV === "production") {
    throw new Error("No se puede ejecutar createAdmin en producción")
  }

  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      "Debes definir ADMIN_EMAIL y ADMIN_PASSWORD en el archivo .env"
    )
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    console.log("⚠️ El admin ya existe")
    return
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  })

  console.log("✅ Admin creado correctamente")
  console.log("📧 Email:", email)
  console.log("🔑 Password: (definida en .env)")
}

main()
  .catch((err) => {
    console.error("🔥 Error creando admin:", err.message)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })