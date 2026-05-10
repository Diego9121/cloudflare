import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #FFF8E7 0%, #FFF5D4 100%)",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "2rem",
          boxShadow: "0 8px 32px rgba(212, 175, 55, 0.3)",
        }}
      >
        <span style={{ fontSize: 48, fontWeight: 800, color: "#fff" }}>404</span>
      </div>

      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          color: "#2D2D2D",
          marginBottom: "0.75rem",
          fontFamily: "var(--font-logo), Arial, sans-serif",
        }}
      >
        Página No Encontrada
      </h1>

      <p
        style={{
          fontSize: "1.1rem",
          color: "#666",
          maxWidth: 400,
          lineHeight: 1.6,
          marginBottom: "2rem",
        }}
      >
        Lo sentimos, la página que buscas no existe o fue movida. Explora nuestro catálogo para descubrir piezas únicas.
      </p>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.875rem 1.75rem",
            background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
            color: "#fff",
            borderRadius: 12,
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(212, 175, 55, 0.35)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
        >
          <Home size={18} />
          Ir al Inicio
        </Link>

        <Link
          href="/catalogo"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.875rem 1.75rem",
            background: "#fff",
            color: "#D4AF37",
            border: "2px solid #D4AF37",
            borderRadius: 12,
            fontWeight: 600,
            textDecoration: "none",
            transition: "transform 0.2s",
          }}
        >
          <ArrowLeft size={18} />
          Ver Catálogo
        </Link>
      </div>

      
    </div>
  );
}