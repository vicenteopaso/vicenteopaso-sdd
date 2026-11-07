---
name: Política de privacidad
title: Política de privacidad
slug: privacy-policy
description: "Política de privacidad de opa.so: qué datos personales se recogen, cómo se usan y protegen, y tus derechos conforme al RGPD."
---

## Introducción

La presente Política de privacidad explica cómo opa.so («nosotros», «nos» o «nuestro») recopila, utiliza, divulga y protege tus datos personales cuando visitas https://opa.so/. Cumplimos con el RGPD de la UE, la AEPD (Agencia Española de Protección de Datos) y la normativa aplicable en materia de protección de datos.

## Información que recopilamos

### 1. Datos que facilitas voluntariamente

Cuando envías el formulario de contacto, recopilamos:

- Tu dirección de correo electrónico
- Tu nombre y un asunto, si rellenas esos campos opcionales
- El contenido de tu mensaje
- Cualquier información adicional que incluyas voluntariamente

El formulario es procesado por Formspree, nuestro encargado del tratamiento de datos externo.

Para limitar los abusos, el servidor mantiene en memoria un recuento temporal de envíos del formulario de contacto por dirección IP. Se reinicia al cabo de un minuto y nunca se guarda en ningún almacenamiento.

### 2. Datos de seguridad y contra el uso indebido (Cloudflare Turnstile)

Para proteger el formulario de contacto de bots y tráfico malicioso, Cloudflare Turnstile se ejecuta en el formulario y procesa:

- La dirección IP
- Las características del navegador
- Los datos de interacción necesarios para verificar que eres un ser humano

Cloudflare actúa como responsable del tratamiento independiente para este procesamiento.

### 3. Alojamiento, registros y datos de tráfico (Vercel)

Dado que el sitio está alojado en Vercel, se recopilan automáticamente los registros estándar de alojamiento. Estos pueden incluir:

- Dirección IP
- Marca de tiempo de la solicitud
- Rutas URL visitadas
- Tipo de dispositivo, sistema operativo y navegador
- Información de referencia
- Métricas básicas de rendimiento y enrutamiento (telemetría de Edge Network)

Vercel utiliza estos datos para:

- Seguridad
- Prevención de abusos
- Supervisión del rendimiento
- Diagnóstico de errores

Vercel actúa como responsable del tratamiento independiente.  
Más información: https://vercel.com/legal/privacy-policy

### 4. Análisis agregados (Vercel Web Analytics y Speed Insights)

Utilizamos Vercel Web Analytics y Vercel Speed Insights para contar las visitas a las páginas y medir su rendimiento (Core Web Vitals). Estas herramientas:

- No utilizan cookies
- No crean perfiles ni te siguen por otros sitios web
- Ofrecen cifras agregadas, como las páginas visitadas, la página de referencia, el país, el tipo de dispositivo y el navegador

Vercel trata estos datos por cuenta nuestra.  
Más información: https://vercel.com/docs/analytics/privacy-policy

### 5. Supervisión de errores (Sentry)

Para diagnosticar errores y mejorar la fiabilidad, Sentry puede tratar:

- Trazas de pila y mensajes de error (sin datos de carácter personal, salvo que se incluyan en el envío de un formulario)
- Tipo de navegador, sistema operativo y URL de la página en la que se produjo el error
- Advertencias y errores del servidor registrados por el sitio
- Datos de reproducción de sesiones: se graban en aproximadamente el 10 % de las visitas y en las visitas en las que se produce un error, se cargan solo después de tu primera interacción con la página y ocultan todo el texto de la página y los campos de los formularios

Sentry actúa como encargado del tratamiento de datos siguiendo nuestras instrucciones.  
https://sentry.io/privacy/

### 6. Avisos de la página de equipaje encontrado

La página no listada de equipaje encontrado (`/found-luggage`) existe para que quien encuentre una maleta perdida pueda contactar con su propietario. Cuando se abre esa página, el sitio envía un único aviso al propietario del sitio a través de Telegram y Formspree con:

