---
name: Declaración de Accesibilidad
title: Declaración de Accesibilidad
slug: accessibility
description: Nuestro compromiso con la accesibilidad web y la conformidad WCAG 2.1 AA
---

## Compromiso con la Accesibilidad

Este sitio está comprometido con garantizar la accesibilidad digital para personas con discapacidades. Mejoramos continuamente la experiencia de usuario para todas las personas y aplicamos los estándares de accesibilidad relevantes.

## Objetivo de Conformidad

Este sitio web busca cumplir con los estándares **WCAG 2.1 Nivel AA** publicados por la Web Accessibility Initiative (W3C).

### Qué significa esto

- El contenido es perceptible para todos los usuarios, independientemente de cómo accedan a la web
- Los componentes de la interfaz y la navegación son operables mediante teclado y tecnologías de asistencia
- La información y las operaciones de la interfaz son comprensibles
- El contenido es lo suficientemente robusto para funcionar con tecnologías de asistencia actuales y futuras

## Funcionalidades de Accesibilidad

### Navegación por Teclado

Todos los elementos interactivos son completamente accesibles mediante teclado:

- Usar **Tab** para avanzar por los elementos interactivos
- Usar **Shift + Tab** para retroceder
- Usar **Enter** o **Space** para activar botones y enlaces
- Usar **Escape** para cerrar diálogos y modales
- Un enlace de salto visible aparece al recibir foco para ir directamente al contenido principal

### Compatibilidad con Lectores de Pantalla

- Estructura HTML semántica con jerarquía correcta de encabezados
- Etiquetas y roles ARIA cuando el HTML semántico por sí solo no es suficiente
- Texto alternativo para todas las imágenes con significado
- Etiquetas de formularios y mensajes de error correctamente asociados
- Regiones landmark (`header`, `main`, `nav`, `footer`) para facilitar la navegación

### Diseño Visual

- Relación de contraste mínima de 4.5:1 para texto normal (WCAG AA)
- Relación mínima de 3:1 para texto grande (WCAG AA)
- El texto puede redimensionarse hasta un 200% sin pérdida de funcionalidad
- No se depende únicamente del color para transmitir información
- Los indicadores de foco son claramente visibles con contornos de 2px

### Movimiento y Animación

- Las animaciones son sutiles y no distractoras
- Se respetan las preferencias de movimiento reducido mediante `prefers-reduced-motion`
- No existe contenido que parpadee más de 3 veces por segundo

### Formularios

- Todos los campos tienen etiquetas visibles
- Los mensajes de error son descriptivos y están asociados con sus campos
- Los campos obligatorios están claramente marcados
- El desafío Cloudflare Turnstile es accesible por teclado

## Prácticas de Pruebas

### Pruebas Automatizadas

- ESLint con `eslint-plugin-jsx-a11y` detecta problemas comunes durante el desarrollo
- Un script automatizado de auditoría de accesibilidad (`scripts/audit-a11y.mjs`) se ejecuta en CI/CD
- Una suite dedicada de Playwright (`test/a11y/`) ejecuta un análisis completo con `axe-core` (WCAG 2.1 A/AA, incluido el contraste de color) en cada página, en ambos idiomas y en los temas claro y oscuro, además de verificaciones específicas de reflujo a 320px de ancho y la anulación de espaciado de texto de WCAG 1.4.12, con advertencias informativas sobre tamaño de texto, interlineado y grosor de fuente

### Pruebas Manuales

Realizamos pruebas periódicas con:

- **Navegación con teclado**: verificación de accesibilidad completa mediante teclado
- **Lectores de pantalla**: pruebas con NVDA (Windows) y VoiceOver (macOS/iOS)
- **Zoom del navegador**: verificación de diseño y funcionalidad al 200%
- **Analizadores de contraste**: validación de contraste en texto y elementos UI

### Tecnologías de Asistencia Probadas

- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS, iOS)
- TalkBack (Android)
- Navegación solo con teclado (todas las plataformas)

## Limitaciones Conocidas

Aunque buscamos la máxima accesibilidad, somos conscientes de lo siguiente:

- **Servicios de terceros**: Cloudflare Turnstile (protección de spam) y Formspree (servicio de correo) son servicios externos que no controlamos por completo, aunque hemos verificado que cumplen con estándares básicos de accesibilidad
- **Contenido dinámico**: Algunas animaciones podrían no respetar todas las preferencias de movimiento en navegadores antiguos

## Mejora Continua

La accesibilidad es un esfuerzo continuo. Nosotros:

- Revisamos accesibilidad en cada pull request
- Ejecutamos verificaciones automatizadas en CI/CD
- Realizamos auditorías manuales periódicas
- Actualizamos componentes cuando se identifican problemas
- Nos mantenemos al día con las guías WCAG y mejores prácticas

## Comentarios y Contacto

Agradecemos comentarios sobre la accesibilidad de este sitio. Si encuentra barreras:

**Contacto**: Use el botón “Contact” en la navegación del sitio para enviarnos un mensaje mediante nuestro formulario accesible.

Incluya:

- La URL de la página donde ocurrió el problema
- Descripción del problema
- La tecnología de asistencia utilizada (si aplica)
- Navegador y sistema operativo

Nos comprometemos a responder en un plazo de 2 días hábiles y trabajaremos para resolver los problemas reportados con prontitud.

## Especificaciones Técnicas

- **HTML**: HTML5 semántico
- **CSS**: Tailwind CSS con design tokens personalizados
- **JavaScript**: React 19 con Next.js 16 (mejora progresiva)
- **ARIA**: Aplicado cuando el HTML semántico no es suficiente
- **Frameworks**: Radix UI para componentes accesibles

## Quejas Formales de Accesibilidad

Este sitio web es operado por Vicente Opaso. Si desea presentar una queja formal sobre accesibilidad:

1. Contáctenos mediante el formulario con los detalles del problema
2. Confirmaremos la recepción en un plazo de 2 días hábiles
3. Investigaremos y responderemos en 10 días hábiles con hallazgos y la solución propuesta

## Estándares y Guías

Esta declaración hace referencia a los siguientes estándares:

- [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [Section 508 Standards](https://www.section508.gov/) (EE. UU.)
- [European Accessibility Act (EAA)](https://ec.europa.eu/social/main.jsp?catId=1202)

## Última Actualización

Esta declaración de accesibilidad fue revisada y actualizada el 3 de mayo de 2026.

---

### Documentación Relacionada

Para desarrolladores que contribuyen a este proyecto:

- [docs/ACCESSIBILITY.md](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ACCESSIBILITY.md) - Guías técnicas de accesibilidad
- [docs/DESIGN_SYSTEM.md](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/DESIGN_SYSTEM.md) - Design tokens y patrones de componentes
- [docs/ENGINEERING_STANDARDS.md](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ENGINEERING_STANDARDS.md) - Estándares de calidad de código
