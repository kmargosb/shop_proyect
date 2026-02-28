import { prisma } from "@/lib/prisma"
import cloudinary from "@/common/utils/cloudinary"

export async function getProducts() {
  return await prisma.product.findMany({
    include: {
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function createProduct(
  data: {
    name: string
    description?: string
    price: number
    stock: number
  },
  files: Express.Multer.File[]
) {
  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        stock: Number(data.stock),
      },
    })

    if (files && files.length > 0) {
      const uploadedImages: {
        url: string
        publicId: string
        productId: string
        isPrimary: boolean
      }[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        const result: any = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "products" }, (err, result) => {
              if (err) reject(err)
              else resolve(result)
            })
            .end(file.buffer)
        })

        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
          productId: product.id,
          isPrimary: i === 0, // 🔥 Primera imagen siempre primaria
        })
      }

      await tx.productImage.createMany({
        data: uploadedImages,
      })
    }

    // 🔥 Devolver producto con imágenes
    return await tx.product.findUnique({
      where: { id: product.id },
      include: { images: true },
    })
  })
}

export async function updateProduct(
  id: string,
  data: any,
  files: Express.Multer.File[]
) {
  return await prisma.$transaction(async (tx) => {

    const imagesToDelete = data.imagesToDelete
      ? JSON.parse(data.imagesToDelete)
      : []

    const primaryImageId =
      data.primaryImageId && data.primaryImageId !== ""
        ? data.primaryImageId
        : null

    const product = await tx.product.findUnique({
      where: { id },
      include: { images: true },
    })

    if (!product) {
      throw new Error("Producto no encontrado")
    }

    // 1️⃣ SUBIR NUEVAS IMÁGENES PRIMERO
    const uploadedImages: {
      url: string
      publicId: string
      productId: string
      isPrimary: boolean
    }[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      const result: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "products" }, (err, result) => {
            if (err) reject(err)
            else resolve(result)
          })
          .end(file.buffer)
      })

      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
        productId: id,
        isPrimary: false,
      })
    }

    if (uploadedImages.length > 0) {
      await tx.productImage.createMany({
        data: uploadedImages,
      })
    }

    // 2️⃣ BORRAR IMÁGENES MARCADAS DESPUÉS
    if (imagesToDelete.length > 0) {
      const imagesToRemove = product.images.filter(img =>
        imagesToDelete.includes(img.id)
      )

      for (const image of imagesToRemove) {
        await cloudinary.uploader.destroy(image.publicId)
        await tx.productImage.delete({
          where: { id: image.id },
        })
      }
    }

    // 3️⃣ ACTUALIZAR IMAGEN PRINCIPAL
    if (primaryImageId) {
      await tx.productImage.updateMany({
        where: { productId: id },
        data: { isPrimary: false },
      })

      await tx.productImage.update({
        where: { id: primaryImageId },
        data: { isPrimary: true },
      })
    }

    // 4️⃣ GARANTIZAR QUE SIEMPRE HAYA UNA PRIMARIA
    const finalImages = await tx.productImage.findMany({
      where: { productId: id },
    })

    if (finalImages.length > 0) {
      const hasPrimary = finalImages.some(img => img.isPrimary)

      if (!hasPrimary) {
        await tx.productImage.update({
          where: { id: finalImages[0].id },
          data: { isPrimary: true },
        })
      }
    }

    // 5️⃣ ACTUALIZAR PRODUCTO
    return await tx.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        stock: Number(data.stock),
      },
      include: { images: true },
    })
  })
}
export const deleteProduct = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id },
      include: { images: true },
    })

    if (!product) {
      throw new Error("Producto no encontrado")
    }

    // 1️⃣ Borrar imágenes en Cloudinary
    for (const image of product.images) {
      await cloudinary.uploader.destroy(image.publicId)
    }

    // 2️⃣ Borrar producto (ProductImage se elimina por cascade)
    return await tx.product.delete({
      where: { id },
    })
  })
}
