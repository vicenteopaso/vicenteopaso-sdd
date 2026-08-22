---
nombre: Declaración de accesibilidad
título: Declaración de accesibilidad
slug: accesibilidad
descripción: Nuestro compromiso con la accesibilidad web y el cumplimiento de las WCAG 2.1 Nivel AA
---

## Compromiso con la accesibilidad

Este sitio web se compromete a garantizar la accesibilidad digital para las personas con discapacidad. Mejoramos continuamente la experiencia de usuario para todos y aplicamos las normas de accesibilidad pertinentes.

## Objetivo de conformidad

Este sitio web tiene como objetivo cumplir con las normas **WCAG 2.1 Nivel AA** publicadas por la Iniciativa de Accesibilidad Web (W3C).

### Qué significa esto

- El contenido es perceptible para todos los usuarios, independientemente de cómo accedan a la web
- Los componentes de la interfaz y la navegación se pueden manejar mediante el teclado y tecnologías de apoyo
- La información y las operaciones de la interfaz son comprensibles
- El contenido es lo suficientemente robusto como para funcionar con tecnologías de apoyo actuales y futuras

## Funciones de accesibilidad

### Navegación con el teclado

Todos los elementos interactivos son totalmente accesibles mediante el teclado:

- Utiliza la tecla **Tab** para avanzar por los elementos interactivos
- Utiliza **Shift + Tab** para retroceder
- Utiliza **Enter** o **Espacio** para activar botones y enlaces
- Utiliza **Esc** para cerrar cuadros de diálogo y ventanas modales
- Al recibir el foco del teclado, aparece un enlace de salto visible para ir directamente al contenido principal

### Compatibilidad con lectores de pantalla

- Estructura HTML semántica con una jerarquía de encabezados adecuada
- Etiquetas y roles ARIA cuando el HTML semántico no es suficiente
- Texto alternativo para todas las imágenes significativas
- Etiquetas de formulario y mensajes de error correctamente asociados
- Regiones de referencia (`header`, `main`, `nav`, `footer`) para facilitar la navegación

### Diseño visual

- Relación de contraste mínima de 4,5:1 para el texto normal (WCAG AA)
- Relación de contraste mínima de 3:1 para el texto grande (WCAG AA)
- El texto se puede ampliar hasta un 200 % sin pérdida de funcionalidad
- No se recurre exclusivamente al color para transmitir información
- Los indicadores de foco son claramente visibles con contornos de 2 píxeles

### Movimiento y animación

- Las animaciones son sutiles y no distraen
- Se respetan las preferencias de movimiento reducido mediante `prefers-reduced-motion`
- Ningún contenido parpadea más de 3 veces por segundo

### Formularios

- Todos los campos de los formularios tienen etiquetas visibles
- Los mensajes de error son descriptivos y están asociados a los campos
- Los campos obligatorios están claramente marcados
- El desafío de Cloudflare Turnstile es accesible mediante el teclado

## Prácticas de pruebas

### Pruebas automatizadas

- ESLint con `eslint-plugin-jsx-a11y` detecta problemas comunes durante el desarrollo
- El script de auditoría de accesibilidad automatizada (`scripts/audit-a11y.mjs`) se ejecuta en CI/CD
- Una suite dedicada de Playwright (`test/a11y/`) ejecuta un análisis completo con `axe-core` (WCAG 2.1 A/AA, incluido el contraste de colores) en todas las páginas, en ambos idiomas y en los temas claro y oscuro, además de comprobaciones específicas del reajuste de contenido a un ancho de 320 píxeles y la anulación del espaciado de texto según WCAG 1.4.12, con advertencias de legibilidad sobre el tamaño del texto, la altura de línea y el grosor de la fuente

### Pruebas manuales

Realizamos pruebas periódicas con:

