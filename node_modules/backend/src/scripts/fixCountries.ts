// scripts/fixCountries.ts
import { prisma } from "@/lib/prisma";

async function run() {
  await prisma.order.updateMany({
    where: {
      country: {
        in: ["España", "ESPAÑA", "espana"],
      },
    },
    data: {
      country: "ES",
    },
  });

  console.log("✅ Countries fixed");
}

run();