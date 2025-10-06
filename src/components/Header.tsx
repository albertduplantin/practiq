'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, Sun, Moon } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { useTheme } from 'next-themes';

const navItems = [
  { href: '/', label: 'Accueil' },
  { href: '/login', label: 'Connexion' },
];

export default function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Practiq" width={32} height={32} />
          <span className="text-xl font-bold text-primary">Practiq</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6 items-center">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-primary-dark">
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>

        {/* Mobile menu with Sheet */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Sheet
            trigger={
              <button
                className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
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
      </div>
    </header>
  );
}