- **Navegación por teclado**: nos aseguramos de que todas las funciones sean accesibles mediante el teclado
- **Lectores de pantalla**: pruebas con NVDA (Windows) y VoiceOver (macOS/iOS)
- **Zoom del navegador**: verificamos el diseño y la funcionalidad con un zoom del 200 %
- **Analizadores de contraste de color**: validamos los índices de contraste del texto y de los elementos de la interfaz de usuario

### Tecnologías de asistencia probadas

- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS, iOS)
- TalkBack (Android)
- Navegación solo con teclado (todas las plataformas)

## Limitaciones conocidas

Aunque nos esforzamos por lograr una accesibilidad total, somos conscientes de lo siguiente:

- **Servicios de terceros**: Cloudflare Turnstile (protección contra el spam) y Formspree (servicio de correo electrónico) son servicios externos sobre los que no tenemos control total, aunque hemos comprobado que cumplen con los estándares básicos de accesibilidad
- **Contenido dinámico**: es posible que algunas animaciones no respeten todas las preferencias de movimiento del usuario en navegadores más antiguos

## Mejora continua

La accesibilidad es un esfuerzo continuo. Nosotros:

- Revisamos la accesibilidad en cada solicitud de incorporación de cambios
- Realizamos comprobaciones automáticas de accesibilidad en CI/CD
- Llevamos a cabo auditorías manuales periódicas
- Actualizamos los componentes cuando se identifican problemas de accesibilidad
- Nos mantenemos al día con las directrices WCAG y las mejores prácticas

## Comentarios y contacto

Agradecemos cualquier comentario sobre la accesibilidad de este sitio web. Si te encuentras con barreras de accesibilidad:

**Contacto**: Utiliza el botón «Contacto» en la navegación del sitio web para ponerte en contacto con nosotros a través de nuestro formulario de contacto accesible.

Por favor, incluye:

- La URL de la página en la que has detectado el problema
- Una descripción del problema
- La tecnología de apoyo que utilizas (si procede)
- Su navegador y sistema operativo

Nuestro objetivo es responder en un plazo de 2 días laborables y nos esforzaremos por resolver rápidamente los problemas notificados.

## Especificaciones técnicas

- **HTML**: HTML5 semántico
- **CSS**: Tailwind CSS con tokens de diseño personalizados
- **JavaScript**: React 19 con Next.js 16 (mejora progresiva)
- **ARIA**: Aplicado cuando el HTML semántico resulta insuficiente
- **Marcos de trabajo**: Radix UI para componentes primitivos accesibles

## Reclamaciones formales sobre accesibilidad

Este sitio web está gestionado por Vicente Opaso. Si desea presentar una reclamación formal sobre accesibilidad:

1. Póngase en contacto con nosotros a través del formulario de contacto, indicando los detalles del problema
2. Acusaremos recibo de su reclamación en un plazo de 2 días laborables
3. Investigaremos el caso y le responderemos en un plazo de 10 días laborables con nuestras conclusiones y la solución propuesta

## Normas y directrices

Esta declaración hace referencia a las siguientes normas:

- [Pautas de Accesibilidad al Contenido Web (WCAG) 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Aplicaciones de Internet enriquecidas accesibles (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [Normas de la Sección 508](https://www.section508.gov/) (EE. UU.)
- [Ley Europea de Accesibilidad (EAA)](https://ec.europa.eu/social/main.jsp?catId=1202)

## Última actualización

Esta declaración de accesibilidad se revisó y actualizó por última vez el 3 de mayo de 2026.

---

### Documentación relacionada

Para los desarrolladores que colaboran en este proyecto:

- [docs/ACCESSIBILITY.md](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ACCESSIBILITY.md) - Directrices técnicas de accesibilidad
- [docs/DESIGN_SYSTEM.md](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/DESIGN_SYSTEM.md) - Tokens de diseño y patrones de componentes
- [docs/ENGINEERING_STANDARDS.md](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ENGINEERING_STANDARDS.md) - Normas de calidad del código
