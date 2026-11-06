---
name: Tech Stack
title: Tech Stack
slug: tech-stack
description: "Stack tecnológico y herramientas detrás de opa.so: Next.js, React, TypeScript, Tailwind CSS v4, testing, observabilidad y CI/CD."
---

## Descripción general

Este sitio web se ha desarrollado con un stack moderno y seguro en cuanto a tipos (type-safe), optimizado para el rendimiento, la accesibilidad y la experiencia del desarrollador. La arquitectura sigue los principios del [desarrollo basado en especificaciones (Spec-Driven Development, SDD)](/es/technical-governance), con una documentación de gobernanza exhaustiva que orienta las decisiones de implementación.

## Marco principal y entorno de ejecución

- **Next.js 16.4** — Enrutador de aplicaciones (App Router) con React Server Components (RSC), generación de sitios estáticos (SSG) y rutas tipadas
- **React 19.3** — Biblioteca de interfaz de usuario (UI) con componentes de servidor (server components) y mejora progresiva
- **TypeScript 6.0** — Verificación estricta de tipos de extremo a extremo
- **Node.js 24** — Entorno de ejecución (LTS)

## Estilo y componentes de interfaz de usuario

- **Tailwind CSS v4** — Marco CSS basado en utilidades con tokens de diseño personalizados
- **next-themes**: temas para los modos claro y oscuro con detección de las preferencias del sistema
- **Modo de alto contraste** — Una paleta WCAG AA que se activa desde la navegación o con el ajuste «aumentar contraste» del sistema operativo
- **@tailwindcss/typography** — Complemento tipográfico para el estilo de la prosa
- **clsx** — Composición condicional de nombres de clase

## Gestión de contenidos

- **Markdown** — Archivos fuente de contenido en el directorio `content/`, en inglés y español
- **gray-matter** — Análisis de frontmatter, validado según un esquema Zod
- **react-markdown** — Representación de Markdown en React, con el HTML sin procesar desactivado
- **DeepL** (`deepl-node`) — Traducción automática del contenido en inglés al español, bajo demanda

## Formularios y servicios de backend

- **Cloudflare Turnstile** — Protección contra bots y prevención del spam (alternativa al CAPTCHA)
- **Formspree** — Servicio de backend para formularios de correo electrónico
- **Next.js Route Handlers** — Rutas de API para el procesamiento de formularios, el contenido y la API de perfil
- **WebMCP** (`@mcp-b/global`) — Expone herramientas del sitio a agentes de IA en el navegador; solo se carga si el navegador no lo admite de forma nativa
- **Zod 4** — Validación de esquemas para datos de formularios y solicitudes de API

## Pruebas y control de calidad

- **Vitest 4.1** — Marco de pruebas unitarias con entorno jsdom
- **@vitest/coverage-v8** — Informes de cobertura de código
- **Playwright 1.64** — Pruebas de extremo a extremo, de regresión visual y de accesibilidad
- **@axe-core/playwright** — Análisis automatizados WCAG 2.1 A/AA
- **@testing-library/react** — Utilidades de pruebas de componentes de React
- **@testing-library/jest-dom** — Comparadores DOM para pruebas
- **@testing-library/dom** — Utilidades de pruebas del DOM

## Calidad del código y análisis sintáctico

- **ESLint 10.13** — Análisis sintáctico del código con:
  - `@next/eslint-plugin-next` — Reglas recomendadas por Next.js
  - `typescript-eslint`: reglas específicas de TypeScript
  - `eslint-plugin-jsx-a11y`: validación de accesibilidad
  - `eslint-plugin-security`: reglas centradas en la seguridad
  - `eslint-plugin-simple-import-sort`: ordenación de importaciones
  - `eslint-config-prettier`: integración con Prettier
- **Prettier 3.9**: formateo de código
- **Husky 9.1** — Hooks de Git
- **lint-staged 17.6** — Validación y formateo previos al commit
- **Knip** — Detección de archivos, exportaciones y dependencias sin usar

## Observabilidad y monitorización

- **Vercel Web Analytics** — Visitas a las páginas agregadas y sin cookies
- **Vercel Speed Insights** — Core Web Vitals y métricas de rendimiento
- **Sentry (@sentry/nextjs 11.8)** — Seguimiento de errores, alertas y reproducción de sesiones (se carga con la primera interacción)
- **Sentry Logs** — Advertencias y errores del servidor reenviados por el SDK de Sentry
- **Vercel Logs** — Registros de solicitudes y funciones

## Compilación e implementación

- **Vercel** — Alojamiento y CDN. GitHub Actions compila el sitio con `vercel build` y despliega el resultado precompilado, de modo que las comprobaciones se ejecutan antes de publicar nada
- **Rutas de metadatos de Next.js** — `app/sitemap.ts` y `app/robots.ts` generan el mapa del sitio y el archivo robots.txt
- **pnpm 11.2** — Gestor de paquetes

## Herramientas de desarrollo

- **[Warp](https://app.warp.dev/referral/8X3W39)** — Terminal para el flujo de trabajo de desarrollo
- **[Cursor](https://cursor.com)** — Editor de código asistido por IA
- **[Claude Code](https://claude.com/claude-code)** y **GitHub Copilot** — Agentes de programación con IA que trabajan según los documentos de gobernanza del proyecto
- **PostCSS 8.5** — Procesamiento de CSS
- **autoprefixer 10.6** — Prefijos de proveedor para CSS

## Rendimiento y SEO

- **Generación de sitios estáticos (SSG)** — Páginas prerenderizadas en el momento de la compilación
- **Componentes de servidor (server components)** — Reducción del JavaScript del lado del cliente
- **Optimización de imágenes** — Optimización automática de imágenes con Next.js
- **Optimización de fuentes** — Google Fonts autoalojadas a través de `next/font/google`: Instrument Serif, Inter y JetBrains Mono, con `font-display: swap`
- **Datos estructurados JSON-LD** — Marcado Schema.org para SEO
- **Open Graph y Twitter Cards** — Vistas previas en redes sociales

## Seguridad

- **Política de seguridad de contenidos (CSP)** — Protección contra XSS
- **Limitación de tasa** — Limitación de tasa en memoria para rutas de API
- **Validación de entradas** — Validación de esquemas Zod
- **Desinfectación de salidas** — El Markdown se representa sin HTML sin procesar, de modo que el contenido no puede inyectar marcado
- **Cloudflare Turnstile** — Verificación contra bots en el formulario de contacto, comprobada en el servidor
- **Encabezados de seguridad** — Encabezados de seguridad completos mediante la configuración de Next.js
- **CodeQL** — Análisis de seguridad automatizado en CI
- **Análisis de dependencias y secretos** — `pnpm audit` (avisos altos y críticos) y un análisis de secretos del repositorio

## CI/CD y automatización

- **GitHub Actions** — Integración y despliegue continuos
- **Dependabot** — Actualizaciones automatizadas de dependencias
- **Lighthouse CI** — Auditorías de rendimiento, accesibilidad, buenas prácticas y SEO
- **Umbrales de cobertura** — Aplicados mediante Vitest (90 % de líneas, sentencias, ramificaciones y funciones)
- **Release Drafter** — Notas de versión redactadas a partir de las pull requests fusionadas

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
