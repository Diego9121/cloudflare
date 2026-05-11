'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Modulo {
  id: string;
  nombre: string;
  prefijo_codigo: string;
  imagen_url?: string | null;
}

const ordenModulos = ['AR', 'D', 'C', 'A', 'P', 'CO'];

const modulosPorDefecto: (Modulo & { imagenUrl: string; descripcion: string })[] = [
  { 
    id: 'aretes', 
    nombre: 'Aretes', 
    prefijo_codigo: 'AR',
    imagenUrl: 'https://images.unsplash.com/photo-1590534247854-e9d8c0d96c5b?w=800&h=600&fit=crop',
    descripcion: 'Elegancia que ilumina tu rostro'
  },
  { 
    id: 'dormilonas', 
    nombre: 'Dormilonas', 
    prefijo_codigo: 'D',
    imagenUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=600&fit=crop',
    descripcion: 'Delicadeza para cada momento'
  },
  { 
    id: 'collares', 
    nombre: 'Collares', 
    prefijo_codigo: 'C',
    imagenUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop',
    descripcion: 'Piezas que adornan tu elegancia'
  },
  { 
    id: 'anillos', 
    nombre: 'Anillos', 
    prefijo_codigo: 'A',
    imagenUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=600&fit=crop',
    descripcion: 'Significado en cada diseño'
  },
  { 
    id: 'pulseras', 
    nombre: 'Pulseras', 
    prefijo_codigo: 'P',
    imagenUrl: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=600&fit=crop',
    descripcion: 'Detalles que brillan en tu muñeca'
  },
  { 
    id: 'conjuntos', 
    nombre: 'Conjuntos', 
    prefijo_codigo: 'CO',
    imagenUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=600&fit=crop',
    descripcion: 'Sets completos de distinción'
  },
];

interface HeroCategoriesProps {
  modulos?: Modulo[];
  subcategorias?: any[];
}

export function HeroCategories({ modulos }: HeroCategoriesProps) {
  let modules: (Modulo & { imagenUrl: string; descripcion: string })[] = modulosPorDefecto;
  
  if (modulos && modulos.length > 0) {
    const ordenMap = new Map(ordenModulos.map((prefijo, idx) => [prefijo, idx]));
    const sorted = [...modulos].sort((a, b) => {
      const aOrder = ordenMap.get(a.prefijo_codigo) ?? 99;
      const bOrder = ordenMap.get(b.prefijo_codigo) ?? 99;
      return aOrder - bOrder;
    });
    
    modules = sorted.map((m, i) => ({
      id: m.id,
      nombre: m.nombre,
      prefijo_codigo: m.prefijo_codigo,
      imagenUrl: m.imagen_url || modulosPorDefecto[i % modulosPorDefecto.length]?.imagenUrl || modulosPorDefecto[0].imagenUrl,
      descripcion: modulosPorDefecto[i % modulosPorDefecto.length]?.descripcion || 'Ver colección',
    }));
  }

  return (
    <section className="relative overflow-hidden py-8 bg-white">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50/50" />
      
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold" />
            <span className="text-gold text-sm font-medium tracking-[0.3em] uppercase">Joyería Exclusiva</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal mb-4 tracking-tight">
            Nuestras Colecciones
          </h2>
          <p className="text-sm sm:text-base md:text-base lg:text-lg text-gray-500 max-w-xl mx-auto">
            Piezas únicas diseñadas para brillar en cada momento especial
          </p>
          <p className="text-sm sm:text-base font-semibold text-gold mt-3 tracking-wide">
            TIENDA VIRTUAL LA PAZ - EL ALTO - BOLIVIA
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
          {modules.map((modulo, index) => (
            <Link
              key={modulo.id}
              href={`/modulo/${modulo.id}`}
              className="group relative overflow-hidden rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div className="relative aspect-square">
                <Image
                  src={modulo.imagenUrl}
                  alt={modulo.nombre}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhBhMxFCJR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQADAQEBAAAAAAAAAAAAAAABAgMAEWH/2gAMAwEAAhEDEQA/AJHRtYv9RuJbe0ntYnjALNIGwc59CIpWq6Lf6dp0lxNd2k0aFVZYGYsCWx0eB/aiWvakll4jvb2RWkjhlWNWUZIbIwg/5RVRp9y7aJbSNIzO0YZmY5JJ9a1x2Ylq5P//Z"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                
                <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute top-2 right-2 md:top-3 md:right-3">
                  <span className="bg-gold/95 text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full shadow-md tracking-wide">
                    {modulo.prefijo_codigo}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
                  <div className="flex items-end justify-between">
                    <h3 className="text-sm md:text-base lg:text-xl xl:text-2xl font-bold text-white tracking-wide">
                      {modulo.nombre}
                    </h3>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gold flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-5 h-5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 border border-white/0 group-hover:border-gold/50 rounded-xl md:rounded-2xl transition-colors duration-500" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 md:gap-12">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <span className="text-sm font-medium">Envíos a todo Bolivia</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium">Calidad garantizada</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <span className="text-sm font-medium">Atención por WhatsApp</span>
          </div>
        </div>
      </div>
    </section>
  );
}