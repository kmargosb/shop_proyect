import { prisma } from "@/lib/prisma"

const CART_EXPIRATION_HOURS = 24

type CheckoutData = {
  userId?: string
  fullName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  postalCode: string
  country: string
}

export const CartService = {

  /* =========================================================
     GET OR CREATE CART
  ========================================================= */

  async getOrCreateCart(userId?: string) {

    const expiresAt = new Date(
      Date.now() + CART_EXPIRATION_HOURS * 60 * 60 * 1000
    )

    if (!userId) {

      return prisma.cart.create({
        data: { expiresAt },
        include: {
          items: {
            include: { product: true }
          }
        }
      })

    }

    let cart = await prisma.cart.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    })

    if (!cart) {

      cart = await prisma.cart.create({
        data: {
          userId,
          expiresAt
        },
        include: {
          items: {
            include: { product: true }
          }
        }
      })

    }

    return cart
  },

  /* =========================================================
     ADD ITEM
  ========================================================= */

  async addItem(cartId: string, productId: string, quantity: number) {

    if (quantity <= 0) {
      throw new Error("Invalid quantity")
    }

    return prisma.$transaction(async (tx) => {

      const cart = await tx.cart.findUnique({
        where: { id: cartId }
      })

      if (!cart) {
        throw new Error("Cart not found")
      }

      if (cart.status !== "ACTIVE") {
        throw new Error("Cart not active")
      }

      if (cart.expiresAt < new Date()) {
        throw new Error("Cart expired")
      }

      const product = await tx.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        throw new Error("Product not found")
      }

      const existingItem = await tx.cartItem.findFirst({
        where: {
          cartId,
          productId
        }
      })

      let item

      if (existingItem) {

        item = await tx.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: {
              increment: quantity
            }
          }
        })

      } else {

        item = await tx.cartItem.create({
          data: {
            cartId,
            productId,
            quantity,
            price: product.price // ⭐ PRICE SNAPSHOT
          }
        })

      }

      // refresh expiration
      await tx.cart.update({
        where: { id: cartId },
        data: {
          expiresAt: new Date(
            Date.now() + CART_EXPIRATION_HOURS * 60 * 60 * 1000
          )
        }
      })

      return item

    })

  },

  /* =========================================================
     REMOVE ITEM
  ========================================================= */

  async removeItem(cartItemId: string) {

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId }
    })

    if (!item) {
      throw new Error("Cart item not found")
    }

    return prisma.cartItem.delete({
      where: { id: cartItemId }
    })

  },

  /* =========================================================
     GET CART
  ========================================================= */

  async getCart(cartId: string) {

    await this.syncCartInventory(cartId)

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!cart) {
      throw new Error("Cart not found")
    }

    if (cart.expiresAt < new Date()) {
      throw new Error("Cart expired")
    }

    return cart

  },

  /* =========================================================
   SYNC CART WITH INVENTORY
========================================================= */

  async syncCartInventory(cartId: string) {

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!cart) {
      throw new Error("Cart not found")
    }

    for (const item of cart.items) {

      if (!item.product) {

        await prisma.cartItem.delete({
          where: { id: item.id }
        })

        continue
      }

      if (!item.product.isActive) {

        await prisma.cartItem.delete({
          where: { id: item.id }
        })

        continue
      }

      if (item.product.stock < item.quantity) {

        if (item.product.stock === 0) {

          await prisma.cartItem.delete({
            where: { id: item.id }
          })

        } else {

          await prisma.cartItem.update({
            where: { id: item.id },
            data: {
              quantity: item.product.stock
            }
          })

        }

      }

    }

    return this.getCart(cartId)

  },

  /* =========================================================
   CALCULATE CART TOTALS
========================================================= */

  async calculateTotals(cartId: string) {

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: true }
  })

  if (!cart) {
    throw new Error("Cart not found")
  }

  const subtotal = cart.items.reduce((acc, item) => {
    return acc + item.price * item.quantity
  }, 0)

  const discount = 0
  const tax = Math.floor(subtotal * 0.21)

  const shipping = subtotal > 5000 ? 0 : 500

  const total = subtotal - discount + tax + shipping

  return {
    subtotal,
    discount,
    tax,
    shipping,
    total
  }
},

  /* =========================================================
     CONVERT CART TO ORDER
  ========================================================= */

  async convertCartToOrder(cartId: string, checkoutData: CheckoutData) {

    await this.validateCart(cartId)

    return prisma.$transaction(async (tx) => {

      const cart = await tx.cart.findUnique({
        where: { id: cartId },
        include: {
          items: {
            include: { product: true }
          }
        }
      })

      if (!cart) {
        throw new Error("Cart not found")
      }

      if (cart.status !== "ACTIVE") {
        throw new Error("Cart already converted")
      }

      if (cart.expiresAt < new Date()) {
        throw new Error("Cart expired")
      }

      if (cart.items.length === 0) {
        throw new Error("Cart empty")
      }

      const { createOrder } = await import("@/modules/orders/order.service")

      const order = await createOrder({

        ...checkoutData,

        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))

      })

      await tx.cart.update({
        where: { id: cartId },
        data: {
          status: "CONVERTED"
        }
      })

      return order

    })

  },

  /* =========================================================
   VALIDATE CART BEFORE CHECKOUT
========================================================= */

  async validateCart(cartId: string) {

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!cart) {
      throw new Error("Cart not found")
    }

    if (cart.expiresAt < new Date()) {
      throw new Error("Cart expired")
    }

    if (cart.items.length === 0) {
      throw new Error("Cart empty")
    }

    for (const item of cart.items) {

      if (!item.product) {
        throw new Error(`Product ${item.productId} not found`)
      }

      if (!item.product.isActive) {
        throw new Error(`Product ${item.product.name} not available`)
      }

      if (item.product.stock < item.quantity) {
        throw new Error(
          `Not enough stock for ${item.product.name}`
        )
      }

    }

    return true
  },

  /* =========================================================
   MERGE GUEST CART INTO USER CART
========================================================= */

  async mergeCart(guestCartId: string, userId: string) {

    const guestCart = await prisma.cart.findUnique({
      where: { id: guestCartId },
      include: { items: true }
    })

    if (!guestCart) return null

    const userCart = await this.getOrCreateCart(userId)

    for (const item of guestCart.items) {

      const existing = await prisma.cartItem.findFirst({
        where: {
          cartId: userCart.id,
          productId: item.productId
        }
      })

      if (existing) {

        await prisma.cartItem.update({
          where: { id: existing.id },
          data: {
            quantity: {
              increment: item.quantity
            }
          }
        })

      } else {

        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }
        })

      }

    }

    await prisma.cart.update({
      where: { id: guestCartId },
      data: {
        status: "MERGED"
      }
    })

    return userCart

  }

}