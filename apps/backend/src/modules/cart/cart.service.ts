import { prisma } from "@/lib/prisma";

const CART_EXPIRATION_HOURS = 24;

/* ============================================
   TYPES
============================================ */

type CheckoutData = {
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
};

/* ============================================
   🔥 CENTRALIZED INCLUDE
============================================ */

const CART_INCLUDE = {
  items: {
    include: {
      product: {
        include: {
          images: true,
        },
      },
    },
  },
};

/* ============================================
   CART SERVICE
============================================ */

export const CartService = {
  /* =========================================================
     GET OR CREATE CART
  ========================================================= */

  async getOrCreateCart(userId?: string) {
    const expiresAt = new Date(
      Date.now() + CART_EXPIRATION_HOURS * 60 * 60 * 1000,
    );

    /* guest cart */

    if (!userId) {
      return prisma.cart.create({
        data: { expiresAt },
        include: CART_INCLUDE,
      });
    }

    /* existing active cart */

    let cart = await prisma.cart.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        expiresAt: {
          gt: new Date(),
        },
      },
      include: CART_INCLUDE,
    });

    /* create new cart */

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          expiresAt,
        },
        include: CART_INCLUDE,
      });
    }

    return cart;
  },

  /* =========================================================
     ADD ITEM
  ========================================================= */

  async addItem(cartId: string, productId: string, quantity: number) {
    if (quantity === 0) {
      throw new Error("Invalid quantity");
    }

    return prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { id: cartId },
      });

      if (!cart) {
        throw new Error("Cart not found");
      }

      /* prevent invalid carts */

      if (cart.status !== "ACTIVE") {
        throw new Error("Cart is no longer active");
      }

      if (cart.expiresAt < new Date()) {
        throw new Error("Cart expired");
      }

      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product || !product.isActive) {
        throw new Error("Product not available");
      }

      const existingItem = await tx.cartItem.findFirst({
        where: {
          cartId,
          productId,
        },
      });

      const currentQty = existingItem?.quantity ?? 0;
      const nextQty = currentQty + quantity;

      /* removing non-existing item */

      if (quantity < 0 && !existingItem) {
        throw new Error("Cart item not found");
      }

      /* real available stock */

      const availableStock =
        product.stock - product.reservedStock;

      if (nextQty > availableStock) {
        throw new Error("Not enough stock available");
      }

      /* remove item */

      if (nextQty <= 0) {
        if (existingItem) {
          await tx.cartItem.delete({
            where: { id: existingItem.id },
          });
        }
      }

      /* update quantity */

      else if (existingItem) {
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: nextQty,
          },
        });
      }

      /* create item */

      else {
        await tx.cartItem.create({
          data: {
            cartId,
            productId,
            quantity: nextQty,
            price: product.price,
          },
        });
      }

      /* extend cart expiration */

      await tx.cart.update({
        where: { id: cartId },
        data: {
          expiresAt: new Date(
            Date.now() + CART_EXPIRATION_HOURS * 3600000,
          ),
        },
      });

      return tx.cart.findUnique({
        where: { id: cartId },
        include: CART_INCLUDE,
      });
    });
  },

  /* =========================================================
     REMOVE ITEM
  ========================================================= */

  async removeItem(cartItemId: string) {
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    /* avoid crashing if already removed */

    if (!item) {
      return { success: true };
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return { success: true };
  },

  /* =========================================================
     GET CART
  ========================================================= */

  async getCart(cartId?: string, userId?: string) {
    let cart = null;

    /* try existing cart */

    if (cartId) {
      cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: CART_INCLUDE,
      });
    }

    /* invalid cart → regenerate */

    if (
      !cart ||
      cart.status !== "ACTIVE" ||
      cart.expiresAt < new Date()
    ) {
      cart = await this.getOrCreateCart(userId);
    }

    /* sync inventory */

    await this.syncCartInventory(cart.id);

    return prisma.cart.findUnique({
      where: { id: cart.id },
      include: CART_INCLUDE,
    });
  },

  /* =========================================================
     SYNC CART INVENTORY
  ========================================================= */

  async syncCartInventory(cartId: string) {
    const items = await prisma.cartItem.findMany({
      where: { cartId },
      include: {
        product: true,
      },
    });

    for (const item of items) {
      /* deleted / inactive */

      if (!item.product || !item.product.isActive) {
        await prisma.cartItem.delete({
          where: { id: item.id },
        });

        continue;
      }

      /* out of stock */

      if (item.product.stock <= 0) {
        await prisma.cartItem.delete({
          where: { id: item.id },
        });

        continue;
      }

      /* adjust quantity */

      if (item.quantity > item.product.stock) {
        await prisma.cartItem.update({
          where: { id: item.id },
          data: {
            quantity: item.product.stock,
          },
        });
      }
    }
  },

  /* =========================================================
     CALCULATE TOTALS
  ========================================================= */

  async calculateTotals(cartId: string) {
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: true,
      },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    const subtotal = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    const discount = 0;

    const tax = Math.floor(subtotal * 0.21);

    const shipping = subtotal > 5000 ? 0 : 500;

    const total = subtotal - discount + tax + shipping;

    return {
      subtotal,
      discount,
      tax,
      shipping,
      total,
    };
  },

  /* =========================================================
     CONVERT CART TO ORDER
  ========================================================= */

  async convertCartToOrder(
    cartId: string,
    checkoutData: CheckoutData,
  ) {
    await this.validateCart(cartId);

    return prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { id: cartId },
        include: CART_INCLUDE,
      });

      if (!cart) {
        throw new Error("Cart not found");
      }

      if (cart.status !== "ACTIVE") {
        throw new Error("Cart already converted");
      }

      if (cart.expiresAt < new Date()) {
        throw new Error("Cart expired");
      }

      if (cart.items.length === 0) {
        throw new Error("Cart empty");
      }

      const { createOrder } =
        await import("@/modules/orders/order.service");

      /* create order */

      const order = await createOrder({
        userId: checkoutData.userId ?? undefined,
        ...checkoutData,

        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      /* mark cart converted */

      await tx.cart.update({
        where: { id: cartId },
        data: {
          status: "CONVERTED",
        },
      });

      /* cleanup items */

      await tx.cartItem.deleteMany({
        where: { cartId },
      });

      return order;
    });
  },

  /* =========================================================
     VALIDATE CART
  ========================================================= */

  async validateCart(cartId: string) {
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    if (cart.status !== "ACTIVE") {
      throw new Error("Cart already converted");
    }

    if (cart.expiresAt < new Date()) {
      throw new Error("Cart expired");
    }

    if (cart.items.length === 0) {
      throw new Error("Cart empty");
    }

    for (const item of cart.items) {
      if (!item.product) {
        throw new Error(
          `Product ${item.productId} not found`,
        );
      }

      if (!item.product.isActive) {
        throw new Error(
          `Product ${item.product.name} not available`,
        );
      }

      const availableStock =
        item.product.stock -
        item.product.reservedStock;

      if (availableStock < item.quantity) {
        throw new Error(
          `Not enough stock for ${item.product.name}`,
        );
      }
    }

    return true;
  },

  /* =========================================================
     MERGE CART
  ========================================================= */

  async mergeCart(guestCartId: string, userId: string) {
    const guestCart = await prisma.cart.findUnique({
      where: { id: guestCartId },

      include: {
        items: true,
      },
    });

    if (!guestCart) {
      return null;
    }

    const userCart = await this.getOrCreateCart(userId);

    for (const item of guestCart.items) {
      const existing = await prisma.cartItem.findFirst({
        where: {
          cartId: userCart.id,
          productId: item.productId,
        },
      });

      if (existing) {
        await prisma.cartItem.update({
          where: {
            id: existing.id,
          },

          data: {
            quantity: {
              increment: item.quantity,
            },
          },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        });
      }
    }

    /* mark guest cart merged */

    await prisma.cart.update({
      where: { id: guestCartId },

      data: {
        status: "MERGED",
      },
    });

    return userCart;
  },

  /* =========================================================
     ENSURE VALID CART
  ========================================================= */

  async ensureCart(cartId?: string, userId?: string) {
    if (!cartId) {
      return this.getOrCreateCart(userId);
    }

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
    });

    if (!cart) {
      return this.getOrCreateCart(userId);
    }

    if (cart.status !== "ACTIVE") {
      return this.getOrCreateCart(userId);
    }

    if (cart.expiresAt < new Date()) {
      return this.getOrCreateCart(userId);
    }

    return cart;
  },
};