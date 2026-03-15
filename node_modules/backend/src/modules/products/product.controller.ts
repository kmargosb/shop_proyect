import { Request, Response } from "express";
import * as productService from "./product.service";
import { getProductById } from "./product.service";
import { asyncHandler } from "@/common/utils/asyncHandler";

export const getProducts = asyncHandler(
  async (_req: Request, res: Response) => {
    const products = await productService.getProducts();
    res.json(products);
  },
);

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const files = (req.files as Express.Multer.File[]) || [];

    const product = await productService.createProduct(req.body, files);

    res.status(201).json(product);
  },
);

export const updateProduct = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const files = (req.files as Express.Multer.File[]) || [];

    const updated = await productService.updateProduct(
      req.params.id as string,
      req.body,
      files,
    );
    res.json(updated);
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    await productService.deleteProduct(req.params.id as string);
    res.json({ message: "Producto eliminado correctamente" });
  },
);

export const getProduct = async (req: Request, res: Response) => {
  try {

    const id = req.params.id as string;

    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    return res.json(product);

  } catch (error) {

    console.error("Get product error:", error);

    return res.status(500).json({
      error: "Failed to fetch product",
    });

  }
};