import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-context";

const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-logo",
});

export const metadata: Metadata = {
  title: "Joyería Bella - Joyería Exclusiva en Bolivia",
  description: "Encuentra piezas únicas de joyería artesanal. Aretes, collares, pulseras, anillos y conjuntos en oro y plata. Envíos a todo Bolivia.",
  keywords: ["joyería", "aretes", "collares", "pulseras", "anillos", "bolivia", "joyería artesanal", "regalo"],
  authors: [{ name: "Joyería Bella" }],
  openGraph: {
    title: "Joyería Bella - Joyería Exclusiva",
    description: "Piezas únicas diseñadas para brillar en cada momento especial. Envíos a todo Bolivia.",
    url: "https://joyeriabella.com",
    siteName: "Joyería Bella",
    locale: "es_BO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Joyería Bella - Joyería Exclusiva",
    description: "Piezas únicas de joyería artesanal en Bolivia.",
  },
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect fill='%23D4AF37' width='32' height='32' rx='6'/><text x='16' y='22' text-anchor='middle' font-family='Arial' font-size='14' font-weight='800' fill='white'>JB</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} ${montserrat.variable}`}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}