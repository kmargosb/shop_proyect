import { Router } from "express";
import {
  getBrands,
  getBrandBySlug,
} from "./brands.controller";

const router = Router();

/* ===============================
   PUBLIC
=============================== */

router.get("/", getBrands);
router.get("/:slug", getBrandBySlug);

export default router;