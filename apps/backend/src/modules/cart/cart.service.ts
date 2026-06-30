import { prisma } from '@/lib/prisma';
import { getIO } from '@/lib/socket';
import { createOrderWithTx } from '@/modules/orders/order.service';

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
      variant: true,
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
    const expiresAt = new Date(Date.now() + CART_EXPIRATION_HOURS * 60 * 60 * 1000);

    /* =========================
     GUEST CART
  ========================= */

    if (!userId) {
      return prisma.cart.create({
        data: {
          expiresAt,
        },
        include: CART_INCLUDE,
      });
    }

    /* =========================
     EXISTING ACTIVE CART
  ========================= */

    const activeCarts = await prisma.cart.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: CART_INCLUDE,
    });

    if (activeCarts.length > 1) {
      console.warn(`[Cart] User ${userId} has ${activeCarts.length} ACTIVE carts.`);
    }

    const existingCart = activeCarts[0];

    if (existingCart) {
      return existingCart;
    }

    /* =========================
     CREATE NEW CART
  ========================= */

    const newCart = await prisma.cart.create({
      data: {
        userId,
        expiresAt,
      },
      include: CART_INCLUDE,
    });

    console.log(`[Cart] New cart created: ${newCart.id}`);

    return newCart;
  },

  /* =========================================================
   GET ACTIVE CART
========================================================= */

  async getActiveCart(cartId?: string, userId?: string) {
    const expiresAt = {
      gt: new Date(),
    };

    console.log('========== GET ACTIVE CART ==========');
    console.log('Input cartId:', cartId);
    console.log('Input userId:', userId);

    /* =========================================================
     1. TRY COOKIE CART FIRST
  ========================================================= */

    if (cartId) {
      const cookieCart = await prisma.cart.findFirst({
        where: {
          id: cartId,
          status: 'ACTIVE',
          expiresAt,
        },
        include: CART_INCLUDE,
      });

      console.log(
        '[COOKIE SEARCH]',
        cookieCart
          ? {
              id: cookieCart.id,
              status: cookieCart.status,
              items: cookieCart.items.length,
              expiresAt: cookieCart.expiresAt,
              userId: cookieCart.userId,
            }
          : 'NOT FOUND',
      );

      if (cookieCart) {
        // Si el usuario está autenticado, el carrito debe pertenecerle
        // o ser un carrito de invitado todavía.
        if (!userId || cookieCart.userId === userId || cookieCart.userId === null) {
          console.log('[RETURN] Cookie cart:', cookieCart.id);
          return cookieCart;
        }
      }
    }

    /* =========================================================
     2. USER ACTIVE CART
  ========================================================= */

    if (userId) {
      const userCart = await prisma.cart.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
          expiresAt,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: CART_INCLUDE,
      });

      console.log(
        '[USER SEARCH]',
        userCart
          ? {
              id: userCart.id,
              status: userCart.status,
              items: userCart.items.length,
              expiresAt: userCart.expiresAt,
            }
          : 'NOT FOUND',
      );

      if (userCart) {
        console.log('[RETURN] User cart:', userCart.id);
        return userCart;
      }

      console.log('[CREATE] No active user cart found.');

      return this.getOrCreateCart(userId);
    }

    /* =========================================================
     3. CREATE GUEST CART
  ========================================================= */

    console.log('[CREATE] Guest cart not found.');
    console.log('=====================================');

    return this.getOrCreateCart();
  },

  /* =========================================================
     ADD ITEM
  ========================================================= */

  async addItem(cartId: string, productId: string, variantId: string, quantity: number) {
    if (quantity === 0) {
      throw new Error('Invalid quantity');
    }

    return prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { id: cartId },
      });

      if (!cart) {
        throw new Error('Cart not found');
      }

      /* prevent invalid carts */

      if (cart.status !== 'ACTIVE') {
        throw new Error('Cart is no longer active');
      }

      if (cart.expiresAt < new Date()) {
        throw new Error('Cart expired');
      }

      const variant = await tx.productVariant.findUnique({
        where: {
          id: variantId,
        },
        include: {
          product: true,
        },
      });

      if (!variant || !variant.product.isActive) {
        throw new Error('Product not available');
      }

      const existingItem = await tx.cartItem.findFirst({
        where: {
          cartId,
          productId,
          variantId,
        },
      });

      const currentQty = existingItem?.quantity ?? 0;
      const nextQty = currentQty + quantity;

      /* removing non-existing item */

      if (quantity < 0 && !existingItem) {
        throw new Error('Cart item not found');
      }

      /* real available stock */

      const availableStock = variant.stock - variant.reservedStock;

      if (nextQty > availableStock) {
        throw new Error('Not enough stock available');
      }

      /* remove item */

      if (nextQty <= 0) {
        if (existingItem) {
          await tx.cartItem.delete({
            where: { id: existingItem.id },
          });
        }
      } else if (existingItem) {
        /* update quantity */
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: nextQty,
          },
        });
      } else {
        /* create item */
        await tx.cartItem.create({
          data: {
            cartId,
            productId,
            variantId,
            quantity: nextQty,
            price: variant.product.price,
          },
        });
      }

      /* extend cart expiration */

      await tx.cart.update({
        where: { id: cartId },
        data: {
          expiresAt: new Date(Date.now() + CART_EXPIRATION_HOURS * 3600000),
        },
      });

      const updatedCart = await tx.cart.findUnique({
        where: { id: cartId },
        include: CART_INCLUDE,
      });

      getIO().emit('cartUpdated', {
        cartId,
      });

      return updatedCart;
    });
  },

  /* =========================================================
     REMOVE ITEM
  ========================================================= */

  async removeItem(cartItemId: string) {
    return prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findUnique({
        where: { id: cartItemId },
      });

      if (!item) {
        return { success: true, cart: null };
      }

      await tx.cartItem.delete({
        where: { id: cartItemId },
      });

      const cart = await tx.cart.findUnique({
        where: {
          id: item.cartId,
        },
        include: CART_INCLUDE,
      });

      return {
        success: true,
        cart,
      };
    });
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

    /* invalid cart */

    if (!cart) {
      return null;
    }

    if (cart.status !== 'ACTIVE') {
      return null;
    }

    if (cart.expiresAt < new Date()) {
      return null;
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
        variant: true,
      },
    });

    console.log('===== SYNC CART INVENTORY =====');
    console.log('Cart:', cartId);
    console.log('Items before sync:', items.length);

    for (const item of items) {
      /* deleted / inactive */

      if (!item.product || !item.product.isActive || !item.variant) {
        console.log('[DELETE]', item.id, 'Reason: product deleted or inactive');
        await prisma.cartItem.delete({
          where: { id: item.id },
        });

        continue;
      }

      const availableStock = item.variant.stock - item.variant.reservedStock;

      /* out of stock */

      if (availableStock <= 0) {
        console.log(
          '[DELETE]',
          item.id,
          'Reason: availableStock =',
          availableStock,
          'stock =',
          item.variant.stock,
          'reserved =',
          item.variant.reservedStock,
        );
        await prisma.cartItem.delete({
          where: { id: item.id },
        });

        continue;
      }

      /* adjust quantity */

      if (item.quantity > availableStock) {
        console.log('[UPDATE]', item.id, 'Quantity:', item.quantity, '->', availableStock);
        await prisma.cartItem.update({
          where: { id: item.id },
          data: {
            quantity: availableStock,
          },
        });
      }
    }
    console.log('===== END SYNC =====');
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
      throw new Error('Cart not found');
    }

    const subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

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

  async convertCartToOrder(cartId: string, checkoutData: CheckoutData) {
    return prisma
      .$transaction(async (tx) => {
        const locked = await tx.cart.updateMany({
          where: {
            id: cartId,
            status: 'ACTIVE',
          },
          data: {
            status: 'CONVERTING',
          },
        });

        if (locked.count !== 1) {
          throw new Error('Cart already being processed');
        }

        const cart = await this.validateCartTx(tx, cartId);

        const order = await createOrderWithTx(tx, {
          userId: checkoutData.userId ?? undefined,
          ...checkoutData,
          items: cart.items.map((item: (typeof cart.items)[number]) => ({
            productId: item.productId,
            variantId: item.variantId ?? undefined,
            quantity: item.quantity,
          })),
        });

        await tx.cart.update({
          where: { id: cartId },
          data: {
            status: 'CONVERTED',
          },
        });

        await tx.cartItem.deleteMany({
          where: { cartId },
        });

        return order;
      })
      .then((order) => {
        getIO().emit('cartUpdated', {
          cartId,
        });

        return order;
      });
  },

  /* =========================================================
     VALIDATE CART
  ========================================================= */

  async validateCartTx(tx: any, cartId: string) {
    const cart = await tx.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      throw new Error('Cart not found');
    }

    if (cart.status !== 'ACTIVE' && cart.status !== 'CONVERTING') {
      throw new Error('Cart already converted');
    }

    if (cart.expiresAt < new Date()) {
      throw new Error('Cart expired');
    }

    if (cart.items.length === 0) {
      throw new Error('Cart empty');
    }

    for (const item of cart.items) {
      if (!item.product || !item.variant) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (!item.product.isActive) {
        throw new Error(`Product ${item.product.name} not available`);
      }

      const availableStock = item.variant.stock - item.variant.reservedStock;

      if (availableStock < item.quantity) {
        throw new Error(`Not enough stock for ${item.product.name}`);
      }
    }

    return cart;
  },

  async validateCart(cartId: string) {
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },

      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      throw new Error('Cart not found');
    }

    if (cart.status !== 'ACTIVE') {
      throw new Error('Cart already converted');
    }

    if (cart.expiresAt < new Date()) {
      throw new Error('Cart expired');
    }

    if (cart.items.length === 0) {
      throw new Error('Cart empty');
    }

    for (const item of cart.items) {
      if (!item.product || !item.variant) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (!item.product.isActive) {
        throw new Error(`Product ${item.product.name} not available`);
      }

      const availableStock = item.variant.stock - item.variant.reservedStock;

      if (availableStock < item.quantity) {
        throw new Error(`Not enough stock for ${item.product.name}`);
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
          variantId: item.variantId,
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
            variantId: item.variantId,
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
        status: 'MERGED',
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

    if (cart.status !== 'ACTIVE') {
      return this.getOrCreateCart(userId);
    }

    if (cart.expiresAt < new Date()) {
      return this.getOrCreateCart(userId);
    }

    return cart;
  },
};
