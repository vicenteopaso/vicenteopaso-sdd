---
name: Tech Stack
title: Tech Stack
slug: tech-stack
---

## Descripción general

Este sitio web se ha desarrollado con un stack moderno y seguro en cuanto a tipos (type-safe), optimizado para el rendimiento, la accesibilidad y la experiencia del desarrollador. La arquitectura sigue los principios del [desarrollo basado en especificaciones (Spec-Driven Development, SDD)](/es/technical-governance), con una documentación de gobernanza exhaustiva que orienta las decisiones de implementación.

## Marco principal y entorno de ejecución

- **Next.js 16** — Enrutador de aplicaciones (App Router) con React Server Components (RSC), generación de sitios estáticos (SSG) y rutas tipadas
- **React 19.2** — Biblioteca de interfaz de usuario (UI) con componentes de servidor (server components) y mejora progresiva
- **TypeScript 6.0** — Verificación estricta de tipos de extremo a extremo
- **Node.js 24** — Entorno de ejecución (LTS)

## Estilo y componentes de interfaz de usuario

- **Tailwind CSS v4** — Marco CSS basado en utilidades con tokens de diseño personalizados
- **Radix UI** — Componentes básicos accesibles:
  - `@radix-ui/react-dialog` — Diálogos modales
  - `@radix-ui/react-navigation-menu` — Componentes de navegación
  - `@radix-ui/react-avatar` — Componentes de avatar
  - `@radix-ui/react-popover`: componentes de ventanas emergentes
- **next-themes**: temas para los modos claro y oscuro con detección de las preferencias del sistema
- **tailwindcss-animate**: utilidades de animación
- **tailwindcss-radix** — Integración de Radix UI con Tailwind
- **@tailwindcss/typography** — Complemento tipográfico para el estilo de la prosa

## Gestión de contenidos

- **Markdown** — Archivos fuente de contenido en el directorio `content/`
- **gray-matter** — Análisis de frontmatter, validado según un esquema Zod
- **react-markdown** — Representación de Markdown en React
- **sanitize-html** — Desinfectación de HTML por motivos de seguridad

## Formularios y servicios de backend

- **Cloudflare Turnstile** — Protección contra bots y prevención del spam (alternativa al CAPTCHA)
- **Formspree** — Servicio de backend para formularios de correo electrónico
- **Next.js Route Handlers** — Rutas de API para el procesamiento de formularios y la entrega de contenido
- **Zod** — Validación de esquemas para datos de formularios y solicitudes de API

## Pruebas y control de calidad

- **Vitest 4.1** — Marco de pruebas unitarias con entorno jsdom
- **@vitest/coverage-v8** — Informes de cobertura de código
- **Playwright 1.62** — Pruebas de extremo a extremo
- **@testing-library/react** — Utilidades de pruebas de componentes de React
- **@testing-library/jest-dom** — Comparadores DOM para pruebas
- **@testing-library/dom** — Utilidades de pruebas del DOM

## Calidad del código y análisis sintáctico

- **ESLint 10.8** — Análisis sintáctico del código con:
  - `eslint-config-next` — Reglas recomendadas por Next.js
  - `@typescript-eslint/eslint-plugin`: reglas específicas de TypeScript
  - `eslint-plugin-jsx-a11y`: validación de accesibilidad
  - `eslint-plugin-security`: reglas centradas en la seguridad
  - `eslint-plugin-simple-import-sort`: ordenación de importaciones
  - `eslint-config-prettier`: integración con Prettier
- **Prettier 3.9**: formateo de código
- **Husky 9.1** — Hooks de Git
- **lint-staged 17.3** — Validación y formateo previos al commit

## Observabilidad y monitorización

- **Vercel Analytics** — Visitas a la página e interacciones de los usuarios
- **Vercel Speed Insights** — Core Web Vitals y métricas de rendimiento
- **Sentry (@sentry/nextjs 10.70)** — Seguimiento de errores, reproducción de sesiones y alertas
- **Vercel Logs** — Registros de errores del lado del servidor

