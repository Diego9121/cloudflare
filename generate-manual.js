const PDFDocument = require('pdfkit');
const fs = require('fs');

const outputPath = 'C:\\Users\\Ryzen5\\Desktop\\Manual_Usuario_Joyeria_Bella.pdf';

console.log('Generando PDF con pdfkit...');

const doc = new PDFDocument({ size: 'A4', margin: 50 });

const stream = fs.createWriteStream(outputPath);

doc.pipe(stream);

doc.fontSize(26).fillColor('#B8860B').text('JOYERÍA BELLA', { align: 'center' });
doc.fontSize(16).fillColor('#333').text('Manual de Usuario', { align: 'center' });
doc.fontSize(12).text('Versión 1.0 - Mayo 2026', { align: 'center' });
doc.moveDown(2);

doc.fontSize(14).fillColor('#B8860B').text('Tabla de Contenidos', { align: 'center' });
doc.fontSize(10).fillColor('#333').text('1. Introducción', { align: 'center' });
doc.text('2. Acceso al Sistema', { align: 'center' });
doc.text('3. Guía para Clientes', { align: 'center' });
doc.text('4. Guía para Administradores', { align: 'center' });
doc.text('5. Sistema de Stock y Reservas', { align: 'center' });
doc.text('6. Solución de Problemas', { align: 'center' });

doc.moveDown();
doc.fontSize(10).fillColor('#888').text('─────────────────────────────────', { align: 'center' });
doc.moveDown(2);

doc.fontSize(14).fillColor('#B8860B').text('1. Introducción');
doc.moveDown();
doc.fontSize(10).fillColor('#333').text('Bienvenido al Manual de Usuario de Joyería Bella.');
doc.moveDown();
doc.fontSize(10).fillColor('#333').text('El sistema permite:');
doc.text('- Gestionar productos (módulos, subcategorías, precios, stock)');
doc.text('- Recibir cotizaciones de clientes a través de WhatsApp');
doc.text('- Controlar el inventario de forma automática');
doc.text('- Administrar el estado de las cotizaciones');

doc.moveDown(2);
doc.fontSize(10).fillColor('#888').text('─────────────────────────────────', { align: 'center' });
doc.moveDown(2);

doc.fontSize(14).fillColor('#B8860B').text('2. Acceso al Sistema');
doc.moveDown();
doc.fontSize(10).fillColor('#333').text('Sitio público: https://joyeria-bella.vercel.app');
doc.text('Panel admin: https://joyeria-bella.vercel.app/admin');
doc.moveDown();
doc.fontSize(10).fillColor('#333').text('Credenciales:', { continued: true });
doc.moveDown();
doc.fontSize(12).fillColor('#CC0000').text('Usuario: admin');
doc.fontSize(12).fillColor('#CC0000').text('Contraseña: admin123');

doc.moveDown(2);
doc.fontSize(10).fillColor('#888').text('─────────────────────────────────', { align: 'center' });
doc.moveDown(2);

doc.fontSize(14).fillColor('#B8860B').text('3. Guía para Clientes');
doc.moveDown();
doc.fontSize(10).fillColor('#333').text('3.1 Navegar el Catálogo');
doc.text('- Módulos: Aretes, Pulseras, Anillos, etc.');
doc.text('- Seleccionar módulo → ver subcategorías');
doc.text('- Filtrar productos por subcategoría');
doc.moveDown();
doc.fontSize(10).fillColor('#333').text('3.2 Agregar Productos al Pedido');
doc.text('1. Buscar botón dorado "AGREGAR AL PEDIDO"');
doc.text('2. Click para agregar 1 unidad');
doc.text('3. Controles (+/-) aparecerán');
doc.text('4. Ajustar cantidad según necesidad');
doc.moveDown();
doc.fontSize(10).fillColor('#333').text('3.3 Ver su Pedido');
doc.text('- Botón rojo "MI PEDIDO" → carrito');
doc.moveDown();
doc.fontSize(10).fillColor('#333').text('3.4 Completar Cotización');
doc.text('1. Llenar formulario de envío');
doc.text('2. Enviar por WhatsApp');
doc.moveDown();
doc.fontSize(12).fillColor('#CC0000').text('IMPORTANTE: Adelanto mínimo 50BS');
doc.fontSize(12).fillColor('#CC0000').text('Validez: 15 minutos');

