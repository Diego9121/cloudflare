'use client';

import Link from "next/link";
import { useCart } from "./cart-context";

export function Header() {
  const { totalItems, cartAnimation } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white text-lg font-bold">JB</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-charcoal tracking-wider" style={{ fontFamily: 'var(--font-logo), Montserrat, sans-serif' }}>
                Joyería Bella
              </h1>
              <p className="text-xs text-gray-400 tracking-widest uppercase">Joyería Fina</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/carrito"
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5 text-charcoal"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <span className="font-medium text-charcoal hidden sm:inline">Carrito</span>
              {totalItems > 0 && (
                <span className={`absolute -top-1.5 -right-1.5 bg-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm transition-all duration-300 ${
                  cartAnimation ? 'scale-150 bg-green-500' : ''
                }`}>
                  {totalItems}
                </span>
              )}
            </Link>

            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-charcoal to-gray-800 text-white hover:from-gray-800 hover:to-charcoal transition-all shadow-md"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              <span className="hidden sm:inline text-sm">Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}