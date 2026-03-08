import { Request, Response } from "express"
import { CartService } from "./cart.service"

export const createCartController = async (req: Request, res: Response) => {

  const cart = await CartService.getOrCreateCart()

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