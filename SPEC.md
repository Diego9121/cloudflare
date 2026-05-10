# Joyería Bella - Especificación del Proyecto

## Stack Tecnológico
- **Frontend/Hosting**: Next.js + Vercel (gratuito)
- **Base de datos**: Supabase (PostgreSQL + Auth)
- **Imágenes**: Cloudinary

## Estructura de Productos

### Módulos y Subcategorías

| Módulo | Prefijo Código | Subcategorías |
|--------|---------------|---------------|
| Aretes | AR | Colgantes, Niña, Tambor |
| Dormilonas | D | Juveniles, Niñas |
| Collares | C | Tulipanes, Mixtos |
| Anillos | A | (sin subcategorías) |
| Pulseras | P | (sin subcategorías) |
| Conjuntos | CO | (sin subcategorías) |

### Reglas de Negocio - Productos

| Regla | Descripción |
|-------|-------------|
| **Código producto** | Auto-generado al crear (AR001, AR002...). No editable después. |
| **Precio** | Supports decimales (ej: 9.50 Bs) |
| **Liquidación** | Toggle + precio manual. % descuento se calcula automático. |
| **Stock mínimo** | 0 (no backorder) |
| **AGOTADO** | Badge rojo centrado cuando stock = 0 |
| **Stock cliente** | Cliente no puede agregar más del stock disponible |

## Catálogo Cliente

### Características:
- Filtro por módulo
- Filtro por subcategoría
- Infinite scroll (24 productos por carga)
- Mostrar: nombre, precio, descuento, imagen
- Badge "AGOTADO" cuando stock = 0
- Selector cantidad (máximo = stock disponible)
- Persistencia del carrito en localStorage

### Estados de producto:
- **Normal**: precio visible (ej: 10.00 Bs)
- **Liquidación**: ~~10.00 Bs~~ 8.50 Bs + badge -15%
- **Agotado**: overlay "AGOTADO", no selectable

### Display de Precios:
```
Normal:     10.00 Bs
Liquidación: ~~10.00 Bs~~  8.50 Bs  (-15%)
```

## Panel Admin

### Login:
- Campos: Nombre, Contraseña
- Sin email, solo nombre de usuario
- Sesión en sessionStorage
- Toggle ver/ocultar contraseña
- Link "Contactar soporte por WhatsApp" (abre chat directo)
- Diseño: ícono candado dorado, íconos usuario/contraseña en inputs, línea decorativa dorada, spinner de carga
- Contraseña hasheada con bcrypt (bcryptjs)

### Seguridad:
- Contraseña almacenada como hash bcrypt (no texto plano)
- Cambio de contraseña desde dashboard (modal): pide contraseña actual, nueva y confirmación
- Mínimo 4 caracteres en nueva contraseña

### Gestión de Productos

#### Modal simplificado incluye:
- Vista previa imagen (120x120)
- Upload imagen (Cloudinary)
- Nombre del producto
- Selector Módulo + botón [+ Crear nuevo]
- Selector Subcategoría + botón [+ Crear nueva]
- Precio (Bs) - soporta decimales
- Toggle "En Liquidación" + campo precio descuento
- Stock (número entero)
- Código auto-generado (no editable)

#### Modales inline para crear:
- **Nuevo Módulo**: nombre + prefijo código
- **Nueva Subcategoría**: nombre + selector módulo

#### Tabla de productos muestra:
- Thumbnail imagen
- Código, Nombre, Módulo
- Precio (con/tachado según descuento)
- Stock (rojo si = 0)
- Acciones: Editar, Desactivar/Activar, Eliminar

### Gestión de Cotizaciones

#### Características:
- Lista de cotizaciones ordenadas por fecha
- Filtro por estado (PENDIENTE, PAGADO, APROBADO, RECHAZADO)
- Buscador por nombre o celular
- Botón "Contactar" → WhatsApp directo al cliente

#### Al mostrar cotización:
- Datos del cliente
- Lista de productos con código, nombre, cantidad, subtotal
- **Alerta de stock insuficiente** si algún producto tiene menos disponible que solicitado
- Total de la cotización
- Notas del cliente

#### Estados y acciones:
| Estado | Acciones disponibles |
|--------|---------------------|
| PENDIENTE | Marcar Pagado, Rechazar |
| PAGADO | Aprobar (descuenta stock), Rechazar |
| APROBADO | Eliminar |
| RECHAZADO | Eliminar |

#### Flujo de aprobación:
1. Admin ve cotización PENDIENTE
2. Admin contacta cliente por WhatsApp
3. Cliente paga
4. Admin marca "Pagado"
5. Admin click "Aprobar"
   - Si stock insuficiente: alerta pidiendo confirmación
   - Si stock suficiente: aprueba y descuenta automáticamente
6. Estado cambia a "APROBADO"

## Carrito

### Características:
- Sumar/restar cantidad por artículo (máximo = stock)
- Ajuste automático si stock disminuye mientras está en carrito
- Ver subtotal por producto y total
- Eliminar artículo
- Vaciar carrito

### Formulario de Cotización
- Datos del cliente: nombre, celular, departamento, provincia, notas
- **Mensaje destacado:** "IMPORTANTE: Debe adelantar el 50% del total de su cotización para asegurar su reserva" (banner dorado)

### Envío de Cotización:
- Se guarda cotización en Supabase
- Se genera mensaje formateado en texto plano (box drawing)
- Se abre WhatsApp con mensaje estructurado por módulo
- Formato incluye: datos cliente, productos agrupados por módulo, subtotales, total