doc.moveDown(2);
doc.fontSize(10).fillColor('#888').text('─────────────────────────────────', { align: 'center' });
doc.moveDown(2);

doc.fontSize(14).fillColor('#B8860B').text('4. Guía para Administradores');
doc.moveDown();
doc.fontSize(10).fillColor('#333').text('4.1 Panel de Control (Dashboard)');
doc.text('- Total de productos en el sistema');
doc.text('- Productos agotados (stock = 0)');
doc.text('- Productos con stock bajo (1-3 unidades)');
doc.text('- Cotizaciones pendientes por gestionar');
doc.moveDown();
doc.fontSize(10).fillColor('#333').text('4.2 Gestionar Módulos');
doc.text('1. Menú lateral → "Módulos"');
doc.text('2. +Nuevo Módulo: Nombre + Prefijo + Imagen');
doc.text('3. +Nueva Subcategoría');
doc.text('4. Guardar');
doc.moveDown();
doc.fontSize(10).fillColor('#333').text('4.3 Gestionar Productos');
doc.text('1. Menú lateral → "Productos"');
doc.text('2. +Nuevo Producto: Código, Módulo, Precio, Stock');
doc.text('3. Los productos se ordenan automáticamente por código');
doc.moveDown();
doc.fontSize(10).fillColor('#333').text('4.4 Gestionar Cotizaciones');
doc.text('- APROBAR: Stock decrementa automáticamente');
doc.text('- RECHAZAR: Stock se restaura automáticamente');
doc.text('- ELIMINAR: Stock se restaura si estaba pendiente');

doc.moveDown(2);
doc.fontSize(10).fillColor('#888').text('─────────────────────────────────', { align: 'center' });
doc.moveDown(2);

doc.fontSize(14).fillColor('#B8860B').text('5. Sistema de Stock y Reservas');
doc.moveDown();
doc.fontSize(10).fillColor('#333').text('5.1 Reserva Automática');
doc.text('- Stock se decrementa al enviar cotización');
doc.text('- Producto queda reservado para esa cotización');
doc.moveDown();
doc.fontSize(10).fillColor('#333').text('5.2 Restauración de Stock');
doc.text('- Stock se restaura al RECHAZAR cotización');
doc.text('- Stock se restaura al ELIMINAR cotización pendiente');

doc.moveDown(2);
doc.fontSize(10).fillColor('#888').text('─────────────────────────────────', { align: 'center' });
doc.moveDown(2);

doc.fontSize(14).fillColor('#B8860B').text('6. Solución de Problemas');
doc.moveDown();
doc.fontSize(10).fillColor('#333').text('PROBLEMA: No puedo agregar productos');
doc.text('SOLUCIÓN: Verificar stock disponible');
doc.moveDown();
doc.fontSize(10).fillColor('#333').text('PROBLEMA: Error de conexión en login');
doc.text('SOLUCIÓN: Verificar variables de entorno en Vercel');
doc.moveDown();
doc.fontSize(10).fillColor('#333').text('PROBLEMA: Stock no se actualiza');
doc.text('SOLUCIÓN: Revisar permisos en Supabase');

doc.moveDown(3);
doc.fontSize(10).fillColor('#888').text('─────────────────────────────────', { align: 'center' });
doc.moveDown(2);

doc.fontSize(22).fillColor('#B8860B').text('MANUAL COMPLETO', { align: 'center' });
doc.fontSize(12).fillColor('#666').text('Joyería Bella - Sistema de Gestión', { align: 'center' });
doc.fontSize(12).fillColor('#888').text('Mayo 2026', { align: 'center' });

doc.end();

stream.on('finish', () => {
  console.log('PDF generado exitosamente!');
  console.log('Ruta:', outputPath);
  console.log('Tamaño:', fs.statSync(outputPath).size, 'bytes');
});

stream.on('error', (err) => {
  console.error('Error:', err);
});