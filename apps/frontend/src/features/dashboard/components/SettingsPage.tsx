"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CreditCard,
  Globe2,
  KeyRound,
  LockKeyhole,
  LogOut,
  Mail,
  MonitorSmartphone,
  Palette,
  PlugZap,
  RotateCcw,
  Save,
  ShieldCheck,
  Store,
  ToggleLeft,
  ToggleRight,
  Truck,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/shared/lib/api";

type SettingsForm = {
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
};

type SettingsResponse = SettingsForm & { updatedAt: string };
type SettingsKey = keyof SettingsForm;
type SectionId = "store" | "payments" | "shipping" | "email" | "branding" | "security" | "notifications" | "admin" | "maintenance" | "api" | "features";
type PasswordForm = { currentPassword: string; newPassword: string };

const emptySettings: SettingsForm = {
  storeName: "",
  supportEmail: "",
  domain: "",
  country: "",
  currency: "EUR",
  taxRate: 0,
  taxLabel: "",
  showTaxes: false,
  shippingZone: "",
  estimatedDelivery: "",
  trackingAutomatic: false,
  emailFromName: "",
  emailFromAddress: "",
  orderConfirmationEmail: false,
  theme: "",
  accentColor: "",
  themeEditorPrepared: false,
  notifyOrders: false,
  notifyStock: false,
  notifyRefunds: false,
  notifyWeekly: false,
  compactTableDensity: false,
  keyboardShortcuts: false,
  autoRefreshDashboard: false,
  maintenanceMode: false,
  webhookEndpoint: "",
  apiKeysLabel: "",
  refundAutomation: false,
  shipmentTracking: false,
  invoiceActions: false,
};

const sectionFields: Record<SectionId, SettingsKey[]> = {
  store: ["storeName", "supportEmail", "domain", "country"],
  payments: ["currency", "taxRate", "taxLabel", "showTaxes"],
  shipping: ["shippingZone", "estimatedDelivery", "trackingAutomatic"],
  email: ["emailFromName", "emailFromAddress", "orderConfirmationEmail"],
  branding: ["theme", "accentColor", "themeEditorPrepared"],
  security: [],
  notifications: ["notifyOrders", "notifyStock", "notifyRefunds", "notifyWeekly"],
  admin: ["compactTableDensity", "keyboardShortcuts", "autoRefreshDashboard"],
  maintenance: ["maintenanceMode"],
  api: ["webhookEndpoint", "apiKeysLabel"],
  features: ["refundAutomation", "shipmentTracking", "invoiceActions"],
};

