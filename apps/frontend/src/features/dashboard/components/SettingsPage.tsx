"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Bell, CreditCard, Globe2, KeyRound, LockKeyhole, LogOut, Mail, MonitorSmartphone, Palette, PlugZap, Save, ShieldCheck, Store, ToggleLeft, Truck, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/shared/lib/api";

export default function SettingsPage() {
  const [loadingLogoutAll, setLoadingLogoutAll] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [notifications, setNotifications] = useState({ orders: true, stock: true, refunds: true, weekly: false });

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

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_32%),linear-gradient(135deg,#111111,#070707)] p-5 shadow-2xl shadow-black/30 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">Configuración</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-4xl">Settings de tienda</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base">Centro operativo para datos de ecommerce, preferencias admin, seguridad, notificaciones e integraciones futuras.</p>
          </div>
          <button onClick={() => toast.success("Preferencias locales preparadas")} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200"><Save size={16} /> Guardar borrador</button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden h-fit rounded-3xl border border-white/10 bg-neutral-950/80 p-4 shadow-xl shadow-black/20 xl:block">
          {settingsNav.map((item) => <a key={item.href} href={item.href} className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-neutral-400 transition hover:bg-white/[0.06] hover:text-white"><item.icon size={16} />{item.label}</a>)}
        </aside>

        <div className="space-y-6">
          <SettingsSection id="store" icon={Store} title="Store information" description="Datos base para facturas, emails y checkout.">
            <div className="grid gap-4 md:grid-cols-2"><Field label="Nombre de tienda" value="Shop Proyect" /><Field label="Email soporte" value="support@shopproyect.com" /><Field label="Dominio" value="shopproyect.com" /><Field label="País operativo" value="España" /></div>
          </SettingsSection>

          <div className="grid gap-6 lg:grid-cols-2">
            <SettingsSection id="payments" icon={CreditCard} title="Currency & taxes" description="Configuración monetaria preparada para multi-currency.">
              <Field label="Moneda principal" value="EUR · Euro" /><Field label="Impuesto por defecto" value="21% IVA" /><ToggleRow label="Mostrar impuestos en checkout" enabled />
            </SettingsSection>
            <SettingsSection id="shipping" icon={Truck} title="Shipping settings" description="Base para reglas de envío y tracking.">
              <Field label="Zona principal" value="EU shipping zone" /><Field label="Tiempo estimado" value="2-5 días laborables" /><ToggleRow label="Tracking automático" enabled={false} />
            </SettingsSection>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SettingsSection id="email" icon={Mail} title="Email settings" description="Plantillas transaccionales y remitente.">
              <Field label="From name" value="Shop Proyect" /><Field label="From email" value="no-reply@shopproyect.com" /><ToggleRow label="Enviar confirmación de pedido" enabled />
            </SettingsSection>
            <SettingsSection id="branding" icon={Palette} title="Branding & theme" description="Identidad visual y theming futuro.">
              <Field label="Theme" value="Dark premium" /><Field label="Accent color" value="Emerald / Indigo" /><ToggleRow label="Theme editor preparado" enabled={false} />
            </SettingsSection>
          </div>

          <SettingsSection id="security" icon={ShieldCheck} title="Security" description="Gestión de contraseña, sesiones y acceso administrativo.">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"><div className="flex items-center gap-3"><KeyRound className="text-amber-300" size={18} /><h3 className="font-semibold text-white">Password change</h3></div><div className="mt-4 grid gap-3"><input type="password" placeholder="Contraseña actual" className="dashboard-input" /><input type="password" placeholder="Nueva contraseña" className="dashboard-input" /><button className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-neutral-300 transition hover:bg-white/10">Actualizar contraseña</button></div></div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"><div className="flex items-center gap-3"><MonitorSmartphone className="text-sky-300" size={18} /><h3 className="font-semibold text-white">Session management</h3></div><p className="mt-3 text-sm text-neutral-500">Revoca sesiones si detectas actividad sospechosa.</p><div className="mt-5 flex flex-col gap-3"><button onClick={handleLogout} disabled={loadingLogout} className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"><LogOut size={16} className="mr-2 inline" />{loadingLogout ? "Cerrando..." : "Cerrar sesión"}</button><button onClick={handleLogoutAll} disabled={loadingLogoutAll} className="rounded-2xl border border-orange-400/30 bg-orange-500/10 px-4 py-3 text-sm font-semibold text-orange-200 transition hover:bg-orange-500/20 disabled:opacity-60">{loadingLogoutAll ? "Revocando..." : "Cerrar sesión en todos"}</button></div></div>
            </div>
          </SettingsSection>

          <SettingsSection id="notifications" icon={Bell} title="Notification preferences" description="Alertas operativas para pedidos, stock y finanzas.">
            <div className="grid gap-3 md:grid-cols-2">{Object.entries(notifications).map(([key, enabled]) => <button key={key} onClick={() => setNotifications((prev) => ({ ...prev, [key]: !enabled }))} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.06]"><span className="text-sm font-medium capitalize text-white">{key}</span><ToggleLeft className={enabled ? "text-emerald-300" : "text-neutral-600"} /></button>)}</div>
          </SettingsSection>

          <div className="grid gap-6 lg:grid-cols-2">
            <SettingsSection id="admin" icon={LockKeyhole} title="Admin preferences" description="Preferencias locales del panel."><ToggleRow label="Compact table density" enabled={false} /><ToggleRow label="Keyboard shortcuts" enabled /><ToggleRow label="Auto refresh dashboard" enabled /></SettingsSection>
            <SettingsSection id="maintenance" icon={Wrench} title="Maintenance mode" description="UI preparada para bloquear checkout temporalmente."><button onClick={() => setMaintenanceMode((value) => !value)} className={`w-full rounded-3xl border p-5 text-left transition ${maintenanceMode ? "border-amber-400/30 bg-amber-400/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}><p className="font-semibold text-white">{maintenanceMode ? "Maintenance UI activo" : "Maintenance UI inactivo"}</p><p className="mt-1 text-sm text-neutral-500">Placeholder seguro; no altera checkout real.</p></button></SettingsSection>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SettingsSection id="api" icon={PlugZap} title="API & Webhooks" description="Preparado para eventos externos."><Placeholder title="Webhook endpoint" value="https://shopproyect.com/api/webhooks" /><Placeholder title="API keys" value="Secret management pending" /></SettingsSection>
            <SettingsSection id="features" icon={Globe2} title="Feature toggles" description="Control gradual de funcionalidades futuras."><ToggleRow label="Refund automation" enabled={false} /><ToggleRow label="Shipment tracking" enabled={false} /><ToggleRow label="Invoice actions" enabled /></SettingsSection>
          </div>
        </div>
      </div>
    </div>
  );
}

const settingsNav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "#store", label: "Store", icon: Store }, { href: "#payments", label: "Currency & taxes", icon: CreditCard }, { href: "#shipping", label: "Shipping", icon: Truck }, { href: "#email", label: "Email", icon: Mail }, { href: "#branding", label: "Branding", icon: Palette }, { href: "#security", label: "Security", icon: ShieldCheck }, { href: "#notifications", label: "Notifications", icon: Bell }, { href: "#api", label: "API/Webhooks", icon: PlugZap },
];
function SettingsSection({ id, icon: Icon, title, description, children }: { id: string; icon: LucideIcon; title: string; description: string; children: ReactNode }) { return <section id={id} className="scroll-mt-6 rounded-3xl border border-white/10 bg-neutral-950/80 p-5 shadow-xl shadow-black/20 sm:p-6"><div className="mb-5 flex items-start gap-4"><div className="rounded-2xl bg-white/[0.06] p-3 text-neutral-300"><Icon size={20} /></div><div><h2 className="text-lg font-semibold text-white">{title}</h2><p className="mt-1 text-sm leading-6 text-neutral-400">{description}</p></div></div>{children}</section>; }
function Field({ label, value }: { label: string; value: string }) { return <label className="block space-y-2"><span className="text-sm font-medium text-neutral-300">{label}</span><input value={value} readOnly className="dashboard-input" /></label>; }
function ToggleRow({ label, enabled }: { label: string; enabled: boolean }) { return <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"><span className="text-sm font-medium text-white">{label}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${enabled ? "bg-emerald-400/10 text-emerald-200" : "bg-neutral-400/10 text-neutral-400"}`}>{enabled ? "Enabled" : "Prepared"}</span></div>; }
function Placeholder({ title, value }: { title: string; value: string }) { return <div className="mt-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4"><p className="text-sm font-semibold text-white">{title}</p><p className="mt-1 break-all text-xs text-neutral-500">{value}</p></div>; }
