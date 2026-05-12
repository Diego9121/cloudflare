# Joyería Bella - Documentación del Proyecto

## Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| **Next.js 14.2.3** | Framework frontend con App Router |
| **TypeScript** | Tipado estático |
| **Supabase** | Base de datos PostgreSQL + Auth |
| **Cloudinary** | Almacenamiento y transformación de imágenes |
| **Tailwind CSS 4.x** | Estilos |
| **shadcn/ui** | Componentes UI |
| **react-easy-crop** | Recorte de imágenes |

---

## Estructura del Proyecto

```
joyeria-bella/
├── app/
│   ├── page.tsx                    # Home - Catálogo de módulos
│   ├── modulo/[id]/page.tsx        # Catálogo de productos por módulo
│   ├── carrito/page.tsx            # Carrito de compras
│   ├── admin/
│   │   ├── page.tsx                # Login admin
│   │   ├── dashboard/page.tsx      # Dashboard
│   │   ├── productos/page.tsx      # Gestión productos
│   │   ├── modulos/page.tsx        # Gestión módulos/subcategorías
│   │   └── cotizaciones/page.tsx   # Gestión cotizaciones
│   └── layout.tsx                  # Layout principal
├── components/
│   ├── ProductCard.tsx             # Tarjeta de producto
│   ├── ProductGrid.tsx             # Grid de productos
│   ├── hero-categories.tsx         # Módulos en home
│   ├── header.tsx                  # Header
│   ├── footer.tsx                  # Footer
│   ├── cart-context.tsx            # Context del carrito
│   ├── ImageCropModal.tsx          # Modal de recorte
│   ├── whatsapp-button.tsx          # Botón flotante WhatsApp
│   └── ui/                          # Componentes shadcn
├── lib/
│   ├── supabase.ts                 # Configuración Supabase
│   ├── constants.ts                # Constantes (departamentos, precios)
│   ├── imageUtils.ts               # Utilidades de imágenes
│   └── hooks/
│       └── useInfiniteProducts.ts  # Hook infinite scroll
└── supabase/
    └── migrations/                  # Migraciones SQL
```

---

## Base de Datos (Supabase)

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `modulos` | Categorías principales (Aretes, Collares, etc.) |
| `subcategorias` | Subcategorías con prefijo de código |
| `productos` | Productos con código, precio, stock, imagen |
| `cotizaciones` | Pedidos de clientes |
| `admin_users` | Usuarios del panel admin |

### Estructura de Código de Productos

```
Formato: [prefijo_módulo][prefijo_subcategoría][número]
Ejemplos:
- Aretes (AR) sin subcategoría: AR001, AR002...
- Aretes (AR) + Colgantes (C): ARC001, ARC002...
- Collares (C) + Tulipanes (T): CT001, CT002...
```

---

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Iniciar servidor de producción |
| `npm run lint` | Verificar errores de lint |

---

## Configuración de Entorno (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Características Principales

### Cliente (Público)
- Catálogo de productos por módulo
- Filtro por subcategoría
- Sistema de infinite scroll (24 productos por carga)
- Carrito con persistencia localStorage
- Envío de cotizaciones por WhatsApp

### Admin
- Login con usuario/contraseña (sessionStorage)
- CRUD de productos con subida de imágenes
- CRUD de módulos y subcategorías
- Sistema de prefijos de código automáticos
- Gestión de cotizaciones (PENDIENTE → PAGADO → APROBADO)
- Paginación de 30 productos en gestión

### Imágenes
- Cloudinary para almacenamiento
- Transformaciones optimizadas (w_400, f_auto, q_auto)
- Recorte de imágenes antes de subir (react-easy-crop)

---

## Constantes Importantes

- **Moneda**: Bolivianos (Bs)
- **WhatsApp Admin**: 59174913218
- **Departamentos Bolivia**: 9 (La Paz, Cochabamba, Santa Cruz, etc.)
- **Provincias Bolivia**: 99

---

## Estilos y Colores

| Color | Valor | Uso |
|-------|-------|-----|
| Gold | `#D4A84B` | Acentos, botones |
| Charcoal | `#2D3436` | Fondos oscuros, texto |
| Cream | `#FDF6E3` | Fondos claros |

---

## Notas Técnicas

1. **Códigos de productos**: Se generan automáticamente usando prefijo del módulo + prefijo de subcategoría (si existe)
2. **Stock mínimo**: 0 (no permite backorder)
3. **Validación de stock**: Al agregar al carrito, se verifica disponibilidad
4. **Validez cotización**: 15 minutos

---

## Mantenimiento

- Actualizar dependencias: `npm install`
- Verificar tipos: `npx tsc --noEmit`
- Limpiar build: `rm -rf .next`