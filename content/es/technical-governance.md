---
name: Gobernanza técnica
title: Gobernanza técnica
slug: technical-governance
description: Cómo el desarrollo basado en especificaciones (SDD) y la ingeniería «documentación primero» han dado forma a este proyecto, permitiendo un desarrollo asistido por IA con una arquitectura basada en la gobernanza.
---

## Ingeniería «documentación primero»

Este proyecto se ha desarrollado utilizando un enfoque **«primero la documentación»**, en el que se redactaron documentos de gobernanza exhaustivos, especificaciones de arquitectura y estándares de ingeniería antes y durante el desarrollo. Estos documentos sirvieron de base tanto para la toma de decisiones humanas como para la implementación asistida por IA.

### La filosofía

En lugar de escribir primero el código y documentarlo después, este proyecto invierte el flujo de trabajo tradicional:

1. **Definir la intención**: las normas de ingeniería, las decisiones de arquitectura y los principios de gobernanza se recogen en documentos Markdown
2. **Establecer la gobernanza**: se documentan reglas claras, controles de calidad y marcos de toma de decisiones
3. **Desarrollar con orientación**: el código se escribe tomando estos documentos como fuente de referencia, lo que garantiza la coherencia y la alineación
4. **La IA como copiloto**: las herramientas de IA (como [Cursor](https://cursor.com)) utilizan estos documentos para comprender el contexto, realizar sugerencias fundamentadas y mantener la integridad arquitectónica

## El desarrollo basado en especificaciones (SDD) en la práctica

### Documentos fundamentales de gobernanza

La gobernanza técnica del proyecto se define a través de varios documentos clave:

#### Normas de ingeniería (`docs/ENGINEERING_STANDARDS.md`)

Un documento exhaustivo que sirve de **guía** y recoge la intención de ingeniería en los siguientes ámbitos:

- **Fundamentos arquitectónicos**: principios de arquitectura modular y basada en componentes
- **Normas de ingeniería front-end**: calidad del código, ingeniería de componentes y directrices del sistema de diseño
- **Accesibilidad (A11y)**: objetivos WCAG 2.1 AA, prácticas de pruebas y herramientas
- **Fortalecimiento de la seguridad**: seguridad en tiempo de ejecución, comprobaciones en tiempo de compilación y patrones de autenticación
- **Rendimiento y Web Vitals**: objetivos de Core Web Vitals, umbrales de Lighthouse y estrategias de optimización
- **SEO y visibilidad**: SEO técnico, datos estructurados y optimización de contenidos
- **Normas de pruebas**: expectativas de pruebas unitarias, de integración y de extremo a extremo (E2E) con umbrales de cobertura
- **Normas del sistema de diseño** — Tokens de diseño, directrices para componentes y prácticas de documentación

Este documento sirve como **fuente única de referencia** para definir qué se considera «bueno» en este código base.

### Política independiente de soluciones, Constitución y SDD

- **Supremacía**: `docs/CONSTITUTION.md` define las invariantes inmutables y la jerarquía de resolución de conflictos para este repositorio.
- Dentro de esas restricciones, el SDD legible por máquina en `/sdd.yaml` es la referencia definitiva en cuanto a principios, límites y expectativas de CI.
- La gobernanza y los estándares son independientes de la solución: las elecciones tecnológicas pueden evolucionar, pero los principios deben permanecer intactos.
- Cualquier cambio que afecte a la arquitectura o a aspectos transversales debe actualizar el SDD y la documentación pertinente en la misma solicitud de incorporación de cambios (PR).

#### Descripción general de la arquitectura (`docs/ARCHITECTURE.md`)

Define la arquitectura técnica, incluyendo:

- Componentes del sistema y sus relaciones
- Decisiones sobre la pila tecnológica (Next.js, React, Tailwind, etc.)
- Arquitectura de contenidos (Markdown + frontmatter validado por Zod)
- Modelo de despliegue (Vercel)
- Flujos de datos e integraciones clave

#### Constitución de ingeniería (`docs/CONSTITUTION.md`)

Define las **invariantes inmutables** del repositorio y el **orden de prioridad** de la gobernanza.

- Es intencionadamente breve y estable (solo contiene declaraciones del tipo «DEBE», «NO DEBE» y «NUNCA»).
- El SDD (`sdd.yaml`) y los ADR proporcionan los detalles modificables y la justificación.

#### Documentos adicionales de gobernanza

- **Registros de decisiones de arquitectura** (`docs/adr/`) — Registros sencillos de decisiones arquitectónicas con contexto, alternativas y consecuencias
- **Límites de seguridad para la IA** (`docs/AI_GUARDRAILS.md`) — Normas de programación de IA, prácticas obligatorias, patrones prohibidos y lista de verificación para la revisión
- **Sistema de diseño** (`docs/DESIGN_SYSTEM.md`) — Tokens de diseño visual, patrones de componentes y directrices de uso
- **Directrices de accesibilidad** (`docs/ACCESSIBILITY.md`) — Prácticas técnicas de accesibilidad y herramientas
- **Guía de SEO** (`docs/SEO_GUIDE.md`) — Patrones de implementación de SEO y mejores prácticas
- **Gestión de errores** (`docs/ERROR_HANDLING.md`) — Límites de error, registro de eventos y estrategias de supervisión
- **Política de seguridad** (`docs/SECURITY_POLICY.md`) — Prácticas de seguridad y notificación de vulnerabilidades

## Registros de decisiones de arquitectura (ADR)

Para complementar la documentación exhaustiva, este proyecto utiliza **registros de decisiones de arquitectura (ADR)** para plasmar las decisiones arquitectónicas significativas junto con su contexto y sus consecuencias.

### Objetivo

Los ADR proporcionan una documentación sencilla y consultable que:

- **Recoge el contexto** — Documenta por qué se tomaron las decisiones, no solo lo que se implementó
- **Preserva la justificación** — Evita que futuros colaboradores reviertan buenas decisiones
- **Muestra alternativas** — Registra qué opciones se barajaron y por qué no se eligieron
- **Realiza un seguimiento de las consecuencias**: documenta explícitamente las compensaciones y las limitaciones conocidas
- **Proporciona contexto para la IA**: ofrece un contexto arquitectónico estructurado para el desarrollo asistido por IA

### Cuándo redactar un ADR

Crea un ADR para decisiones relacionadas con:

- **Cambios en la arquitectura**: estructura del sistema, límites o patrones
- **Elecciones tecnológicas**: adopción de nuevas bibliotecas, marcos de trabajo o herramientas
- **Aspectos transversales**: gestión de errores, registro de eventos, seguridad, rendimiento
- **Cambios que rompen la compatibilidad**: cambios en la API, modificaciones de contratos
- **Patrones de diseño**: nuevos patrones o obsolescencia de los existentes

Consulta `docs/adr/README.md` para ver el proceso completo del ADR y la plantilla.

### Integración de los ADR

Los ADR se integran en el flujo de trabajo de desarrollo:

1. **Proponer una decisión**: redactar un ADR con el estado «Propuesto» antes de la implementación
2. **Abrir una solicitud de incorporación de cambios (PR)**: incluir un enlace al ADR en la descripción de la PR
3. **Revisar conjuntamente**: revisar tanto el código como el ADR
4. **Aceptar la decisión** — Actualizar el estado del ADR a «Aceptado» tras la fusión
5. **Referenciar más adelante** — Las futuras solicitudes de incorporación de cambios (PR) y los agentes de IA hacen referencia a los ADR para contextualizar

## Cómo funciona el desarrollo asistido por IA

### Desarrollo sensible al contexto

Con una documentación exhaustiva y los ADR en vigor, las herramientas de IA pueden:

1. **Comprender la intención** — Al leer `ENGINEERING_STANDARDS.md`, la IA comprende los criterios de calidad, los patrones arquitectónicos y las normas de codificación
2. **Aprender de las decisiones** — Al leer los ADR, la IA comprende las decisiones arquitectónicas tomadas anteriormente y su justificación
3. **Mantener la coherencia** — Al sugerir código, la IA hace referencia al sistema de diseño, las directrices de accesibilidad y los estándares de pruebas
4. **Aplicar la gobernanza** — La IA puede señalar desviaciones respecto a los estándares documentados y sugerir correcciones
5. **Generar pruebas** — Las expectativas de pruebas y los umbrales de cobertura en la guía de SDD/CI guían a la IA para que genere conjuntos de pruebas adecuados
6. **Documentar decisiones** — La IA ayuda a mantener la documentación y a redactar ADR a medida que evoluciona el código

### Ejemplo de flujo de trabajo

Al implementar una nueva funcionalidad:

1. **Consultar estándares** — La IA lee `ENGINEERING_STANDARDS.md` para comprender los patrones de componentes, los requisitos de accesibilidad y las expectativas de pruebas
2. **Revisar decisiones anteriores** — La IA consulta los ADR en `docs/adr/` para comprender las elecciones arquitectónicas previas y su justificación
3. **Comprobar la arquitectura** — La IA consulta `ARCHITECTURE.md` para garantizar que la implementación se ajusta al diseño del sistema
4. **Aplicar el sistema de diseño** — La IA utiliza `DESIGN_SYSTEM.md` para sugerir tokens de diseño y patrones de componentes adecuados
5. **Documentar la decisión** — Si la funcionalidad requiere una decisión arquitectónica, la IA ayuda a redactar un ADR.
6. **Generar pruebas** — La IA crea pruebas que cumplen los umbrales de cobertura exigidos en el SDD/CI.
7. **Mantener la documentación** — La IA ayuda a actualizar la documentación pertinente si la funcionalidad introduce nuevos patrones.

## Ventajas de este enfoque

### Para el desarrollo

- **Incorporación más rápida** — Los nuevos colaboradores (humanos o IA) pueden comprender el proyecto rápidamente a través de la documentación
- **Calidad constante** — Las normas son explícitas, no implícitas, lo que reduce la variabilidad en la calidad del código
- **Reducción de la deuda técnica**: las decisiones se documentan, lo que facilita comprender el «porqué» y evitar regresiones
- **Mejor asistencia de la IA**: las herramientas de IA disponen de un contexto rico para ofrecer sugerencias más precisas

### Para el mantenimiento

- **Historial claro de decisiones**: las decisiones de arquitectura quedan registradas y no se pierden en los mensajes de commit
- **Refactorización más sencilla**: comprender la intención original ayuda a realizar cambios seguros
- **Controles de calidad**: CI/CD aplica automáticamente los estándares documentados
- **Documentación viva**: la documentación evoluciona con el código fuente, manteniéndose actualizada

### Para la colaboración

- **Entendimiento compartido** — Todo el mundo (incluida la IA) trabaja a partir de la misma fuente de verdad
- **Compensaciones explícitas** — Se documentan las decisiones y su justificación
- **Gobernanza como código** — Los estándares están sujetos a control de versiones y se pueden revisar
- **Transparencia** — La estructura del proyecto y las expectativas de calidad están claras

## Detalles de implementación

### Estructura de la documentación

Todos los documentos de gobernanza se encuentran en el directorio `docs/`:

```
docs/
├── adr/ # Registros de decisiones de arquitectura
│   ├── README.md # Proceso e índice de los ADR
│   ├── 0000-adr-template.md # Plantilla para nuevos ADR
│   └── 0001-adopt-architecture-decision-records.md
├── ENGINEERING_STANDARDS.md  # Objetivo principal de ingeniería
├── ARCHITECTURE.md # Arquitectura técnica
├── CONSTITUTION.md # Gobernanza del repositorio
├── DESIGN_SYSTEM.md # Sistema de diseño visual
├── ACCESSIBILITY.md # Directrices de accesibilidad
├── SEO_GUIDE.md # Prácticas de SEO
├── ERROR_HANDLING.md # Gestión de errores
└── SECURITY_POLICY.md # Prácticas de seguridad
```

### Integración de CI/CD

Las normas de documentación se aplican mediante:

- **Linting** — Las reglas de ESLint garantizan el cumplimiento de los estándares de calidad del código
- **Comprobación de tipos** — El modo estricto de TypeScript garantiza la seguridad de tipos
- **Pruebas** — Los umbrales de cobertura garantizan el cumplimiento de los estándares de pruebas
- **Accesibilidad** — Comprobaciones automatizadas de accesibilidad en CI
- **Seguridad** — CodeQL y análisis de dependencias
- **Rendimiento** — Lighthouse CI garantiza los límites de rendimiento

### Control de versiones

Toda la documentación es:

- **Controlada por versiones** — Se gestiona en Git junto con el código
- **Revisable** — Los cambios se someten a revisión mediante pull requests
- **Enlazada** — Los documentos se remiten entre sí para proporcionar contexto
- **Dinámica** — Se actualiza a medida que evoluciona el proyecto

## Modelo de gobernanza de la IA

### Principios

Este proyecto adopta un **desarrollo centrado en la IA con sólidas medidas de protección**:

1. **La IA como acelerador, no como responsable de la toma de decisiones** — Las herramientas de IA sugieren implementaciones, pero las decisiones arquitectónicas siguen siendo tomadas por personas y se documentan
2. **La documentación como contexto de la IA** — Una documentación exhaustiva permite a la IA comprender la intención y mantener la coherencia
3. **Los controles de calidad son innegociables** — Todo el código generado por la IA debe superar los mismos controles rigurosos que el código humano
4. **Las restricciones de seguridad son obligatorias** — La IA no puede eludir los controles de seguridad ni introducir vulnerabilidades
5. **Supervisión humana para los cambios críticos** — Los cambios relacionados con la seguridad y la arquitectura requieren una revisión manual

### Responsabilidades

**Herramientas de IA (Copilot, Cursor):**

- Consultar la documentación de gobernanza para conocer el contexto (`docs/CONSTITUTION.md`, `sdd.yaml`, `ENGINEERING_STANDARDS.md`, `ARCHITECTURE.md`)
- Sugerir código que siga los patrones documentados
- Generar pruebas que cumplan los requisitos de cobertura
- Actualizar la documentación al introducir nuevos patrones
- Realizar comprobaciones de validación antes de realizar el commit

**Revisores humanos:**

- Verificar la coherencia arquitectónica
- Evaluar las implicaciones de seguridad
- Validar la facilidad de mantenimiento
- Aprobar o rechazar las sugerencias de la IA
- Actualizar la documentación de gobernanza según sea necesario

**CI/CD automatizada:**

- Aplicar linting, comprobación de tipos y cobertura de pruebas
- Ejecutar análisis de seguridad (CodeQL, auditorías de dependencias)
- Validar la accesibilidad (WCAG 2.1 AA)
- Comprobar el rendimiento (límites de Lighthouse)
- Bloquear la fusión en caso de fallos

### Barreras de seguridad y restricciones

**Las barreras de seguridad obligatorias** impiden que la IA:

- Eluda los controles de seguridad (Turnstile, limitación de tasa, validación de entradas)
- Debilitar la accesibilidad (navegación por teclado, ARIA, contraste de colores)
- Violar los límites de la arquitectura (importaciones entre capas, estado mutable compartido)
- Introducir patrones prohibidos (secretos codificados, HTML sin sanitizar, pruebas omitidas)

**Controles de calidad** que deben superar todos los cambios:

- Análisis sintáctico (`pnpm lint`) y formateo (Prettier)
- Comprobación de tipos (`pnpm typecheck`) en modo estricto
- Pruebas unitarias con una cobertura de líneas del 90 %
- Pruebas de extremo a extremo (E2E) para los cambios que afectan al usuario
- Auditoría de accesibilidad
- Análisis de seguridad (CodeQL, npm audit)
- Rendimiento de Lighthouse ≥90, accesibilidad ≥90, SEO ≥95

Consulta **[AI Guardrails](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/AI_GUARDRAILS.md)** para conocer todas las restricciones.

### Proceso de revisión

**Todas las PR** (ya sean de IA o humanas) siguen el mismo flujo de trabajo de revisión:

1. **Autorrevisión**: el autor valida los cambios según la [lista de comprobación de revisión](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/REVIEW_CHECKLIST.md)
2. **Validación de CI**: deben superarse las comprobaciones automatizadas (véase `.github/workflows/`)
3. **Revisión humana**: revisión arquitectónica y de seguridad (obligatoria para cambios sensibles)
4. **Decisión de fusión**: los cambios seguros pueden fusionarse automáticamente; en los demás casos, se requiere aprobación manual

**Cualificados para la fusión automática** (con la etiqueta `copilot-automerge`):

- Cambios que afectan únicamente a la documentación
- Actualizaciones de dependencias (Dependabot)
- Actualizaciones de pruebas sin cambios de comportamiento
- Correcciones de formato o de linting

**Requiere revisión manual:**

- Cambios relacionados con la seguridad (rutas de API, autenticación, validación)
- Cambios de arquitectura (límites, patrones)
- Cambios que rompen la compatibilidad
- Nuevas dependencias

### Vía de escalación

**Cuando algo sale mal:**

1. **Fallo de CI** — Revisar los registros, corregir localmente, volver a ejecutar las comprobaciones, enviar las correcciones
2. **Vulnerabilidad de seguridad**: detén el proceso inmediatamente, revisa la [Política de seguridad](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/SECURITY_POLICY.md), corrige la vulnerabilidad y vuelve a escanear
3. **Regresión en la accesibilidad** — Revisar las [Directrices de accesibilidad](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ACCESSIBILITY.md), probar con teclado o lector de pantalla, corregir
4. **Incumplimiento de la arquitectura** — Revisar `sdd.yaml` y `ARCHITECTURE.md`, refactorizar para alinearlos y obtener aprobación humana

**Condiciones de parada de emergencia:**

- Vulnerabilidades de seguridad graves o críticas
- Pico de errores en producción
- Fallos graves de accesibilidad
- Pérdida o corrupción de datos
- Información confidencial expuesta en las confirmaciones

**Contactos de escalación:**

- Propietario del repositorio: @vicenteopaso
- Problemas de seguridad: Avisos de seguridad de GitHub (notificación privada)

### Documentación sobre gobernanza

- **[AI Guardrails](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/AI_GUARDRAILS.md)** — Restricciones y controles de calidad para el desarrollo de IA
- **[Patrones prohibidos](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/FORBIDDEN_PATTERNS.md)** — Antipatrones y cambios prohibidos
- **[Lista de comprobación para la revisión](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/REVIEW_CHECKLIST.md)** — Lista de comprobación de validación previa a la fusión

## Consideraciones futuras

Este enfoque centrado en la documentación se adapta bien a la escalabilidad:

- **Crecimiento del equipo** — Los nuevos miembros del equipo pueden incorporarse rápidamente
- **Evolución de la IA** — A medida que mejoran las herramientas de IA, un contexto más rico ofrece mejores resultados
- **Conservación del conocimiento** — El conocimiento institucional se captura y no se pierde
- **Cumplimiento normativo** — Las normas pueden ser auditadas y verificadas
- **Herramientas** — La documentación puede impulsar herramientas y comprobaciones automatizadas

## Documentación relacionada

Para desarrolladores y colaboradores:

- [Pila tecnológica](/es/tech-stack) — Descripción general completa de la pila tecnológica y las herramientas
- [Normas de ingeniería](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ENGINEERING_STANDARDS.md) — Exposición exhaustiva de la filosofía de ingeniería
- [Descripción general de la arquitectura](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ARCHITECTURE.md) — Arquitectura técnica
- [Constitución de ingeniería](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/CONSTITUTION.md) — Gobernanza del repositorio
- [Sistema de diseño](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/DESIGN_SYSTEM.md) — Tokens y patrones de diseño visual
- [Directrices de accesibilidad](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ACCESSIBILITY.md) — Prácticas técnicas de accesibilidad

## Plantillas de incidencias y comentarios de la comunidad

El repositorio utiliza plantillas de incidencias estructuradas para facilitar los informes de errores, las solicitudes de funcionalidades y las mejoras en la documentación:

- **Informes de errores** — Formulario estructurado para informar de problemas funcionales en el contexto del navegador o dispositivo
- **Solicitudes de funcionalidades** — Plantilla para proponer mejoras con casos de uso y evaluación de prioridades
- **Problemas de documentación** — Formulario para informar de lagunas o mejoras en la documentación

Las plantillas de incidencias garantizan la coherencia, recogen el contexto necesario y se integran con los flujos de trabajo de CI/CD mediante el etiquetado automático. Las vulnerabilidades de seguridad deben notificarse de forma privada a través de los avisos de seguridad de GitHub, en lugar de mediante incidencias públicas.

Consulta `.github/ISSUE_TEMPLATE/` para ver las definiciones de las plantillas y las directrices de uso.

## Última actualización

Esta documentación sobre gobernanza técnica se revisó y actualizó por última vez el 3 de mayo de 2026.
