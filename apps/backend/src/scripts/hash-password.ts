import bcrypt from "bcrypt"

async function main() {
  const hash = await bcrypt.hash(
    "NuevaPassword123",
    10,
  )

  console.log(hash)
}

main()