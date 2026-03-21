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