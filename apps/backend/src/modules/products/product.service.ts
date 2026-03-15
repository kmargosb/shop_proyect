import { prisma } from "@/lib/prisma";
import cloudinary from "@/common/utils/cloudinary";
import { InventoryCache } from "@/modules/inventory/inventory.cache";

export async function getProducts() {

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    include: {
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  /* ===============================
     SYNC REDIS STOCK CACHE
  =============================== */

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

  return products;

}

export async function createProduct(
  data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
  },
  files: Express.Multer.File[],
) {

  return await prisma.$transaction(async (tx) => {

    const product = await tx.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        stock: Number(data.stock),
      },
    });

    /* cache stock */

    try {

      await InventoryCache.setStock(product.id, product.stock);

    } catch (error) {

      console.error("Redis cache error:", error);

    }

    if (files && files.length > 0) {

      const uploadedImages: {
        url: string;
        publicId: string;
        productId: string;
        isPrimary: boolean;
      }[] = [];

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
          productId: product.id,
          isPrimary: i === 0,
        });

      }

      await tx.productImage.createMany({
        data: uploadedImages,
      });

    }

    return await tx.product.findUnique({
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

  return await prisma.$transaction(async (tx) => {

    const imagesToDelete = data.imagesToDelete
      ? JSON.parse(data.imagesToDelete)
      : [];

    const primaryImageId =
      data.primaryImageId && data.primaryImageId !== ""
        ? data.primaryImageId
        : null;

    const product = await tx.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    const uploadedImages: {
      url: string;
      publicId: string;
      productId: string;
      isPrimary: boolean;
    }[] = [];

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
        productId: id,
        isPrimary: false,
      });

    }

    if (uploadedImages.length > 0) {

      await tx.productImage.createMany({
        data: uploadedImages,
      });

    }

    if (imagesToDelete.length > 0) {

      const imagesToRemove = product.images.filter((img) =>
        imagesToDelete.includes(img.id),
      );

      for (const image of imagesToRemove) {

        await cloudinary.uploader.destroy(image.publicId);

        await tx.productImage.delete({
          where: { id: image.id },
        });

      }

    }

    if (primaryImageId) {

      await tx.productImage.updateMany({
        where: { productId: id },
        data: { isPrimary: false },
      });

      await tx.productImage.update({
        where: { id: primaryImageId },
        data: { isPrimary: true },
      });

    }

    const finalImages = await tx.productImage.findMany({
      where: { productId: id },
    });

    if (finalImages.length > 0) {

      const hasPrimary = finalImages.some((img) => img.isPrimary);

      if (!hasPrimary) {

        await tx.productImage.update({
          where: { id: finalImages[0].id },
          data: { isPrimary: true },
        });

      }

    }

    const updatedProduct = await tx.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        stock: Number(data.stock),
      },
      include: { images: true },
    });

    /* update redis cache */

    try {

      await InventoryCache.setStock(id, updatedProduct.stock);

    } catch (error) {

      console.error("Redis cache error:", error);

    }

    return updatedProduct;

  });

}

export const deleteProduct = async (id: string) => {

  return await prisma.$transaction(async (tx) => {

    const product = await tx.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    for (const image of product.images) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    return await tx.product.update({
      where: { id },
      data: {
        isActive: false,
      },
      include: {
        images: true,
      }
    });

  });

};