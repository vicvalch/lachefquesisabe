# Guía rápida de uso — La Chef que Sí Sabe

Esta guía explica, paso a paso y en lenguaje simple, cómo usar el panel
admin de La Chef que Sí Sabe. Está pensada para una persona que gestiona
el día a día (leads, demos, contenido y seguimientos) sin necesitar
conocimientos técnicos.

Para entrar al panel, andá a `/admin/login` e ingresá con el usuario y
contraseña que te haya dado quien administra el sitio. Si todavía no
tenés un usuario, pedile a esa persona que te lo cree desde Supabase (ver
el `README.md`, sección "Crear el usuario admin").

Una vez adentro, vas a ver el **Dashboard**: un resumen de lo que hay que
atender hoy (seguimientos vencidos, seguimientos de hoy, leads nuevos,
próximas demos y campañas recientes). Desde ahí podés ir a cualquier
sección con el menú de la izquierda (en el celular, tocá el botón de menú
arriba para abrirlo).

## 1. Cómo revisar leads nuevos

1. Andá a **Leads** en el menú.
2. Ahí ves todos los leads (personas que dejaron sus datos), con su
   nombre, contacto, interés, estado y fecha en la que llegaron.
3. Podés filtrar por estado o por interés usando los filtros de arriba.
4. Tocá el nombre de un lead para ver su detalle completo.

También podés ver los leads más recientes directamente desde el
**Dashboard**, en la sección "Leads nuevos".

## 2. Cómo contactar un lead por WhatsApp

1. Entrá al detalle del lead (`Leads` → tocá su nombre).
2. En la sección **Plantillas de mensaje**, elegí una plantilla (por
   ejemplo, "Primer contacto" o "Invitación a demo"). El mensaje se arma
   solo con el nombre del lead y, si corresponde, los datos de una demo.
3. Tocá **Copiar mensaje** para pegarlo donde quieras, o **Abrir
   WhatsApp** para que se abra directo con el mensaje ya escrito (esto
   solo funciona si el lead tiene un número de teléfono cargado).
4. El envío siempre es manual: el sistema arma el mensaje, pero quien lo
   manda sos vos, desde tu WhatsApp.

## 3. Cómo registrar un contacto

Después de escribirle a un lead (por WhatsApp, llamada, etc.), es
importante dejarlo registrado:

1. En el detalle del lead, bajá hasta **Registrar contacto**.
2. Elegí el canal (WhatsApp, teléfono, email, etc.) y si el contacto fue
   iniciado por vos o por el lead.
3. Escribí un resumen corto de qué se habló.
4. Si querés, indicá cuándo hay que volver a contactar a esta persona
   ("Próximo seguimiento"): esto crea automáticamente una tarea nueva que
   vas a ver en el Centro de Seguimientos.
5. Guardá. El contacto queda en el historial del lead, y su "último
   contacto" se actualiza solo.

## 4. Cómo crear una demo

1. Andá a **Demos** → **Crear demo**.
2. Completá el título, si es presencial o virtual (y el lugar o el link
   según corresponda), la fecha y hora de inicio (y de fin si querés), el
   cupo máximo de personas, una descripción y notas públicas (se muestran
   en el sitio) y notas internas (solo las ve el equipo admin).
3. Guardá. La demo se crea como "programada" y ya aparece en el sitio
   público (`/demos`) para que la gente se registre.

## 5. Cómo revisar registros a demo

1. Andá a **Demos** y tocá la demo que te interesa.
2. Vas a ver la lista de personas inscriptas (el "roster"), con su estado
   de asistencia y el cupo ocupado sobre el total.
3. Desde ahí también podés agregar un lead existente a la demo con el
   selector de arriba.

## 6. Cómo marcar asistencia

1. Entrá al detalle de la demo.
2. En la lista de inscriptos, cada fila tiene un selector de estado:
   registrado, confirmó, asistió, no asistió o canceló.
3. Cambiá el estado apenas lo sepas (por ejemplo, el día de la demo o al
   día siguiente). Esto actualiza automáticamente el estado del lead en
   todo el sistema y genera la tarea de seguimiento que corresponde (por
   ejemplo, "seguimiento post-demo" si asistió, o "reagendar" si no
   asistió).

## 7. Cómo publicar una receta/tip

1. Andá a **Contenido** → **Crear contenido**.
2. Elegí el tipo (receta, tip o guía), un título, una categoría opcional,
   y completá el resto: extracto, cuerpo del texto, ingredientes e
   instrucciones si aplica, tiempos de preparación/cocción, porciones y
   dificultad.
