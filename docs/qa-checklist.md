# Checklist manual de QA — La Chef que Sí Sabe

Checklist para validar manualmente el sitio antes de cada deploy a
producción. Marcá cada casillero a medida que lo probás. No reemplaza los
tests automáticos (`npm run test`), los complementa con una pasada real
en el navegador.

## Rutas públicas

- [ ] `/` carga sin errores y el formulario de contacto envía correctamente.
- [ ] `/gracias` muestra el mensaje general de agradecimiento.
- [ ] `/gracias?demo=<slug>` muestra el mensaje específico de registro a demo.
- [ ] `/privacidad` carga y el link desde el footer funciona.
- [ ] `/demos` lista solo demos programadas/con cupo lleno y futuras.
- [ ] `/demos/[slug]` de una demo válida carga el detalle y el formulario de registro.
- [ ] `/demos/[slug]` de una demo inexistente, cancelada, ya realizada o vencida devuelve 404.
- [ ] `/recetas` lista solo contenido publicado (nunca borradores ni archivado).
- [ ] `/recetas/[slug]` de un post publicado carga el detalle completo.
- [ ] `/recetas/[slug]` de un post en borrador/archivado o inexistente devuelve 404.
- [ ] Los filtros de `/recetas` (`?type=`, `?category=`) funcionan y son combinables.
- [ ] Una URL inexistente (ej. `/no-existe`) muestra la página 404 amigable, no el error genérico de Next.js.
- [ ] No hay links muertos en el header ni en el footer.
- [ ] `npm run build` no muestra errores ni warnings inesperados.

## Rutas admin y autenticación

- [ ] Sin sesión, entrar a `/admin/leads` (o cualquier ruta `/admin/*`) redirige a `/admin/login?redirectTo=...`.
- [ ] Después de iniciar sesión desde ese link, redirige de vuelta a la ruta original.
- [ ] Con sesión activa, entrar a `/admin/login` redirige a `/admin/dashboard`.
- [ ] Con sesión activa, todas las rutas `/admin/*` cargan sin error de servidor ni de hidratación.
- [ ] `Cerrar sesión` cierra la sesión y vuelve a `/admin/login`.
- [ ] Una URL de detalle admin con un id inexistente (ej. `/admin/leads/id-inventado`) muestra el mensaje amigable de "no encontrado", no un error crudo.
- [ ] El sidebar muestra las 8 secciones (Dashboard, Leads, Demos, Contenido, Seguimientos, Plantillas, Segmentos, Campañas) y resalta la sección activa.

## Dashboard

- [ ] Muestra seguimientos vencidos, seguimientos de hoy, leads nuevos, próximas demos y campañas recientes.
- [ ] Con la base vacía (o filtrando a un estado sin datos), cada sección muestra su estado vacío en vez de romperse.
- [ ] No se ve saturado: no hay más de 5 secciones de contenido.

## Leads

- [ ] Puedo crear un lead desde la landing.
- [ ] El lead aparece en `/admin/leads`.
- [ ] El lead tiene status inicial correcto (`new`).
- [ ] Se crea una tarea `initial_contact` para ese lead.
- [ ] El admin puede abrir el detalle del lead.
- [ ] El admin puede registrar un contacto (queda en el historial y actualiza "último contacto").
- [ ] El admin puede cambiar el estado y las notas del lead.
- [ ] Los filtros de `/admin/leads` (`status`, `interest`) funcionan.
- [ ] Con cero leads, `/admin/leads` muestra el estado vacío correcto.

## Demos

- [ ] El admin puede crear una demo.
- [ ] La demo aparece en `/demos` (sitio público) si está programada y es futura.
- [ ] Una persona puede registrarse a una demo desde `/demos/[slug]`.
- [ ] El registro público crea un lead y una inscripción confirmada.
- [ ] Se crea la tarea `demo_confirmation` correspondiente.
- [ ] El admin puede agregar un lead existente a una demo.
- [ ] El admin puede marcar asistencia (asistió/no asistió/etc.) y el estado del lead se sincroniza.
- [ ] Marcar "asistió" crea la tarea `post_demo_follow_up`; marcar "no asistió" crea `no_show_recovery`.
- [ ] El cupo se respeta: no se puede registrar más gente que la capacidad.
- [ ] Con cero demos, `/admin/demos` y `/demos` muestran su estado vacío.

## Contenido

- [ ] El admin puede crear contenido (receta/tip/guía) en borrador.
- [ ] El admin puede publicarlo (desde creación o editando después).
- [ ] El contenido publicado aparece en `/recetas`.
- [ ] El contenido en borrador o archivado nunca aparece en `/recetas`.
- [ ] Los filtros de `/admin/content` (si aplica) y `/recetas` funcionan.
- [ ] Con cero contenido, `/admin/content` y `/recetas` muestran su estado vacío.

## Seguimientos

- [ ] `/admin/seguimientos` agrupa tareas abiertas en vencidas/hoy/próximas correctamente.
- [ ] El admin puede copiar el mensaje sugerido y abrir WhatsApp.
- [ ] El admin puede registrar contacto desde una tarea (la completa automáticamente).
- [ ] El admin puede saltar, cancelar o reprogramar una tarea.
- [ ] Con cero tareas abiertas, cada grupo (vencidas/hoy/próximas) muestra su estado vacío.

## Plantillas

