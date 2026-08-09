# Extensión oficial de verificación de sesgos mediáticos y hechos

<!-- hy-mt2-i18n:start -->
[English](./README.md) | [中文](./README_zh-CN.md) | [日本語](./README_ja.md) | **Español**
<!-- hy-mt2-i18n:end -->


## Últimas noticias

### Novedades en la versión 4.1

- **Restaurada la anotación en el feed de Facebook** — Las insignias de sesgo ahora se muestran correctamente en las publicaciones después de los recientes cambios en el DOM de Facebook  
- **Botón de búsqueda de noticias** — Busca más información sobre cualquier artículo directamente desde la insignia de sesgo (puede desactivarse en la configuración)  
- **Mejoras de rendimiento** — Procesamiento con debouncing de MutationObserver para mayor eficiencia

### Destacados de la versión 4.0

- **Controles de historias patrocinadas** — Opción para contraer o ocultar las historias patrocinadas en tu feed  
- **Se eliminó el soporte para Twitter/X** — Debido a cambios en la API de la plataforma  
- **Arquitectura moderna de extensiones** — Actualizado al framework Plasmo con Manifest v3

### Nuevo canal de soporte

Aunque el subreddit seguirá activo, trasladaremos nuestro soporte principal a nuestra [Página de Facebook](https://www.facebook.com/mbfcext).

## Instrucciones de compilación

Consulte la documentación en [BUILD.md](BUILD.md).

## Introducción

¡Gracias por instalar la [Extensión Oficial de Sesgo Mediático/Verificación de Hechos](https://drmikecrowe.github.io/mbfcext/)! Agradecemos mucho que haya instalado nuestra extensión.

Reciba información mientras consulta su feed de Facebook. Somos la fuente más completa sobre sesgos mediáticos en Internet. Actualmente hay más de 1100 fuentes de medios registradas en nuestra base de datos, y su número sigue aumentando día a día. No se deje engañar por fuentes de noticias falsas. Esta extensión es completamente de código abierto, y su código fuente está alojado [aquí](https://github.com/drmikecrowe/mbfcext).

Si encuentra algún problema con esta extensión, tiene ideas para mejorarla o simplemente desea hablar al respecto, contamos con el subreddit [r/MediaBiasFactCheck](https://www.reddit.com/r/MediaBiasFactCheck/) a su disposición.

## ¡Necesitamos su ayuda!

Si le gusta esta extensión, por favor ayúdenos:

- Déjenos una reseña positiva en la [Chrome Web Store](https://chromewebstore.google.com/detail/media-bias-fact-check/ganicjnkcddicfioohdaegodjodcbkkh) o en la [Página de complementos de Firefox](https://addons.mozilla.org/en-US/firefox/addon/media-bias-fact-check/). Esto ayudará a aumentar el número de usuarios nuestros.
- Por favor, hágalo saber a sus amigos. Si desea compartirlo en Facebook, [haga clic aquí ahora](https://www.facebook.com/sharer/sharer.php?u=https%3A//chromewebstore.google.com/detail/media-bias-fact-check/ganicjnkcddicfioohdaegodjodcbkkh).

## Notas de lanzamiento de la versión 4.1

- Restaurada la anotación en el feed de Facebook tras los cambios en su estructura DOM  
- Se agregó un botón de búsqueda de noticias para investigar artículos (configurable)  
- Se actualizó a Node 24 y al moderno TypeScript 5.9  
- Se implementó debouncing en MutationObserver para mejorar el rendimiento  
- Se añadió seguimiento con Google Analytics del uso de las funciones

## Notas de lanzamiento de la versión 4.0

- Se actualizó a Node 18.  
- Se pasó a utilizar Plasmo como base para la extensión.  
- Se actualizó a manifest v3.  
- Se actualizó Google Analytics a v4.

## Notas de lanzamiento de la versión 3.0

- Ahora es compatible con el nuevo diseño de Facebook  
- Revisión completa del código  
- Ahora permite desarrollar extensiones para Firefox y Opera

## Notas de lanzamiento de la versión 2.0

### Ahora se muestra el ícono de sesgo para los sitios denunciados

- Navegue hasta un sitio revisado por Media Bias/Fact Check y el ícono de la extensión cambiará ahora para indicar el sesgo del sitio.  
- Si ha ocultado el sitio en la configuración, ese ícono parpadeará para llamar su atención.

## Notas de lanzamiento para la versión 1.0.15

### Ahora se muestra información más detallada:

- Informes: El análisis de informes realizado por [Media Bias/Fact Check](https://mediabiasfactcheck.com)  
- Referencias: Se trata del [Link Equity de Moz](https://moz.com/learn/seo/what-is-link-equity); anteriormente se le conocía coloquialmente con el término poco apropiado “link juice”. Es un factor de clasificación en motores de búsqueda basado en la idea de que ciertos enlaces transfieren valor y autoridad de una página a otra. Este valor depende de varios factores, como la autoridad de la página que hace el enlace, su relevancia temática, el estado HTTP, entre otros. Los enlaces que transfieren este valor son una de las muchas señales que Google y otros motores de búsqueda utilizan para determinar la posición de una página en los resultados de búsqueda. Análisis de Link Equity de Moz.  
- Popularidad: De los más de 2000 sitios analizados por MBFC, esta cifra indica dónde se sitúa dicho sitio en esa escala. Los sitios con pocas referencias (Link Equity) tienen una popularidad cercana al 0 %. Los sitios con 3 millones de referencias alcanzan el 100 %. Este porcentaje puede ayudarte a decidir hasta qué punto debes tomar en serio ese sitio.  
- Búsqueda: Este enlace abre una nueva ventana en nuestro sitio asociado [https://factualsearch.news](https://factualsearch.news) e intenta buscar la frase clave. Debería ayudarte a comenzar tu investigación sobre un tema específico y su precisión.

### Nuevas funciones:

- Ahora permite recoger las fuentes de informes factuales de tipo “Mixto”.

## Notas de la versión 1.0.13

Estamos muy contentos de anunciar una nueva función: **_Noticias plegables_**

- Haga clic en la sección “Colapsar” a la izquierda.  
- Elija qué categorías de noticias desea colapsar en su feed.  
- Disfrute de la reducción del estrés causado por esos amigos extremistas de Facebook.
