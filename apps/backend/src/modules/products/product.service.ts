import { prisma } from "@/lib/prisma";
import cloudinary from "@/common/utils/cloudinary";
import { InventoryCache } from "@/modules/inventory/inventory.cache";

/* ===============================
   HELPERS
=============================== */

async function syncStockCache(products: any[]) {
  for (const product of products) {
    try {
      const cachedStock = await InventoryCache.getStock(product.id);

      if (cachedStock !== null) {
        product.stock = cachedStock;
      } else {
        await InventoryCache.setStock(product.id, product.stock);
      }
    } catch (error) {
      console.error("Redis cache error:", error);
    }
  }
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
   BASE QUERY BUILDER (🔥 PRO)
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
        ...(minPrice ? { gte: Number(minPrice) * 100 } : {}),
        ...(maxPrice ? { lte: Number(maxPrice) * 100 } : {}),
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
    include: { images: true, brand: true },
    orderBy: { createdAt: "desc" },
  });

  await syncStockCache(products);
  return products;
}

export async function getProductsByBrand(brandSlug: string) {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      brand: { slug: brandSlug },
    },
    include: { images: true, brand: true },
    orderBy: { createdAt: "desc" },
  });

  await syncStockCache(products);
  return products;
}

/* 🔥 SHOP FILTERS */
export async function getProductsWithFilters(query: any) {
  const where = buildProductFilters(query);

  const products = await prisma.product.findMany({
    where,
    include: { images: true, brand: true },
    orderBy: { createdAt: "desc" },
  });

  await syncStockCache(products);
  return products;
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { images: true, brand: true },
  });
}

export async function getRelatedProducts(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { brandId: true },
  });

  const relatedProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: productId },
      ...(product?.brandId && { brandId: product.brandId }),
    },
    include: { images: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  await syncStockCache(relatedProducts);
  return relatedProducts;
}

/* ===============================
   MUTATIONS
=============================== */

export async function createProduct(data: any, files: Express.Multer.File[]) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        stock: Number(data.stock),
        brandId: data.brandId || null,
      },
    });

    await InventoryCache.setStock(product.id, product.stock);

    if (files?.length) {
      const images = await uploadImages(files, product.id, true);
      await tx.productImage.createMany({ data: images });
    }

    return tx.product.findUnique({
      where: { id: product.id },
      include: { images: true },
    });
  });
}

export async function updateProduct(
  id: string,
  data: any,
  files: Express.Multer.File[],
) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) throw new Error("Producto no encontrado");

    const imagesToDelete = data.imagesToDelete
      ? JSON.parse(data.imagesToDelete)
      : [];

    /* DELETE */
    for (const image of product.images.filter((img) =>
      imagesToDelete.includes(img.id),
    )) {
      await cloudinary.uploader.destroy(image.publicId);
      await tx.productImage.delete({ where: { id: image.id } });
    }

    /* UPLOAD */
    if (files?.length) {
      const images = await uploadImages(files, id);
      await tx.productImage.createMany({ data: images });
    }

    /* PRIMARY */
    if (data.primaryImageId) {
      await tx.productImage.updateMany({
        where: { productId: id },
        data: { isPrimary: false },
      });

      await tx.productImage.update({
        where: { id: data.primaryImageId },
        data: { isPrimary: true },
      });
    }

    /* ENSURE PRIMARY */
    const finalImages = await tx.productImage.findMany({
      where: { productId: id },
    });

    if (finalImages.length && !finalImages.some((i) => i.isPrimary)) {
      await tx.productImage.update({
        where: { id: finalImages[0].id },
        data: { isPrimary: true },
      });
    }

    const updated = await tx.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        stock: Number(data.stock),
        brandId: data.brandId || null,
      },
      include: { images: true },
    });

    await InventoryCache.setStock(id, updated.stock);

    return updated;
  });
}

export async function deleteProduct(id: string) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) throw new Error("Producto no encontrado");

    for (const image of product.images) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    return tx.product.update({
      where: { id },
      data: { isActive: false },
      include: { images: true },
    });
  });
}
