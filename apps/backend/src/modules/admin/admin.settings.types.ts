export interface AdminSettingsDto {
  storeName: string;
  supportEmail: string;
  domain: string;
  country: string;
  currency: string;
  taxRate: number;
  taxLabel: string;
  showTaxes: boolean;
  shippingZone: string;
  estimatedDelivery: string;
  trackingAutomatic: boolean;
  emailFromName: string;
  emailFromAddress: string;
  orderConfirmationEmail: boolean;
  theme: string;
  accentColor: string;
  themeEditorPrepared: boolean;
  notifyOrders: boolean;
  notifyStock: boolean;
  notifyRefunds: boolean;
  notifyWeekly: boolean;
  compactTableDensity: boolean;
  keyboardShortcuts: boolean;
  autoRefreshDashboard: boolean;
  maintenanceMode: boolean;
  webhookEndpoint: string;
  apiKeysLabel: string;
  refundAutomation: boolean;
  shipmentTracking: boolean;
  invoiceActions: boolean;
  updatedAt: string;
}

export type AdminSettingsPatch = Partial<Omit<AdminSettingsDto, "updatedAt">>;