export default function SettingsPage() {
  const [savedSettings, setSavedSettings] = useState<SettingsForm | null>(null);
  const [form, setForm] = useState<SettingsForm>(emptySettings);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSection, setSavingSection] = useState<SectionId | "all" | null>(null);
  const [loadingLogoutAll, setLoadingLogoutAll] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({ currentPassword: "", newPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  const isDirty = useMemo(() => (savedSettings ? !settingsEqual(form, savedSettings) : false), [form, savedSettings]);

  const loadSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const res = await apiFetch("/admin/settings");
      if (!res || !res.ok) throw new Error("Settings request failed");
      const data = (await res.json()) as SettingsResponse;
      const next = normalizeSettings(data);
      setSavedSettings(next);
      setForm(next);
      setLastSavedAt(data.updatedAt);
    } catch {
      toast.error("Error cargando settings");
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const updateField = <K extends SettingsKey>(key: K, value: SettingsForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTextChange = (key: Exclude<SettingsKey, "taxRate">) => (event: ChangeEvent<HTMLInputElement>) => {
    updateField(key, event.target.value as SettingsForm[typeof key]);
  };

  const handleTaxRateChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateField("taxRate", Number(event.target.value));
  };

  const resetChanges = () => {
    if (!savedSettings) return;
    setForm(savedSettings);
    toast.info("Cambios descartados");
  };

  const saveSettings = async (section: SectionId | "all" = "all") => {
    if (!savedSettings || !isDirty) return;

    const payload = section === "all" ? form : buildSectionPatch(form, savedSettings, section);
    if (Object.keys(payload).length === 0) return;

    setSavingSection(section);
    try {
      const res = await apiFetch("/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (!res || !res.ok) throw new Error("Settings save failed");
      const data = (await res.json()) as SettingsResponse;
      const next = normalizeSettings(data);
      setSavedSettings(next);
      setForm(next);
      setLastSavedAt(data.updatedAt);
      toast.success(section === "all" ? "Settings guardados" : "Sección guardada");
    } catch {
      toast.error("No se pudieron guardar los cambios");
    } finally {
      setSavingSection(null);
    }
  };

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      toast.error("Error cerrando sesión");
    } finally {
      setLoadingLogout(false);
    }
  };

  const handleLogoutAll = async () => {
    setLoadingLogoutAll(true);
    try {
      await apiFetch("/auth/logout-all", { method: "POST" });
      window.location.href = "/login";
    } catch {
      toast.error("Error cerrando todas las sesiones");
    } finally {
      setLoadingLogoutAll(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || passwordForm.newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(passwordForm),
      });
      if (!res || !res.ok) throw new Error("Password update failed");
      toast.success("Contraseña actualizada. Inicia sesión de nuevo.");
      window.location.href = "/login";
    } catch {
      toast.error("No se pudo actualizar la contraseña");
    } finally {
      setSavingPassword(false);
    }
  };

  const sectionIsSaving = (section: SectionId) => savingSection === section || savingSection === "all";
  const sectionIsDirty = (section: SectionId) => (savedSettings ? sectionFields[section].some((key) => form[key] !== savedSettings[key]) : false);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_32%),linear-gradient(135deg,#111111,#070707)] p-5 shadow-2xl shadow-black/30 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">Configuración</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-4xl">Settings de tienda</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base">Centro operativo conectado a persistencia real para ecommerce, preferencias admin, seguridad, notificaciones e integraciones.</p>
            <p className="mt-3 text-xs text-neutral-500">{lastSavedAt ? `Último guardado: ${new Date(lastSavedAt).toLocaleString("es-ES")}` : "Sin datos guardados todavía"}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button onClick={resetChanges} disabled={!isDirty || loadingSettings || savingSection !== null} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"><RotateCcw size={16} /> Descartar</button>
            <button onClick={() => saveSettings("all")} disabled={!isDirty || loadingSettings || savingSection !== null} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"><Save size={16} /> {savingSection === "all" ? "Guardando..." : "Guardar cambios"}</button>
          </div>
        </div>
        {isDirty && <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">Tienes cambios sin guardar. Guarda todo o usa el botón de cada sección.</div>}
      </section>

      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden h-fit rounded-3xl border border-white/10 bg-neutral-950/80 p-4 shadow-xl shadow-black/20 xl:block">
          {settingsNav.map((item) => <a key={item.href} href={item.href} className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-neutral-400 transition hover:bg-white/[0.06] hover:text-white"><item.icon size={16} />{item.label}</a>)}
        </aside>

        <div className="space-y-6">
          {loadingSettings ? <SettingsSkeleton /> : <>
            <SettingsSection id="store" icon={Store} title="Store information" description="Datos base para facturas, emails y checkout." dirty={sectionIsDirty("store")} loading={sectionIsSaving("store")} onSave={() => saveSettings("store")}>
              <div className="grid gap-4 md:grid-cols-2"><Field label="Nombre de tienda" value={form.storeName} onChange={handleTextChange("storeName")} /><Field label="Email soporte" type="email" value={form.supportEmail} onChange={handleTextChange("supportEmail")} /><Field label="Dominio" value={form.domain} onChange={handleTextChange("domain")} /><Field label="País operativo" value={form.country} onChange={handleTextChange("country")} /></div>
            </SettingsSection>

            <div className="grid gap-6 lg:grid-cols-2">
              <SettingsSection id="payments" icon={CreditCard} title="Currency & taxes" description="Configuración monetaria preparada para multi-currency." dirty={sectionIsDirty("payments")} loading={sectionIsSaving("payments")} onSave={() => saveSettings("payments")}>
                <Field label="Moneda principal" value={form.currency} onChange={handleTextChange("currency")} /><Field label="Impuesto por defecto (%)" type="number" min="0" max="100" step="0.01" value={String(form.taxRate)} onChange={handleTaxRateChange} /><Field label="Etiqueta impuesto" value={form.taxLabel} onChange={handleTextChange("taxLabel")} /><ToggleRow label="Mostrar impuestos en checkout" enabled={form.showTaxes} onToggle={() => updateField("showTaxes", !form.showTaxes)} />
              </SettingsSection>
              <SettingsSection id="shipping" icon={Truck} title="Shipping settings" description="Base para reglas de envío y tracking." dirty={sectionIsDirty("shipping")} loading={sectionIsSaving("shipping")} onSave={() => saveSettings("shipping")}>
                <Field label="Zona principal" value={form.shippingZone} onChange={handleTextChange("shippingZone")} /><Field label="Tiempo estimado" value={form.estimatedDelivery} onChange={handleTextChange("estimatedDelivery")} /><ToggleRow label="Tracking automático" enabled={form.trackingAutomatic} onToggle={() => updateField("trackingAutomatic", !form.trackingAutomatic)} />
              </SettingsSection>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <SettingsSection id="email" icon={Mail} title="Email settings" description="Plantillas transaccionales y remitente." dirty={sectionIsDirty("email")} loading={sectionIsSaving("email")} onSave={() => saveSettings("email")}>
                <Field label="From name" value={form.emailFromName} onChange={handleTextChange("emailFromName")} /><Field label="From email" type="email" value={form.emailFromAddress} onChange={handleTextChange("emailFromAddress")} /><ToggleRow label="Enviar confirmación de pedido" enabled={form.orderConfirmationEmail} onToggle={() => updateField("orderConfirmationEmail", !form.orderConfirmationEmail)} />
              </SettingsSection>
              <SettingsSection id="branding" icon={Palette} title="Branding & theme" description="Identidad visual y theming futuro." dirty={sectionIsDirty("branding")} loading={sectionIsSaving("branding")} onSave={() => saveSettings("branding")}>
                <Field label="Theme" value={form.theme} onChange={handleTextChange("theme")} /><Field label="Accent color" value={form.accentColor} onChange={handleTextChange("accentColor")} /><ToggleRow label="Theme editor preparado" enabled={form.themeEditorPrepared} onToggle={() => updateField("themeEditorPrepared", !form.themeEditorPrepared)} />
              </SettingsSection>
            </div>

            <SettingsSection id="security" icon={ShieldCheck} title="Security" description="Gestión de contraseña, sesiones y acceso administrativo.">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"><div className="flex items-center gap-3"><KeyRound className="text-amber-300" size={18} /><h3 className="font-semibold text-white">Password change</h3></div><div className="mt-4 grid gap-3"><input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))} placeholder="Contraseña actual" className="dashboard-input" /><input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))} placeholder="Nueva contraseña" className="dashboard-input" /><button onClick={handlePasswordChange} disabled={savingPassword} className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-neutral-300 transition hover:bg-white/10 disabled:opacity-60">{savingPassword ? "Actualizando..." : "Actualizar contraseña"}</button></div></div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"><div className="flex items-center gap-3"><MonitorSmartphone className="text-sky-300" size={18} /><h3 className="font-semibold text-white">Session management</h3></div><p className="mt-3 text-sm text-neutral-500">Revoca sesiones si detectas actividad sospechosa.</p><div className="mt-5 flex flex-col gap-3"><button onClick={handleLogout} disabled={loadingLogout} className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"><LogOut size={16} className="mr-2 inline" />{loadingLogout ? "Cerrando..." : "Cerrar sesión"}</button><button onClick={handleLogoutAll} disabled={loadingLogoutAll} className="rounded-2xl border border-orange-400/30 bg-orange-500/10 px-4 py-3 text-sm font-semibold text-orange-200 transition hover:bg-orange-500/20 disabled:opacity-60">{loadingLogoutAll ? "Revocando..." : "Cerrar sesión en todos"}</button></div></div>
              </div>
            </SettingsSection>

            <SettingsSection id="notifications" icon={Bell} title="Notification preferences" description="Alertas operativas para pedidos, stock y finanzas." dirty={sectionIsDirty("notifications")} loading={sectionIsSaving("notifications")} onSave={() => saveSettings("notifications")}>
              <div className="grid gap-3 md:grid-cols-2"><ToggleCard label="orders" enabled={form.notifyOrders} onToggle={() => updateField("notifyOrders", !form.notifyOrders)} /><ToggleCard label="stock" enabled={form.notifyStock} onToggle={() => updateField("notifyStock", !form.notifyStock)} /><ToggleCard label="refunds" enabled={form.notifyRefunds} onToggle={() => updateField("notifyRefunds", !form.notifyRefunds)} /><ToggleCard label="weekly" enabled={form.notifyWeekly} onToggle={() => updateField("notifyWeekly", !form.notifyWeekly)} /></div>
            </SettingsSection>

            <div className="grid gap-6 lg:grid-cols-2">
              <SettingsSection id="admin" icon={LockKeyhole} title="Admin preferences" description="Preferencias locales del panel." dirty={sectionIsDirty("admin")} loading={sectionIsSaving("admin")} onSave={() => saveSettings("admin")}><ToggleRow label="Compact table density" enabled={form.compactTableDensity} onToggle={() => updateField("compactTableDensity", !form.compactTableDensity)} /><ToggleRow label="Keyboard shortcuts" enabled={form.keyboardShortcuts} onToggle={() => updateField("keyboardShortcuts", !form.keyboardShortcuts)} /><ToggleRow label="Auto refresh dashboard" enabled={form.autoRefreshDashboard} onToggle={() => updateField("autoRefreshDashboard", !form.autoRefreshDashboard)} /></SettingsSection>
              <SettingsSection id="maintenance" icon={Wrench} title="Maintenance mode" description="Control persistente para bloquear checkout temporalmente." dirty={sectionIsDirty("maintenance")} loading={sectionIsSaving("maintenance")} onSave={() => saveSettings("maintenance")}><button onClick={() => updateField("maintenanceMode", !form.maintenanceMode)} className={`w-full rounded-3xl border p-5 text-left transition ${form.maintenanceMode ? "border-amber-400/30 bg-amber-400/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}><p className="font-semibold text-white">{form.maintenanceMode ? "Maintenance activo" : "Maintenance inactivo"}</p><p className="mt-1 text-sm text-neutral-500">Estado guardado en backend para integrarlo con checkout.</p></button></SettingsSection>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <SettingsSection id="api" icon={PlugZap} title="API & Webhooks" description="Endpoints y gestión de secretos." dirty={sectionIsDirty("api")} loading={sectionIsSaving("api")} onSave={() => saveSettings("api")}><Field label="Webhook endpoint" value={form.webhookEndpoint} onChange={handleTextChange("webhookEndpoint")} /><Field label="API keys" value={form.apiKeysLabel} onChange={handleTextChange("apiKeysLabel")} /></SettingsSection>
              <SettingsSection id="features" icon={Globe2} title="Feature toggles" description="Control gradual de funcionalidades futuras." dirty={sectionIsDirty("features")} loading={sectionIsSaving("features")} onSave={() => saveSettings("features")}><ToggleRow label="Refund automation" enabled={form.refundAutomation} onToggle={() => updateField("refundAutomation", !form.refundAutomation)} /><ToggleRow label="Shipment tracking" enabled={form.shipmentTracking} onToggle={() => updateField("shipmentTracking", !form.shipmentTracking)} /><ToggleRow label="Invoice actions" enabled={form.invoiceActions} onToggle={() => updateField("invoiceActions", !form.invoiceActions)} /></SettingsSection>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}

const settingsNav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "#store", label: "Store", icon: Store }, { href: "#payments", label: "Currency & taxes", icon: CreditCard }, { href: "#shipping", label: "Shipping", icon: Truck }, { href: "#email", label: "Email", icon: Mail }, { href: "#branding", label: "Branding", icon: Palette }, { href: "#security", label: "Security", icon: ShieldCheck }, { href: "#notifications", label: "Notifications", icon: Bell }, { href: "#api", label: "API/Webhooks", icon: PlugZap },
];

function normalizeSettings(settings: SettingsResponse): SettingsForm { const { updatedAt: _updatedAt, ...form } = settings; void _updatedAt; return form; }
function settingsEqual(a: SettingsForm, b: SettingsForm) { return (Object.keys(a) as SettingsKey[]).every((key) => a[key] === b[key]); }
function buildSectionPatch(form: SettingsForm, saved: SettingsForm, section: SectionId): Partial<SettingsForm> { const patch: Partial<SettingsForm> = {}; const writablePatch = patch as Record<SettingsKey, SettingsForm[SettingsKey]>; sectionFields[section].forEach((key) => { if (form[key] !== saved[key]) writablePatch[key] = form[key]; }); return patch; }
function SettingsSection({ id, icon: Icon, title, description, children, dirty = false, loading = false, onSave }: { id: string; icon: LucideIcon; title: string; description: string; children: ReactNode; dirty?: boolean; loading?: boolean; onSave?: () => void }) { return <section id={id} className="scroll-mt-6 rounded-3xl border border-white/10 bg-neutral-950/80 p-5 shadow-xl shadow-black/20 sm:p-6"><div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex items-start gap-4"><div className="rounded-2xl bg-white/[0.06] p-3 text-neutral-300"><Icon size={20} /></div><div><h2 className="text-lg font-semibold text-white">{title}</h2><p className="mt-1 text-sm leading-6 text-neutral-400">{description}</p></div></div>{onSave && <button onClick={onSave} disabled={!dirty || loading} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-neutral-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"><Save size={14} />{loading ? "Guardando..." : dirty ? "Guardar sección" : "Sin cambios"}</button>}</div>{children}</section>; }
function Field({ label, value, onChange, type = "text", ...props }: { label: string; value: string; onChange: (event: ChangeEvent<HTMLInputElement>) => void; type?: string } & Omit<React.ComponentProps<"input">, "value" | "onChange" | "type">) { return <label className="block space-y-2"><span className="text-sm font-medium text-neutral-300">{label}</span><input type={type} value={value} onChange={onChange} className="dashboard-input" {...props} /></label>; }
function ToggleRow({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) { return <button type="button" onClick={onToggle} className="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.06]"><span className="text-sm font-medium text-white">{label}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${enabled ? "bg-emerald-400/10 text-emerald-200" : "bg-neutral-400/10 text-neutral-400"}`}>{enabled ? "Enabled" : "Disabled"}</span></button>; }
function ToggleCard({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) { const Icon = enabled ? ToggleRight : ToggleLeft; return <button onClick={onToggle} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.06]"><span className="text-sm font-medium capitalize text-white">{label}</span><Icon className={enabled ? "text-emerald-300" : "text-neutral-600"} /></button>; }
function SettingsSkeleton() { return <div className="space-y-6">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-52 animate-pulse rounded-3xl bg-white/[0.06]" />)}</div>; }