3. En **Estado**, elegí "Publicado" si querés que se vea ya mismo en
   `/recetas`, o "Borrador" si todavía no está listo.
4. Guardá. Si lo dejaste en borrador, podés volver más tarde a
   `/admin/content`, abrirlo y cambiar el estado a "Publicado" cuando
   esté terminado.

## 8. Cómo editar plantillas

1. Andá a **Plantillas**.
2. Vas a ver la lista de plantillas de mensaje (las que se usan para
   WhatsApp). Tocá una para editarla.
3. Podés cambiar el nombre, el texto del mensaje (podés usar
   `{{name}}`, `{{demo_title}}`, `{{demo_date}}`, `{{demo_hora}}` y
   `{{demo_location}}` para que se completen solos) y si está activa o
   no.
4. Para crear una plantilla nueva, usá **Plantillas** → **Crear
   plantilla**. Ahí definís también su "clave" (identificador interno),
   que no se puede cambiar después.

## 9. Cómo usar seguimientos

1. Andá a **Seguimientos**: es el Centro de Seguimientos, donde aparecen
   todas las tareas pendientes agrupadas en **vencidas**, **de hoy** y
   **próximas**.
2. Cada tarjeta te dice a quién hay que escribirle y por qué, con una
   plantilla de mensaje ya sugerida.
3. Desde ahí podés copiar el mensaje, abrir WhatsApp, registrar el
   contacto (esto completa la tarea automáticamente), saltarla (si no
   pudiste contactar a esa persona todavía) o reprogramarla para otra
   fecha.
4. Si una tarea ya no aplica, podés cancelarla.

## 10. Cómo crear un segmento

1. Andá a **Segmentos** → **Crear segmento**.
2. Ponele un nombre y una descripción opcional.
3. Elegí los filtros que quieras combinar: estado del lead, interés
   principal, si dio consentimiento de contacto, rango de fechas, si
   tiene una tarea de seguimiento abierta, si está inscripto en una demo
   puntual, etc. Todos los filtros son opcionales y se combinan entre sí.
4. Guardá. Vas a ver una vista previa en vivo de qué leads matchean ese
   segmento hoy (se recalcula sola cada vez que entrás).

## 11. Cómo crear una campaña manual

1. Andá a **Campañas** → **Crear campaña**.
2. Elegí el segmento y la plantilla de mensaje que querés usar.
3. Ponele un nombre a la campaña y configurá la tarea que se va a generar
   por cada destinatario (tipo de contacto sugerido, prioridad, título y
   notas de la tarea, y para cuándo).
4. Guardá. La campaña arranca en estado "borrador": todavía no le pasó
   nada a nadie, faltan los dos pasos de abajo.

## 12. Cómo materializar destinatarios

Este es el **paso 1** de una campaña: fija la lista de quién va a recibir
seguimiento.

1. Entrá al detalle de la campaña.
2. Tocá **Materializar destinatarios**.
3. El sistema toma los leads que hoy matchean el segmento elegido (solo
   los que dieron consentimiento de contacto) y los deja fijados como
   destinatarios de esta campaña. Todavía no se crea ninguna tarea ni se
   manda ningún mensaje.
4. Podés repetir este paso más adelante: solo se agregan los leads nuevos
   que entraron al segmento después, nunca se duplican.

## 13. Cómo generar tareas

Este es el **paso 2**, y el único que realmente deja algo para trabajar.

1. En el detalle de la misma campaña, tocá **Generar tareas de
   seguimiento**.
2. El sistema crea una tarea de seguimiento por cada destinatario
   pendiente (los que ya se generaron una tarea antes no se duplican).
3. Estas tareas van a aparecer en el Centro de Seguimientos como
   cualquier otra: se trabajan una por una, a mano.
4. Nada de esto envía mensajes automáticamente: solo deja el trabajo
   organizado y listo para que lo hagas vos.

## 14. Cómo ver tareas en el Centro de Seguimiento

Ya lo viste en el punto 9, pero para resumir: **Seguimientos** es la
pantalla donde vas a pasar la mayor parte del tiempo día a día. Ahí
convergen las tareas automáticas (lead nuevo, inscripción a demo, cambio
de estado) y las manuales (las que creás vos o las que salen de una
campaña). Revisala todos los días para no dejar a nadie sin respuesta.

---

Si algo no aparece donde esperás, revisá primero si hay un filtro activo
(por ejemplo, en Leads o en Contenido) y si el dato tiene el estado
correcto (por ejemplo, un contenido en "Borrador" no aparece en el sitio
público hasta que lo publiques). Si el problema persiste, contactá a
quien administra el proyecto técnico.
