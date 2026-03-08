import { Request, Response } from "express"
import { CartService } from "./cart.service"

export const createCartController = async (req: Request, res: Response) => {

  const { userId } = req.body

  const cart = await CartService.getOrCreateCart(userId)

  res.json(cart)

}

export const getCartController = async (req: Request, res: Response) => {

  const cartId = req.params.cartId as string

  const cart = await CartService.getCart(cartId)

  res.json(cart)

}

export const addItemController = async (req: Request, res: Response) => {

  const cartId = req.params.cartId as string
  const { productId, quantity } = req.body

  const item = await CartService.addItem(cartId, productId, quantity)

  res.json(item)

}

export const removeItemController = async (req: Request, res: Response) => {

  const cartItemId = req.params.cartItemId as string

  const item = await CartService.removeItem(cartItemId)

  res.json(item)

}

export const getTotalsController = async (req: Request, res: Response) => {

  const cartId = req.params.cartId as string

  const totals = await CartService.calculateTotals(cartId)

  res.json(totals)

}

export const mergeCartController = async (req: Request, res: Response) => {

  const { guestCartId, userId } = req.body

  const cart = await CartService.mergeCart(guestCartId, userId)

  res.json(cart)

}