import Link from 'next/link';

const footerLinks = {
  shop: [
    {
      label: 'All products',
      href: '/shop',
    },
    {
      label: 'Brands',
      href: '/brands',
    },
  ],

  support: [
    {
      label: 'Contact',
      href: '/contact',
    },
    {
      label: 'Shipping',
      href: '/shipping',
    },
    {
      label: 'Returns',
      href: '/returns',
    },
  ],

  legal: [
    {
      label: 'Privacy Policy',
      href: '/privacy',
    },
    {
      label: 'Terms of Service',
      href: '/terms',
    },
    {
      label: 'Cookies',
      href: '/cookies',
    },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black pb-[env(safe-area-inset-bottom)] text-neutral-400">
      <div className="mx-auto max-w-7xl px-5 py-6 md:px-6 md:py-6">
        {/* TOP */}

        <div className="grid gap-12 py-8 md:grid-cols-[1.4fr_auto_1fr_1fr_1fr]">
          {/* BRAND */}

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Camarguette</h2>

            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-neutral-400">
              Minimal products, premium experience and digital craftsmanship.
            </p>

            <div className="mt-6">
              <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-neutral-300">
                Designed & developed by Nelson Camargo. Building premium digital experiences.
              </p>

              <Link
                href="/founder"
                className="mt-4 inline-flex text-[15px] text-white transition hover:text-neutral-300"
              >
                Our story →
              </Link>
            </div>
          </div>

          {/* DIVIDER */}

          <div className="relative">
            {/* MOBILE */}

            <div className="h-px w-full bg-white/20 md:hidden" />

            {/* DESKTOP */}

            <div className="hidden h-full w-px self-stretch bg-white/20 md:block" />
          </div>

          {/* LINKS */}

          <div className="grid grid-cols-3 gap-x-4 gap-y-8 md:col-span-3 md:grid-cols-3 md:gap-x-10">
            {/* SHOP */}

            <div>
              <h3 className="text-s font-bold tracking-[0.25em] text-white uppercase">Shop</h3>

              <ul className="mt-5 space-y-3 text-sm md:text-[15px]">
                {footerLinks.shop.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* SUPPORT */}

            <div>
              <h3 className="text-s font-bold tracking-[0.25em] text-white uppercase">Support</h3>

              <ul className="mt-5 space-y-3 text-sm md:text-[15px]">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* LEGAL */}

            <div>
              <h3 className="text-s font-bold tracking-[0.25em] text-white uppercase">Legal</h3>

              <ul className="mt-5 space-y-3 text-sm md:text-[15px]">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* BOTTOM */}

        <div className="border-t border-white/10 py-6 md:pb-6">
          <div className="flex flex-col gap-3 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Camarguette. All rights reserved.</p>

            <p>Designed in Madrid. Built with attention to detail.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
