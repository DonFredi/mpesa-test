"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Home", href: "/" },
  { name: "Pricing", href: "/pricing" },
  { name: "Onboarding", href: "/onboarding" },
  { name: "API", href: "/api-docs" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* LOGO */}
        <Link href="/" className="text-lg font-bold text-green-600">
          Script Pay
        </Link>

        {/* LINKS */}
        <div className="flex gap-6 text-sm">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition ${
                  isActive ? "text-green-600 font-semibold" : "text-gray-600 hover:text-green-600"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
