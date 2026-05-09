import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AdminSettingsDto, AdminSettingsPatch } from "./admin.settings.types";

const SETTINGS_ID = "singleton";

const defaultSettings: Required<AdminSettingsPatch> = {
  storeName: "Shop Proyect",
  supportEmail: "support@shopproyect.com",
  domain: "shopproyect.com",
  country: "España",
  currency: "EUR",
  taxRate: 21,
  taxLabel: "IVA",
  showTaxes: true,
  shippingZone: "EU shipping zone",
  estimatedDelivery: "2-5 días laborables",
  trackingAutomatic: false,
  emailFromName: "Shop Proyect",
  emailFromAddress: "no-reply@shopproyect.com",
  orderConfirmationEmail: true,
  theme: "Dark premium",
  accentColor: "Emerald / Indigo",
  themeEditorPrepared: false,
  notifyOrders: true,
  notifyStock: true,
  notifyRefunds: true,
  notifyWeekly: false,
  compactTableDensity: false,
  keyboardShortcuts: true,
  autoRefreshDashboard: true,
  maintenanceMode: false,
  webhookEndpoint: "https://shopproyect.com/api/webhooks",
  apiKeysLabel: "Secret management pending",
  refundAutomation: false,
  shipmentTracking: false,
  invoiceActions: true,
};

type PersistedSettings = Awaited<ReturnType<typeof upsertDefaultSettings>>;

function toDto(settings: PersistedSettings): AdminSettingsDto {
  return {
    storeName: settings.storeName,
    supportEmail: settings.supportEmail,
    domain: settings.domain,
    country: settings.country,
    currency: settings.currency,
    taxRate: settings.taxRate.toNumber(),
    taxLabel: settings.taxLabel,
    showTaxes: settings.showTaxes,
    shippingZone: settings.shippingZone,
    estimatedDelivery: settings.estimatedDelivery,
    trackingAutomatic: settings.trackingAutomatic,
    emailFromName: settings.emailFromName,
    emailFromAddress: settings.emailFromAddress,
    orderConfirmationEmail: settings.orderConfirmationEmail,
    theme: settings.theme,
    accentColor: settings.accentColor,
    themeEditorPrepared: settings.themeEditorPrepared,
    notifyOrders: settings.notifyOrders,
    notifyStock: settings.notifyStock,
    notifyRefunds: settings.notifyRefunds,
    notifyWeekly: settings.notifyWeekly,
    compactTableDensity: settings.compactTableDensity,
    keyboardShortcuts: settings.keyboardShortcuts,
    autoRefreshDashboard: settings.autoRefreshDashboard,
    maintenanceMode: settings.maintenanceMode,
    webhookEndpoint: settings.webhookEndpoint,
    apiKeysLabel: settings.apiKeysLabel,
    refundAutomation: settings.refundAutomation,
    shipmentTracking: settings.shipmentTracking,
    invoiceActions: settings.invoiceActions,
    updatedAt: settings.updatedAt.toISOString(),
  };
}

function upsertDefaultSettings() {
  return prisma.adminSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...defaultSettings },
    update: {},
  });
}

export async function getAdminSettings(): Promise<AdminSettingsDto> {
  const settings = await upsertDefaultSettings();
  return toDto(settings);
}

export async function updateAdminSettings(input: AdminSettingsPatch): Promise<AdminSettingsDto> {
  await upsertDefaultSettings();

  const { taxRate, ...rest } = input;
  const data: Prisma.AdminSettingsUpdateInput = {
    ...rest,
    ...(taxRate !== undefined && { taxRate: new Prisma.Decimal(taxRate) }),
  };

  const settings = await prisma.adminSettings.update({
    where: { id: SETTINGS_ID },
    data,
  });

  return toDto(settings);
}
