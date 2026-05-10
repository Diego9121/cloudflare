'use client';

export function TikTokBanner() {
  return (
    <div className="bg-charcoal py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <svg
          viewBox="0 0 24 24"
          fill="white"
          className="w-5 h-5"
        >
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
        </svg>
        <span className="text-white text-sm hidden sm:inline font-medium">
          ¡Síguenos en TikTok!
        </span>
        <a
          href="https://www.tiktok.com/@bisuteria793"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-gold text-charcoal px-4 py-1.5 rounded-full font-bold text-xs hover:bg-gold-dark transition-colors shadow-sm"
        >
          <span>Joyería Bella</span>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M19 15l-6 6-1.5-1.5L14 17H5V5h1.5l5.5 5.5L10 13l6-6z" />
          </svg>
        </a>
      </div>
    </div>
  );
}