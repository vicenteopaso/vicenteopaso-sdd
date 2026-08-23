---
name: 8-Agent Job Search System
title: "Dentro de un sistema de 8 agentes que gestiona mi búsqueda de empleo"
slug: 8-agent-job-search-system
description: "Un sistema multiagente que corre en mi propio VPS y gestiona mi búsqueda de empleo — escaneo diario, triaje de correo, monitorización de LinkedIn, investigación y revisión estratégica semanal."
---

## Resumen

Es un sistema multiagente que corre en mi propio VPS y gestiona mi búsqueda de empleo — escaneo diario, triaje de correo, monitorización de LinkedIn, investigación y revisión estratégica semanal. Ocho agentes especializados divididos en dos niveles: cinco agentes de "volumen" que hacen trabajo operativo diario/semanal, y tres agentes "pesados" que hacen revisión semanal y llamadas de juicio reactivas. Un noveno componente, Concierge, es el único punto de entrada para todo lo que llega por Telegram — enruta los mensajes al especialista correcto, convierte las solicitudes de varios pasos en tickets en un tablero compartido en lugar de bloquear una conversación, y entrega un único resumen diario en vez de ocho hilos de chat separados. A continuación: qué hace cada agente, cómo se mueve realmente el trabajo entre ellos, y el incidente de producción que forzó un rediseño de cómo se comunican con Telegram.

## Los dos niveles

*Los agentes de volumen* — JobHunter, Growth, Email, LinkedIn, Research — corren con una cadencia fija: diaria o semanal, sin importar si ese día pasó algo interesante. Corren sobre un nivel de modelo más ligero, ya que el trabajo es de alta frecuencia y en gran parte mecánico — escanear, hacer triaje, resumir, marcar.

*Los agentes pesados* — Executive, Coach, Finance — en su mayoría no tienen calendario propio. Responden cuando se les delega algo, o corren una única pasada semanal. La división no tiene que ver con la importancia, sino con la cadencia y la carga de razonamiento: los agentes de volumen detectan cosas, los agentes pesados deciden cosas.

Concierge queda fuera de ambos niveles, como capa de interfaz.

## Los agentes

**JobHunter.** Ejecuta un escaneo diario de nuevas oportunidades y una revisión semanal de todo el pipeline. Cuando un puesto vale la pena perseguir, JobHunter construye el "paquete de aplicación" — en la práctica un issue de Linear, con los detalles del puesto en la descripción y una serie de comentarios que llevan el checklist de screening, las respuestas de la aplicación, notas de CV y borradores de outreach. Todo lo relacionado con una aplicación concreta vive en un solo lugar en vez de estar disperso en el historial de chat. Cada paquete lleva un campo de origen — frío, referido cálido, reclutador o entrante — y antes de construir un paquete frío, JobHunter lo contrasta con dos documentos que mantiene Research: uno que rastrea a excompañeros en la empresa objetivo, otro que rastrea a reclutadores que cubren la región, para que una aplicación "fría" no se construya como fría si en realidad existe un camino más cálido. JobHunter también incorpora los datos de benchmark de compensación que Finance produce por separado, de modo que un paquete refleja tanto el encaje como el contexto de mercado cuando está listo.

**Growth.** Vigila las tendencias de habilidades y de mercado con cadencia semanal. Cuando encuentra un hueco entre lo que piden las ofertas y lo que cubre mi posicionamiento actual, abre una tarea para Coach en vez de simplemente registrar la observación en algún sitio.

**Email.** Triaje diario de bandeja de entrada, construido sobre un cliente de correo por línea de comandos en lugar de una integración web, de modo que puede correr sin supervisión en el VPS sin necesitar una sesión de navegador activa. Clasifica y muestra correos de reclutadores, rechazos y solicitudes de agenda.

**LinkedIn.** Planificación de contenido semanal y escaneo diario de interacciones, leyendo el perfil en vivo mediante automatización de navegador en lugar de una API. No puede publicar ni interactuar en mi nombre — prepara y marca, yo publico. Ese límite es deliberado; no quería un agente con acceso de escritura sin supervisión a nada de cara al público.

**Research.** El agente utilitario. Tiene su propio calendario diario de monitorización de noticias, pero gran parte de su trabajo es delegado — otros agentes disparan una investigación a fondo de una empresa cuando necesitan contexto que no tienen, y Research va a buscarlo. También es dueño de dos documentos de referencia permanentes que usan otros agentes: un mapa de red de excompañeros en las empresas que tengo como objetivo, y una lista de reclutadores que cubren puestos de liderazgo en la región, construida de forma oportunista en vez de en una sola pasada.

**Executive.** Una revisión semanal de toda la operación — salud del pipeline, en qué se está yendo el tiempo, qué se está estancando — en lugar de la ejecución de una tarea concreta. Está programado deliberadamente al final de la secuencia del lunes, después de que hayan corrido Growth, LinkedIn, Coach y Finance, para que su síntesis lea de verdad la producción real de la semana en lugar de correr en paralelo con ella y perderse la mitad del panorama.

**Coach.** Preparación de entrevistas y posicionamiento, mayormente reactivo. Ejecuta una verificación semanal de preparación que no dice nada cuando esa semana no hay realmente nada en etapa de entrevista — deliberadamente silencioso en vez de enviar relleno.

**Finance.** Análisis de compensación y ofertas. Ejecuta una pasada semanal de benchmark de mercado que escribe las bandas de compensación actuales en disco, que JobHunter luego incorpora en los paquetes de aplicación correspondientes. Por lo demás es reactivo — entra en juego cuando hay una negociación u oferta real que analizar.

