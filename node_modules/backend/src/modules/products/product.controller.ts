import { asyncHandler } from "@/common/utils/asyncHandler";
import * as productService from "./product.service";

/* ===============================
   GET ALL
=============================== */

export const getProducts = asyncHandler(async (_req, res) => {
  const products = await productService.getProducts();
  res.json(products);
});

/* ===============================
   FILTERED (🔥 SHOP)
=============================== */

export const getProductsFiltered = asyncHandler(async (req, res) => {
  const products = await productService.getProductsWithFilters(req.query);
  res.json(products);
});

/* ===============================
   BY BRAND
=============================== */

export const getProductsByBrand = asyncHandler(async (req, res) => {
  const { brand } = req.params as { brand: string };
  const products = await productService.getProductsByBrand(brand);
  res.json(products);
});

/* ===============================
   GET ONE
=============================== */

export const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };

  const product = await productService.getProductById(id);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(product);
});

/* ===============================
   RELATED
=============================== */

export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };

  const products = await productService.getRelatedProducts(id);
  res.json(products);
});

/* ===============================
   CREATE
=============================== */

export const createProduct = asyncHandler(async (req, res) => {
  const files = (req.files as Express.Multer.File[]) || [];
  const product = await productService.createProduct(req.body, files);
  res.status(201).json(product);
});

/* ===============================
   UPDATE
=============================== */

export const updateProduct = asyncHandler(async (req, res) => {
  const files = (req.files as Express.Multer.File[]) || [];

  const updated = await productService.updateProduct(
    req.params.id as string,
    req.body,
    files,
  );

  res.json(updated);
});

/* ===============================
   DELETE
=============================== */

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id as string);
  res.json({ message: "Producto eliminado correctamente" });
});
