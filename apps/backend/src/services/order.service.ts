import { prisma } from "../lib/prisma"
import { Prisma } from "@prisma/client"

type CreateOrderInput = {
  userId?: string
  items: {
    productId: string
    quantity: number
  }[]

  fullName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  postalCode: string
  country: string
}

export async function createOrder(data: CreateOrderInput) {
  const {
    userId,
    items,
    fullName,
    email,
    phone,
    addressLine1,
    addressLine2,
    city,
    postalCode,
    country,
  } = data

  if (!items || items.length === 0) {
    throw new Error("La orden debe contener productos")
  }

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    let total = 0
    const orderItemsData: {
      productId: string
      quantity: number
      price: number
    }[] = []

    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        throw new Error("Producto no encontrado")
      }

      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name}`)
      }

      total += product.price * item.quantity

      // 🔥 Guardamos el precio congelado aquí
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      })

      // 🔒 Descontamos stock
      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: product.stock - item.quantity,
        },
      })
    }

    const order = await tx.order.create({
      data: {
        userId: userId ?? null,
        fullName,
        email,
        phone,
        addressLine1,
        addressLine2,
        city,
        postalCode,
        country,
        total,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    })

    return order
  })
}

export async function getOrders(params: {
  page?: number
  limit?: number
  status?: string
}) {
  const page = params.page ?? 1
  const limit = params.limit ?? 10
  const skip = (page - 1) * limit

  const where: any = {}

  if (params.status) {
    where.status = params.status
  }

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ])

  return {
    data: orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// Cambiar estado de orden (ADMIN)
export async function updateOrderStatus(orderId: string, status: string) {
  const validStatuses = ["PENDING", "PAID", "SHIPPED", "CANCELLED"]

  if (!validStatuses.includes(status)) {
    throw new Error("Estado inválido")
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    throw new Error("Orden no encontrada")
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: status as any },
  })
}