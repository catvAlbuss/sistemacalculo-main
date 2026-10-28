# Videos del catálogo

Desde **Administración → Videos y tráileres**, seleccionar portada o programa, cargar MP4, MOV o WebM y enviar. La opción «Publicar automáticamente cuando esté listo» está marcada inicialmente. Desmarcarla permite revisar antes de publicar.

También se puede seleccionar **Enlace de YouTube** y pegar una URL de video (`watch`, `youtu.be`, `shorts`, `live` o `embed`). Solo se conserva su identificador validado: no se descarga, convierte ni almacena el archivo en Spatie, y no ocupa la cola de FFmpeg. Con publicación automática se muestra inmediatamente; sin ella queda en revisión.

Las fichas muestran el reproductor oficial de YouTube dentro de una sección de demostración, usando el dominio de privacidad mejorada `youtube-nocookie.com` y carga diferida (`loading="lazy"`). El visitante pulsa el botón nativo para comenzar; no necesita salir de la web. Los controles y la marca de YouTube permanecen visibles y la plataforma puede mostrar anuncios. La API de control se conecta cuando el reproductor está visible y pausa el video al salir de pantalla o al ocultar la pestaña, conservando la posición. «Ver en YouTube» es una opción secundaria.

El video debe ser público o no listado, seguir disponible y permitir inserción en sitios externos. Guardar el enlace valida su formato, no verifica que YouTube permita reproducirlo; revisar la vista previa antes de publicarlo. No se necesita una llave de YouTube Data API. Las miniaturas y controles de los videos enlazados proceden del reproductor de YouTube.

La portada ocupa la primera pantalla completa, con el video de fondo y el texto superpuesto en la parte inferior. El menú queda sobre el video y los programas aparecen al desplazarse hacia abajo. Los archivos usan `object-fit: cover` para llenar la pantalla: según la proporción del dispositivo se pueden recortar bordes de la imagen, sin modificar el original. Conviene mantener el contenido importante centrado.

Cuando no hay video publicado se utiliza un resumen propio de 22 segundos, sin títulos incrustados, para evitar duplicarlos con el texto HTML. Incluye versiones de escritorio y móvil, MP4 y WebM, y sus respectivos pósteres (`public/assets/marketing/system-background*`). Para regenerarlas: `node scripts/build-home-overview.mjs --background` (Node 22+, Chrome, PHP y FFmpeg; se pueden configurar `CHROME_PATH` y `FFMPEG_PATH`). Los archivos se reemplazan solo cuando la generación termina.

Para reemplazarlo seleccionar **Portada · Resumen del sistema en bucle** y publicar un archivo o enlace de YouTube. Ambos se muestran directamente en el fondo de portada, silenciosos y en bucle. YouTube conserva su reproductor, sus posibles franjas según la proporción del video y sus restricciones de disponibilidad/inserción. El inicio automático depende del navegador y se desactiva con movimiento reducido o ahorro de datos. No se recompone automáticamente un montaje al subir un tráiler individual.

Los archivos de portada se entregan por `/portada/video/{desktop|mobile}.{mp4|webm}`, con soporte de solicitudes parciales (HTTP 206), incluso bajo `php artisan serve`. Los archivos originales no se exponen por esta ruta. El resumen incorporado prueba WebM si MP4 falla; si no se puede reproducir, permanece el póster y se ofrece reintentar.

Se aceptan hasta 200 MB y 5 minutos por archivo. PHP y el servidor HTTP también deben permitir ese tamaño (`upload_max_filesize >= 200M`, `post_max_size >= 210M`; en nginx, `client_max_body_size 210m`). No se cambian configuraciones globales del servidor desde la aplicación.

Los originales se guardan privados con Spatie Media Library en el disco `local`. Las versiones públicas y el póster se guardan en `public/media`, sin depender del enlace `public/storage`. Apache/nginx debe servir esa carpeta como archivos estáticos y admitir peticiones Range. Cada versión tiene una URL diferente, por lo que puede cachearse. Dar permisos de escritura al proceso PHP y al trabajador sobre `storage` y `public/media`.

Se generan MP4 H.264/AAC de hasta 1920×1080 y 1280×720, respetando la proporción y sin aumentar la resolución original. No se aplica opacidad ni recorte. Se comprimen las copias web; el original no se sobrescribe. La portada se reproduce silenciada; los tráileres conservan el audio. El original debe contener colores SDR para una reproducción web consistente.

## Configuración del servidor

1. Instalar las dependencias con `composer install` e instalar FFmpeg con soporte `libx264`/AAC, además de FFprobe.
2. Configurar `FFMPEG_PATH`, `FFPROBE_PATH` y `MEDIA_QUEUE_CONNECTION=media` en `.env`.
3. Ejecutar `php artisan migrate --force`, `php artisan config:cache` y la compilación de Vite.
4. Mantener activo un trabajador dedicado:

```sh
php artisan queue:work media --queue=media --timeout=900 --tries=2 --sleep=3
```

Ejecutar `php artisan videos:verificar` para comprobar binarios, tablas, escritura y configuración antes de cargar los primeros videos.

Gestionarlo con Supervisor/systemd en el servidor y reiniciarlo después de cada despliegue con `php artisan queue:restart`. La conexión `media` usa `retry_after=960`, por encima del tiempo máximo del trabajo; no consume la cola de pagos. El trabajador necesita las mismas rutas a binarios que PHP. Un archivo puede tardar varios minutos en procesarse.

En esta estación Windows los binarios portátiles están en `storage/app/video-tools` y sus rutas quedan en el `.env` local, que no se versiona. No copiar esas rutas de Windows a un servidor Linux. Los binarios de Gyan fueron descargados con verificación SHA256; no forman parte del repositorio.

## Publicación y errores

Una carga nueva no sustituye el video vigente hasta que todas sus versiones estén listas. Las versiones anteriores permanecen en la biblioteca y se pueden publicar nuevamente. Los trabajos de versiones antiguas no reemplazan automáticamente una versión más nueva ya publicada. Una falla conserva el original, muestra un estado de atención y permite reintentar; los detalles técnicos quedan en los registros. Actualizar la biblioteca para consultar el estado.

La portada solo inicia automáticamente si está visible y no hay preferencia de movimiento reducido ni ahorro de datos. Los tráileres subidos como archivo se cargan al reproducirlos y solo se descarga la variante correspondiente al dispositivo; los enlaces de YouTube utilizan su reproductor con carga diferida. Cuando no hay video publicado, se muestra una imagen del programa.

El catálogo se amplía en `config/showcase.php`: slug, nombre, categoría, ruta existente, imagen local, descripción y funciones. El selector de carga admite automáticamente cada nuevo producto.

## Acceso

Las presentaciones son públicas. Las herramientas requieren sesión y cobertura vigente, incluida una única prueba gratuita de 5 días sin tarjeta ni cobro inicial. Al vencer se requiere un plan pagado; no se cobra automáticamente. Cuenta, soporte y respaldos siguen disponibles. Los antiguos accesos Predim y Arco Techo respetan el mismo control.
