import { prisma } from "@/lib/prisma";

export async function getBrands() {
  return prisma.brand.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getBrandBySlug(slug: string) {
  return prisma.brand.findUnique({
    where: { slug },
  });
}