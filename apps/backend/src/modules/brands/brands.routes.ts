import { Router } from "express";
import {
  getBrands,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
} from "./brands.controller";

const router = Router();

/* ===============================
   PUBLIC
=============================== */

router.get("/", getBrands);
router.post("/", createBrand);
router.delete("/:id", deleteBrand);
router.put("/:id", updateBrand);
router.get("/:slug", getBrandBySlug);

export default router;