## Compilación e implementación

- **Vercel** — Alojamiento, CDN e implementación en red perimetral
- **next-sitemap 4.2** — Generación automática de mapas del sitio y del archivo robots.txt
- **pnpm 11.2** — Gestor de paquetes

## Herramientas de desarrollo

- **[Warp](https://app.warp.dev/referral/8X3W39)** — Terminal para el flujo de trabajo de desarrollo
- **[Cursor](https://cursor.com)** — Editor de código asistido por IA
- **PostCSS 8.5** — Procesamiento de CSS
- **autoprefixer 10.5** — Prefijos de proveedor para CSS

## Rendimiento y SEO

- **Generación de sitios estáticos (SSG)** — Páginas prerenderizadas en el momento de la compilación
- **Componentes de servidor (server components)** — Reducción del JavaScript del lado del cliente
- **Optimización de imágenes** — Optimización automática de imágenes con Next.js
- **Optimización de fuentes** — Google Fonts a través de `next/font/google`: Instrument Serif y JetBrains Mono, con `font-display: swap`
- **Datos estructurados JSON-LD** — Marcado Schema.org para SEO
- **Open Graph y Twitter Cards** — Vistas previas en redes sociales

## Seguridad

- **Política de seguridad de contenidos (CSP)** — Protección contra XSS
- **Limitación de tasa** — Limitación de tasa en memoria para rutas de API
- **Validación de entradas** — Validación de esquemas Zod
- **Desinfectación de salidas** — Desinfectación de HTML para contenido generado por el usuario
- **Encabezados de seguridad** — Encabezados de seguridad completos mediante la configuración de Next.js
- **CodeQL** — Análisis de seguridad automatizado en CI

## CI/CD y automatización

- **GitHub Actions** — Integración y despliegue continuos
- **Dependabot** — Actualizaciones automatizadas de dependencias
- **Lighthouse CI** — Auditorías de rendimiento y accesibilidad
- **Umbrales de cobertura** — Aplicados mediante Vitest (90 % de líneas, sentencias, ramificaciones y funciones)

## Sistema de diseño

El sitio utiliza un sistema de diseño personalizado basado en propiedades CSS personalizadas (tokens de diseño) definidas en `styles/globals.css`. Las decisiones de diseño están documentadas en [docs/DESIGN_SYSTEM.md](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/DESIGN_SYSTEM.md).

Principios clave de diseño:

- Estética minimalista que da prioridad al contenido
- Cumplimiento de las normas de accesibilidad WCAG AA
- Compatibilidad con temas oscuros y claros
- Estilo de inspiración brutalista con radio de borde configurable

## Arquitectura y gobernanza

Este proyecto sigue los principios del [Desarrollo basado en especificaciones (SDD)](/es/technical-governance), con una documentación exhaustiva sobre gobernanza que incluye:

- **[Normas de ingeniería](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ENGINEERING_STANDARDS.md)** — Objetivo principal de la ingeniería
- **[Descripción general de la arquitectura](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ARCHITECTURE.md)**: arquitectura técnica y diseño del sistema
- **[Constitución de ingeniería](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/CONSTITUTION.md)** — Invariantes de gobernanza inmutables y orden de prioridad

Para obtener más detalles sobre cómo estos documentos de gobernanza orientan el desarrollo y permiten flujos de trabajo asistidos por IA, consulta la página [Gobernanza técnica](/es/technical-governance).

## Enlaces del proyecto

- [Repositorio de GitHub](https://github.com/vicenteopaso/vicenteopaso-vibecode)
- [Alojado en Vercel](https://vercel.com)
- [Gobernanza técnica](/es/technical-governance) — Cómo el SDD y la ingeniería centrada en la documentación han dado forma a este proyecto
