import { prisma } from "@/lib/prisma";
import cloudinary from "@/common/utils/cloudinary";
import { AppError } from "@/common/errors/AppError";

/* ===============================
   HELPERS
=============================== */

function calculateProductStock(product: any) {
  return product.variants.reduce(
    (acc: number, variant: any) => acc + variant.stock,
    0,
  );
}

async function uploadImages(
  files: Express.Multer.File[],
  productId: string,
  isPrimaryFirst = false,
) {
  const uploadedImages = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "products" }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        })
        .end(file.buffer);
    });

    uploadedImages.push({
      url: result.secure_url,
      publicId: result.public_id,
      productId,
      isPrimary: isPrimaryFirst ? i === 0 : false,
    });
  }

  return uploadedImages;
}

/* ===============================
   BASE QUERY BUILDER
=============================== */

function buildProductFilters(query: any) {
  const { search, brand, minPrice, maxPrice } = query;

  return {
    isActive: true,

    ...(search && {
      name: {
        contains: search,
        mode: "insensitive",
      },
    }),

    ...(brand && {
      brand: {
        slug: {
          in: Array.isArray(brand) ? brand : [brand],
        },
      },
    }),

    ...((minPrice || maxPrice) && {
      price: {
        ...(minPrice
          ? {
              gte: Number(minPrice) * 100,
            }
          : {}),

        ...(maxPrice
          ? {
              lte: Number(maxPrice) * 100,
            }
          : {}),
      },
    }),
  };
}

/* ===============================
   QUERIES
=============================== */

export async function getProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },

    include: {
      images: true,
      brand: true,
      variants: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return products.map((product) => ({
    ...product,
    totalStock: calculateProductStock(product),
  }));
}

export async function getProductsByBrand(brandSlug: string) {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      brand: {
        slug: brandSlug,
      },
    },

    include: {
      images: true,
      brand: true,
      variants: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return products.map((product) => ({
    ...product,
    totalStock: calculateProductStock(product),
  }));
}

/* SHOP FILTERS */

export async function getProductsWithFilters(query: any) {
  const where = buildProductFilters(query);

  const products = await prisma.product.findMany({
    where,

    include: {
      images: true,
      brand: true,
      variants: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return products.map((product) => ({
    ...product,
    totalStock: calculateProductStock(product),
  }));
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },

    include: {
      images: true,
      brand: true,
      variants: true,
    },
  });

  if (!product) return null;

  return {
    ...product,
    totalStock: calculateProductStock(product),
  };
}

export async function getRelatedProducts(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },

    select: {
      brandId: true,
    },
  });

  const relatedProducts = await prisma.product.findMany({
    where: {
      isActive: true,

      id: {
        not: productId,
      },

      ...(product?.brandId && {
        brandId: product.brandId,
      }),
    },

    include: {
      images: true,
      variants: true,
    },

    take: 4,

    orderBy: {
      createdAt: "desc",
    },
  });

  return relatedProducts.map((product) => ({
    ...product,
    totalStock: calculateProductStock(product),
  }));
}

/* ===============================
   MUTATIONS
=============================== */

export async function createProduct(data: any, files: Express.Multer.File[]) {
  return prisma.$transaction(async (tx) => {
    const variants =
      typeof data.variants === "string"
        ? JSON.parse(data.variants)
        : data.variants;

    const product = await tx.product.create({
      data: {
        name: data.name,

        description: data.description,

        price: Number(data.price),

        gender: data.gender,

        brandId: data.brandId || null,

        category: data.category,
      },
    });

    /* VARIANTS */

    if (variants?.length) {
      await tx.productVariant.createMany({
        data: variants.map((variant: any) => ({
          productId: product.id,

          size: variant.size,

          color: variant.color,

          stock: Number(variant.stock),
        })),
      });
    }

    /* IMAGES */

    if (files?.length) {
      const images = await uploadImages(files, product.id, true);

      await tx.productImage.createMany({
        data: images,
      });
    }

    return tx.product.findUnique({
      where: { id: product.id },

      include: {
        images: true,
        variants: true,
      },
    });
  });
}

export async function updateProduct(
  id: string,
  data: any,
  files: Express.Multer.File[],
) {
  return prisma.$transaction(async (tx) => {
    const variants =
      typeof data.variants === "string"
        ? JSON.parse(data.variants)
        : data.variants;

    const product = await tx.product.findUnique({
      where: { id },

      include: {
        images: true,
        variants: true,
      },
    });

    if (!product) throw new Error("Producto no encontrado");

    const imagesToDelete = data.imagesToDelete
      ? JSON.parse(data.imagesToDelete)
      : [];

    /* DELETE IMAGES */

    for (const image of product.images.filter((img) =>
      imagesToDelete.includes(img.id),
    )) {
      await cloudinary.uploader.destroy(image.publicId);

      await tx.productImage.delete({
        where: { id: image.id },
      });
    }

    /* UPLOAD IMAGES */

    if (files?.length) {
      const images = await uploadImages(files, id);

      await tx.productImage.createMany({
        data: images,
      });
    }

    /* PRIMARY IMAGE */

    if (data.primaryImageId) {
      await tx.productImage.updateMany({
        where: { productId: id },

        data: {
          isPrimary: false,
        },
      });

      await tx.productImage.update({
        where: {
          id: data.primaryImageId,
        },

        data: {
          isPrimary: true,
        },
      });
    }

    /* ENSURE PRIMARY */

    const finalImages = await tx.productImage.findMany({
      where: {
        productId: id,
      },
    });

    if (finalImages.length && !finalImages.some((i) => i.isPrimary)) {
      await tx.productImage.update({
        where: {
          id: finalImages[0].id,
        },

        data: {
          isPrimary: true,
        },
      });
    }

    /* UPDATE VARIANTS */

    if (variants) {
      for (const variant of variants) {
        const existingVariant = product.variants.find(
          (v) => v.size === variant.size && v.color === variant.color,
        );

        if (existingVariant) {
          const newStock = Number(variant.stock);

          if (newStock < existingVariant.reservedStock) {
            throw new AppError(
              `Cannot reduce stock below reserved quantity (${existingVariant.reservedStock})`,
              400,
            );
          }

          await tx.productVariant.update({
            where: {
              id: existingVariant.id,
            },

            data: {
              stock: newStock,
            },
          });

          continue;
        }

        await tx.productVariant.create({
          data: {
            productId: id,

            size: variant.size,

            color: variant.color,

            stock: Number(variant.stock),
          },
        });
      }
    }

    const updated = await tx.product.update({
      where: { id },

      data: {
        name: data.name,

        description: data.description,

        price: Number(data.price),

        gender: data.gender,

        brandId: data.brandId || null,

        category: data.category,
      },

      include: {
        images: true,
        variants: true,
      },
    });

    return updated;
  });
}

export async function deleteProduct(id: string) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id },

      include: {
        images: true,
      },
    });

    if (!product) throw new Error("Producto no encontrado");

    for (const image of product.images) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    return tx.product.update({
      where: { id },

      data: {
        isActive: false,
      },

      include: {
        images: true,
        variants: true,
      },
    });
  });
}
