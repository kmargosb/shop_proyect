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

export async function createBrand(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  return prisma.brand.create({
    data: {
      name: name.trim(),
      slug,
    },
  });
}

export async function deleteBrand(id: string) {
  const productsCount = await prisma.product.count({
    where: {
      brandId: id,
    },
  });

  if (productsCount > 0) {
    throw new Error("Brand has products");
  }

  return prisma.brand.delete({
    where: { id },
  });
}

export async function updateBrand(id: string, name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  return prisma.brand.update({
    where: { id },
    data: {
      name: name.trim(),
      slug,
    },
  });
}