### Formato del mensaje WhatsApp:
```
────────────────────
JOYERÍA BELLA - COTIZACIÓN
────────────────────
DATOS DEL CLIENTE
────────────────────
Nombre:    Juan Pérez
Celular:   71123456
Ubicación: La Paz - El Alto
Notas:     
────────────────────
PRODUCTOS
────────────────────
📿 ARETES (Colgantes)
     AR001    x2    20.00 Bs
     AR002    x1    10.00 Bs
     ▸ Subtotal: 30.00 Bs
📿 COLLARES (Tulipanes)
     C001     x3    45.00 Bs
     ▸ Subtotal: 45.00 Bs
────────────────────
        💰 TOTAL: 75.00 Bs
────────────────────
⏰ IMPORTANTE: Esta cotización tiene validez de 2 horas.
Después de este tiempo, los artículos volverán a estar disponibles.
────────────────────
```

**Nota:** Líneas de 20 guiones (`────────────────────`), sin espacios extra entre secciones.

## Estados de Cotización

| Estado | Descripción |
|--------|-------------|
| PENDIENTE | Enviada, esperando pago |
| PAGADO | Cliente pagó, esperando aprobación |
| APROBADO | Admin aprobó, stock descontado |
| RECHAZADO | Admin rechazó |

## Ubicación (Bolivia)

### Departamentos (9):
1. La Paz, 2. Cochabamba, 3. Santa Cruz, 4. Chuquisaca, 5. Oruro, 6. Potosí, 7. Tarija, 8. Beni, 9. Pando

### Provincias: Todas las 99 provincias de Bolivia

## Optimizaciones de Rendimiento

- Infinite scroll con IntersectionObserver (24 productos por página)
- Imágenes con blur placeholder
- Lazy loading de WhatsAppButton
- localStorage para persistencia del carrito
- SWC minification en producción
- Formatos AVIF/WebP para imágenes
- Código compartido extraído a componentes reutilizables
- **ProductCard memoizado** con React.memo para evitar re-renders innecesarios
- **Cloudinary URL transformations** (w_400, f_auto, q_auto) para оптимиза imagenes
- **Cart context memoizado** (useMemo) para evitar recálculos
- **IntersectionObserver estable** con useRef para opciones
- **Consultas optimizadas** en carrito: solo carga módulos/subcategorías necesarios
- **tsconfig target es2017** para mejor compatibilidad con iteradores

## Estructura de Archivos

```
joyeria-bella/
├── app/
│   ├── page.tsx (home + catálogo)
│   ├── admin/
│   │   ├── page.tsx (login)
│   │   ├── dashboard/page.tsx
│   │   ├── productos/page.tsx
│   │   ├── modulos/page.tsx
│   │   └── cotizaciones/page.tsx
│   ├── carrito/page.tsx
│   ├── modulo/[id]/page.tsx
│   └── api/
├── components/
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── Footer.tsx
│   ├── header.tsx
│   ├── cart-context.tsx
│   └── whatsapp-button.tsx
├── lib/
│   ├── supabase.ts
│   ├── constants.ts
│   ├── cloudinary.ts
│   └── hooks/
│       └── useInfiniteProducts.ts
```

## Notas Importantes

- WhatsApp admin: 59174913218
- Moneda: Bolivianos (Bs)
- Precios con decimales (formato: XX.XX)
- Código producto: prefijo_módulo + número secuencial (AR001, AR002...)
- Código no editable después de crear
- Stock mínimo: 0
- Sin generación de PDF - usar WhatsApp con mensaje formateado

## Schema de Base de Datos

### Supabase Tables

| Tabla | Columnas |
|-------|----------|
| modulos | id, nombre, prefijo_codigo, activo, created_at, imagen_url |
| subcategorias | id, modulo_id, nombre, created_at |
| productos | id, codigo, nombre, modulo_id, subcategoria_id, precio, precio_descuento, stock, imagen_url, activo, created_at |
| cotizaciones | id, cliente_nombre, cliente_celular, cliente_departamento, cliente_provincia, cliente_notas, productos, estado, created_at, updated_at |

### Migraciones SQL

- `supabase/migrations/001_add_missing_columns.sql` - Agrega `imagen_url` a modulos, `activo` a productos, `updated_at` a cotizaciones

## Bug Fixes

### Imágenes de módulos no se mostraban en catálogo (2026-05-09)
**Síntoma:** Al subir una imagen para un módulo en el panel admin, el catálogo seguía mostrando las imágenes hardcodeadas por defecto.

**Causa raíz:** La tabla `modulos` en Supabase no tenía la columna `imagen_url`. El admin intentaba guardar la imagen pero la columna no existía. Además, `hero-categories.tsx` usaba un tipo incorrecto (`imagen` en vez de `imagen_url`) y ignoraba los datos de Supabase.

**Solución:**
1. Ejecutar migración SQL para agregar columnas faltantes (`imagen_url` en modulos, `activo` en productos, `updated_at` en cotizaciones)
2. Corregir interfaz `Modulo` en `hero-categories.tsx` para usar `imagen_url` correctamente
3. Priorizar `imagen_url` de Supabase con fallback a imágenes por defecto

**Archivos modificados:**
- `components/hero-categories.tsx` — interfaz `Modulo` y acceso a `imagen_url`
- `supabase/migrations/001_add_missing_columns.sql` — migración SQL
