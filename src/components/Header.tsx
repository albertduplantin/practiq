'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';

const navItems = [
  { href: '/', label: 'Accueil' },
  { href: '/login', label: 'Connexion' },
];

export default function Header() {
  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary">
          Practiq
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-primary-dark">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu with Sheet */}
        <Sheet
          trigger={
            <button
              className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Menu"
            >
              <Menu size={24} />
            </button>
          }
          side="left"
        >
          <div className="flex flex-col gap-4 mt-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </Sheet>
      </div>
    </header>
  );
}
