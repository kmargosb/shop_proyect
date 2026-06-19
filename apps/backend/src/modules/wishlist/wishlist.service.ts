import { prisma } from "@/lib/prisma";

export async function getWishlist(userId: string) {
  return prisma.wishlistItem.findMany({
    where: { userId },

    include: {
      product: {
        include: {
          images: true,
          brand: true,
          variants: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function addToWishlist(
  userId: string,
  productId: string,
) {
  return prisma.wishlistItem.upsert({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },

    update: {},

    create: {
      userId,
      productId,
    },
  });
}

export async function removeFromWishlist(
  userId: string,
  productId: string,
) {
  return prisma.wishlistItem.deleteMany({
    where: {
      userId,
      productId,
    },
  });
}