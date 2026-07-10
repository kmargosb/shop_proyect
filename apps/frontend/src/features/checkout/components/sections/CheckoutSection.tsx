type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function CheckoutSection({ title, subtitle, children }: Props) {
  return (
    <section className="rounded-2xl border border-white/10 bg-neutral-900 p-5 md:p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">{title}</h2>

        {subtitle && <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>}
      </div>

      <div className="space-y-5">{children}</div>
    </section>
  );
}