**Concierge.** No es un especialista — es la puerta de entrada. Todo mensaje entrante de Telegram pasa primero por él. Un mensaje con el prefijo del nombre de un agente se enruta directamente a ese especialista, y la respuesta se retransmite etiquetada con qué agente contestó. Sin prefijo, Concierge responde directamente o me indica a qué especialista dirigirme. Cualquier cosa que necesite más que una respuesta síncrona rápida se convierte en una tarea en el tablero compartido en lugar de bloquear un chat. Concierge también gestiona el resumen diario — reuniendo los resultados de cada tarea programada de los ocho agentes en un único resumen en vez de ocho avisos separados.

## Cómo se mueve realmente el trabajo

La programación no vive dentro de los propios agentes — los trabajos recurrentes se despachan de forma centralizada, y un proceso de sondeo independiente recoge el trabajo listo y lanza al especialista necesario para manejarlo. Ese desacoplamiento importa: un agente no necesita estar corriendo activamente para que se le programe trabajo, solo para que ese trabajo termine siendo recogido.

La delegación entre agentes es del tipo "disparar y olvidar" por diseño. Cuando un agente le pasa trabajo a otro, no espera la respuesta — esperar crea una cadena de dependencia, y una cadena de dependencia entre dos agentes que arrancan cada uno con su propio calendario es una forma directa de llegar a un interbloqueo. En cambio, lo que produce un agente delegado se incorpora en la siguiente corrida relevante del solicitante, no de inmediato.

El principio de diseño de qué cuenta como "motivo de descarte" también tuvo que hacerse explícito en lugar de dejarlo implícito. Si algo sobre un puesto cambia después de que ya se construyó un paquete — por ejemplo, cambian los requisitos de ubicación — eso hay que sacarlo a la luz, pero no es motivo para que el agente descarte la aplicación por su cuenta; ese juicio se queda conmigo. De forma similar, una respuesta de aplicación ya preparada nunca queda invalidada automáticamente por una oferta de empleo modificada — se vuelve a verificar contra el texto exacto de la pregunta de screening original, porque es el alcance de la pregunta lo que determina si la respuesta sigue siendo válida, no cualquier otra cosa que haya cambiado en la oferta.

Una regla está por encima de todo eso y aplica a todos los agentes por igual: ninguno de ellos envía jamás una aplicación, ni manda outreach o correo, ni publica nada en LinkedIn en mi nombre. Mi aprobación autoriza solo la preparación — redactar, empaquetar, poner en cola — nunca el envío. Yo soy quien realmente envía.

## Dónde se rompió de verdad

El único incidente de producción real vino de una decisión de diseño que tomé con demasiada ligereza al principio: varios agentes compartiendo un único token de bot de Telegram, cada uno intentando escuchar mensajes entrantes en él. Eso produjo un bucle de caídas — agentes compitiendo por la misma conexión entrante, ninguno estable.

La solución fue dejar de tratar el acceso a Telegram como algo que todos los agentes tienen por defecto. Concierge se convirtió en la única puerta de entrada, con su propio bot dedicado. A cada otro especialista se le desactivó explícitamente su escucha entrante de Telegram — todavía pueden enviar mensajes salientes cuando Concierge enruta una respuesta a través de ellos, pero ninguno compite ya por el tráfico entrante.

El problema de fondo no era que ningún agente se comportara incorrectamente. Eran dos componentes que nunca debieron compartir un recurso, compartiéndolo — y solo se manifestó una vez que había suficientes agentes corriendo a la vez para que la contención realmente ocurriera. No apareció en las pruebas iniciales con uno o dos agentes activos; solo apareció una vez que el sistema completo de ocho agentes estuvo en producción.

Un segundo problema tardó más en arreglarse de verdad que en notarse. Al principio, algunos agentes tenían copias programadas duplicadas corriendo junto a sus tareas principales — un resto de las pruebas. La solución obvia fue pausar las copias duplicadas, lo cual hice, y el síntoma desapareció. Pero el problema de fondo de ordenamiento — que Executive necesitaba correr estrictamente después de Growth, LinkedIn, Coach y Finance los lunes, no solo después de que desaparecieran sus duplicados — no quedó realmente resuelto con ese arreglo. Simplemente dejó de ser visible, porque las copias pausadas no eran el único camino para que se disparara fuera de orden. El arreglo real, secuenciar a Executive al final de la corrida del lunes de forma explícita en lugar de depender de que los duplicados hubieran desaparecido, llegó más tarde. Es un buen ejemplo de un arreglo que resuelve el síntoma que estás mirando sin resolver el mecanismo que todavía podría producirlo de otra manera.

La capa de resumen tuvo un problema relacionado: falsos positivos en su propia deduplicación. El resumen rastrea los trabajos programados usando una huella (fingerprint), y esa huella originalmente incluía cuán "antiguo" era el contenido renderizado de un elemento en ese momento. Dos corridas del mismo trabajo subyacente podían renderizar edades ligeramente distintas para el mismo elemento, lo que hacía que la huella cambiara aunque nada del trabajo en sí hubiera cambiado — y el resumen entonces o bien omitía el elemento o lo volvía a mostrar como si fuera nuevo. La solución fue calcular la huella sobre la identidad del elemento en lugar de sobre la edad renderizada, de modo que el mismo elemento subyacente produzca siempre el mismo hash sin importar cuándo se renderice. Es una distinción pequeña, pero es la diferencia entre un mecanismo de deduplicación que está realmente basado en la identidad y uno basado en un valor que suele correlacionar con la identidad — lo cual funciona bien hasta que deja de hacerlo.
