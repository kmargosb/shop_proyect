import { asyncHandler } from "@/common/utils/asyncHandler";
import * as brandService from "./brands.service";

export const getBrands = asyncHandler(async (_req, res) => {
  const brands = await brandService.getBrands();
  res.json(brands);
});

export const getBrandBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params as { slug: string };

  const brand = await brandService.getBrandBySlug(slug);

  if (!brand) {
    return res.status(404).json({ error: "Brand not found" });
  }

  res.json(brand);
});

export const createBrand = asyncHandler(async (req, res) => {
  const { name } = req.body as { name: string };

  if (!name?.trim()) {
    return res.status(400).json({
      error: "Brand name required",
    });
  }

  const brand = await brandService.createBrand(name);

  res.status(201).json(brand);
});

export const deleteBrand = asyncHandler(async (req, res) => {
  try {
    await brandService.deleteBrand(req.params.id as string);

    res.json({
      message: "Brand deleted",
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
});

export const updateBrand = asyncHandler(async (req, res) => {
  const { name } = req.body as { name: string };

  if (!name?.trim()) {
    return res.status(400).json({
      error: "Brand name required",
    });
  }

  const brand = await brandService.updateBrand(
    req.params.id as string,
    name,
  );

  res.json(brand);
});