- [ ] El admin puede ver el listado de plantillas.
- [ ] El admin puede crear una plantilla nueva con una clave única.
- [ ] Crear una plantilla con una clave repetida muestra un error amigable (no un error crudo de base de datos).
- [ ] El admin puede editar el nombre, mensaje y estado activo/inactivo de una plantilla.
- [ ] Con cero plantillas, `/admin/plantillas` muestra su estado vacío.

## Segmentos

- [ ] El admin puede crear un segmento con uno o más filtros.
- [ ] El preview de leads que matchean el segmento se actualiza correctamente.
- [ ] El admin puede editar un segmento existente.
- [ ] Con cero segmentos, `/admin/segmentos` muestra su estado vacío.

## Campañas

- [ ] El admin puede crear una campaña manual (segmento + plantilla + config de tarea).
- [ ] El admin puede materializar destinatarios (solo se incluyen leads con consentimiento de contacto).
- [ ] Materializar de nuevo no duplica destinatarios ya materializados.
- [ ] El admin puede generar tareas de seguimiento a partir de los destinatarios.
- [ ] Generar tareas de nuevo no duplica tareas para destinatarios que ya las tenían.
- [ ] Las tareas generadas aparecen en `/admin/seguimientos`.
- [ ] El admin puede cancelar una campaña.
- [ ] Con cero campañas, cero destinatarios o cero leads en el preview del segmento, cada pantalla muestra su estado vacío correspondiente.
- [ ] El detalle de un lead muestra las campañas donde fue destinatario.

## Mobile (375px, 390px, 430px)

- [ ] Landing pública: el header muestra un menú colapsable y es usable.
- [ ] Formularios públicos (lead, registro a demo): campos e inputs no se cortan.
- [ ] `/demos` y `/demos/[slug]` no rompen el layout.
- [ ] `/recetas` y `/recetas/[slug]` no rompen el layout.
- [ ] `/admin`: el sidebar se colapsa detrás de un botón de menú, no ocupa toda la pantalla.
- [ ] `/admin/leads` y `/admin/leads/[id]`: las tablas no desbordan la página (scroll horizontal contenido dentro de su propia caja, si aplica).
- [ ] `/admin/seguimientos`: las tarjetas de tareas son legibles y los botones no se desbordan.
- [ ] `/admin/campanas/[id]`: las tres columnas/tarjetas se apilan correctamente.

## RLS / seguridad

- [ ] `anon` puede insertar un lead público (con `consent_contact = true`).
- [ ] `anon` puede leer solo demos `scheduled`/`full` y futuras.
- [ ] `anon` puede leer solo contenido `published` con `published_at` cumplido.
- [ ] `anon` NO puede leer `leads`, `contact_logs`, `demo_registrations`, `follow_up_tasks`, `message_templates`, `lead_segments`, `outreach_campaigns` ni `outreach_campaign_recipients`.
- [ ] Un usuario autenticado puede gestionar los datos de admin sin restricciones adicionales.
- [ ] `npm run test` pasa, incluidos los tests de regresión de RLS (`*.rls-policies.test.ts`) y de protección de rutas (`proxy.test.ts`).

## Build y deploy

- [ ] `npm run lint` pasa sin errores.
- [ ] `npm run typecheck` pasa sin errores.
- [ ] `npm run test` pasa sin errores.
- [ ] `npm run build` pasa sin errores.
- [ ] Las variables de entorno necesarias (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) están configuradas en Vercel.
- [ ] Las migraciones (`supabase/migrations/0001` a `0008`, si aplica) están aplicadas en el proyecto de Supabase de producción, en orden.
- [ ] Existe al menos un usuario admin creado en Supabase Authentication.

---

## Smoke Test Manual

Prueba rápida de punta a punta para confirmar que el flujo completo
funciona después de un deploy. Se puede correr contra un ambiente local o
de staging.

- [ ] 1. Crear un lead desde la landing pública (`/`).
- [ ] 2. Confirmar que el lead aparece en `/admin/leads`.
- [ ] 3. Confirmar que se creó la tarea `initial_contact` (visible en `/admin/leads/[id]` o en `/admin/seguimientos`).
- [ ] 4. Crear una demo desde `/admin/demos/new`.
- [ ] 5. Registrar una persona a esa demo desde el sitio público (`/demos/[slug]`).
- [ ] 6. Confirmar que se creó la tarea `demo_confirmation`.
- [ ] 7. Marcar a esa persona como "asistió" desde `/admin/demos/[id]`.
- [ ] 8. Confirmar que se creó la tarea `post_demo_follow_up`.
- [ ] 9. Crear contenido publicado desde `/admin/content/new`.
- [ ] 10. Confirmar que aparece en `/recetas`.
- [ ] 11. Editar una plantilla de mensaje desde `/admin/plantillas`.
- [ ] 12. Crear un segmento desde `/admin/segmentos/new`.
- [ ] 13. Crear una campaña manual desde `/admin/campanas/new`, usando ese segmento.
- [ ] 14. Materializar destinatarios desde el detalle de la campaña.
- [ ] 15. Generar tareas de seguimiento desde el mismo detalle.
- [ ] 16. Confirmar que las tareas nuevas aparecen en `/admin/seguimientos`.
- [ ] 17. Completar una de esas tareas registrando un contacto.
- [ ] 18. Confirmar que quedó un `contact_log` en el historial del lead correspondiente.

Si los 18 pasos pasan sin errores ni mensajes crudos de base de datos, el
sitio está listo para operación real.