- La hora de la visita y el idioma de la página
- La ubicación aproximada (ciudad y país), que Vercel obtiene a partir de tu dirección IP
- La página de referencia, si tu navegador la envía
- La cadena de agente de usuario (user agent) de tu navegador

El aviso no incluye tu dirección IP. Ninguna otra página envía este aviso.

### 7. Sin cookies de seguimiento ni publicitarias

**No** utilizamos herramientas de análisis que rastreen comportamientos identificables, ni utilizamos cookies publicitarias.

## Cómo utilizamos tu información

- **Los datos del formulario de contacto** se utilizan únicamente para responder a tus consultas.
- **Los datos de Cloudflare y Vercel** se utilizan con fines de seguridad, prevención de abusos y rendimiento del sitio web.
- **Los datos de Sentry** se utilizan únicamente para encontrar y corregir errores.
- **Los avisos de equipaje encontrado** se utilizan únicamente para saber que alguien puede haber encontrado una maleta perdida.
- No vendemos ni compartimos tus datos con fines de marketing o publicidad.

## Base legal para el tratamiento (RGPD)

Nos basamos en:

- **Interés legítimo:** responder a las consultas, garantizar la seguridad y la estabilidad del sitio web, medir el uso y el rendimiento agregados del sitio y recuperar equipaje perdido.
- **Consentimiento:** otorgado de forma explícita al enviar el formulario de contacto. Puedes retirar tu consentimiento en cualquier momento.

## Encargados del tratamiento de datos externos

- **Sentry**: procesa informes de errores, trazas de pila, registros del servidor y datos de reproducción de sesiones con fines de depuración y supervisión.  
  Los datos de errores se recopilan cuando se producen errores. La reproducción de sesiones graba aproximadamente el 10 % de las visitas, además de las visitas en las que se produce un error.  
  https://sentry.io/privacy/
- **Formspree**: procesa los envíos del formulario de contacto y los avisos de equipaje encontrado.  
  https://formspree.io/security/
- **Telegram**: entrega al propietario del sitio los avisos de equipaje encontrado.  
  https://telegram.org/privacy
- **Cloudflare**: trata datos de seguridad y contra el uso indebido como responsable del tratamiento independiente.  
  https://www.cloudflare.com/privacypolicy/
- **Vercel**: trata los registros de alojamiento como responsable del tratamiento independiente, y los datos agregados de análisis y rendimiento por cuenta nuestra.  
  https://vercel.com/legal/privacy-policy

## Transferencias de datos

Formspree, Vercel, Sentry, Cloudflare y Telegram pueden tratar datos en Estados Unidos u otras jurisdicciones fuera del Espacio Económico Europeo.  
Las transferencias están protegidas mediante cláusulas contractuales tipo (SCC) y otras garantías conformes al RGPD.

## Conservación de datos

- Los envíos a través del formulario de contacto se conservan únicamente durante el tiempo necesario para responderte.
- Los registros de alojamiento y los análisis (Vercel), los datos contra el uso indebido (Cloudflare) y los informes de errores (Sentry) se rigen por las políticas de conservación de cada proveedor.
- Los avisos de equipaje encontrado se conservan solo hasta que se resuelve el asunto del equipaje.
- No mantenemos bases de datos locales ni persistentes con información de los visitantes.

## Tus derechos

Puedes solicitar:

- Acceder a tus datos personales
- Rectificar datos inexactos
- Suprimir tus datos
- Oponerte al tratamiento
- Retirar tu consentimiento
- Solicitar la portabilidad de los datos que hayas facilitado

Para ejercer tus derechos, envía un correo electrónico a: **contact@opa.so**

También puede presentar una reclamación ante la AEPD:  
https://www.aepd.es/

## Contacto

Para cuestiones relacionadas con la privacidad, póngase en contacto con nosotros en:  
**contact@opa.so**

_Última actualización: 6 de noviembre de 2026_
