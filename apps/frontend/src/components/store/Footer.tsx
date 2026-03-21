import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-neutral-400 border-t border-neutral-800 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* BRAND */}
        <div>
          <h2 className="text-white font-bold text-lg mb-4">
            Koky Store
          </h2>
          <p className="text-sm">
            Minimal design. Premium quality.
          </p>
        </div>

        {/* SHOP */}
        <div>
          <h3 className="text-white font-medium mb-4">Shop</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop">All products</Link></li>
            <li><Link href="/brands">Brands</Link></li>
          </ul>
        </div>

        {/* SUPPORT */}
        <div>
          <h3 className="text-white font-medium mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="#">Contact</Link></li>
            <li><Link href="#">Shipping</Link></li>
            <li><Link href="#">Returns</Link></li>
          </ul>
        </div>

        {/* LEGAL */}
        <div>
          <h3 className="text-white font-medium mb-4">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="#">Privacy Policy</Link></li>
            <li><Link href="#">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="text-center text-xs py-6 border-t border-neutral-800">
        © {new Date().getFullYear()} Koky Store. All rights reserved.
      </div>
    </footer>
  );
}