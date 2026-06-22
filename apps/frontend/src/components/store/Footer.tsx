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
    <footer className="border-t border-white/5 bg-black text-neutral-400">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-6 md:py-10">
        {/* TOP */}

        <div className="grid gap-12 md:grid-cols-[1.4fr_auto_1fr_1fr_1fr]">
          {/* BRAND */}

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Camarguette</h2>

            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-neutral-400">
              Minimal products, premium experience and digital craftsmanship.
            </p>

            {/* FOUNDER */}

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-sm tracking-[0.3em] text-neutral-400 uppercase">Founder</p>

              <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-neutral-300">
                Designed & developed by Nelson Camargo — Building premium digital experiences.
              </p>

              <Link
                href="/founder"
                className="mt-4 inline-flex text-[15px] text-white transition hover:text-neutral-300"
              >
                About the founder →
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

          <div className="grid grid-cols-2 gap-x-10 gap-y-10 md:col-span-3 md:grid-cols-3">
            {/* SHOP */}

            <div>
              <h3 className="text-xs font-semibold tracking-[0.25em] text-white uppercase">Shop</h3>

              <ul className="mt-5 space-y-3 text-[15px]">
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
              <h3 className="text-xs font-semibold tracking-[0.25em] text-white uppercase">
                Support
              </h3>

              <ul className="mt-5 space-y-3 text-[15px]">
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
              <h3 className="text-xs font-semibold tracking-[0.25em] text-white uppercase">
                Legal
              </h3>

              <ul className="mt-5 space-y-3 text-[15px]">
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

        <div className="mt-14 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-3 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Camarguette. All rights reserved.</p>

            <p>Designed in Madrid. Built with attention to detail.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
