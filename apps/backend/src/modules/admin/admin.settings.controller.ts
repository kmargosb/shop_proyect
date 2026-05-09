import type { Response } from "express";
import { z } from "zod";
import { asyncHandler } from "@/common/utils/asyncHandler";
import type { AuthRequest } from "@/common/middleware/auth.middleware";
import { getAdminSettings, updateAdminSettings } from "./admin.settings.service";

const trimString = z.string().trim().min(1).max(250);
const emailString = z.string().trim().email().max(250);
const urlString = z.string().trim().url().max(500);

const settingsPatchSchema = z
  .object({
    storeName: trimString.optional(),
    supportEmail: emailString.optional(),
    domain: trimString.optional(),
    country: trimString.optional(),
    currency: trimString.max(12).optional(),
    taxRate: z.number().min(0).max(100).optional(),
    taxLabel: trimString.max(40).optional(),
    showTaxes: z.boolean().optional(),
    shippingZone: trimString.optional(),
    estimatedDelivery: trimString.optional(),
    trackingAutomatic: z.boolean().optional(),
    emailFromName: trimString.optional(),
    emailFromAddress: emailString.optional(),
    orderConfirmationEmail: z.boolean().optional(),
    theme: trimString.optional(),
    accentColor: trimString.optional(),
    themeEditorPrepared: z.boolean().optional(),
    notifyOrders: z.boolean().optional(),
    notifyStock: z.boolean().optional(),
    notifyRefunds: z.boolean().optional(),
    notifyWeekly: z.boolean().optional(),
    compactTableDensity: z.boolean().optional(),
    keyboardShortcuts: z.boolean().optional(),
    autoRefreshDashboard: z.boolean().optional(),
    maintenanceMode: z.boolean().optional(),
    webhookEndpoint: urlString.optional(),
    apiKeysLabel: trimString.optional(),
    refundAutomation: z.boolean().optional(),
    shipmentTracking: z.boolean().optional(),
    invoiceActions: z.boolean().optional(),
  })
  .strict();

export const getSettingsController = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const settings = await getAdminSettings();
  res.json(settings);
});

export const patchSettingsController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = settingsPatchSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: "Settings inválidos", details: result.error.flatten().fieldErrors });
  }

  const settings = await updateAdminSettings(result.data);
  res.json(settings);
});
