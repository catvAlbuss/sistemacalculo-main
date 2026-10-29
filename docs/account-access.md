# Cuentas, cobertura y sesiones

La migración `2026_10_28_000016_add_account_access_control.php` añade el estado administrativo de la cuenta, un registro de sesiones y eventos de seguridad. Ejecutar las migraciones antes de publicar el código en el servidor.

- **Habilitada:** permite autenticación. El acceso a los programas exige cobertura vigente, salvo los roles administrativos autorizados.
- **Bloqueada:** impide autenticación hasta que root o gerencia la habilite.
- **Vetada:** restricción por incumplimiento, con motivo obligatorio y registro de administración. Solo administración puede retirarla.
- **Baja:** retira acceso y cancela coberturas, conserva los registros financieros y reserva el correo. No borra en cascada pagos, comprobantes ni proyectos.

Root y gerencia gestionan clientes; gerencia no puede modificar cuentas root ni otorgar ese rol. Nadie puede bloquear o dar de baja su propia cuenta. El correo, roles y permisos siguen bajo control administrativo.

Cada cuenta es personal y admite como máximo dos sesiones independientes. Varias pestañas del mismo navegador comparten sesión. Un tercer acceso invalida las sesiones y los tokens «recordarme», registra un aviso y exige iniciar sesión nuevamente. La decisión se realiza dentro de una transacción con bloqueo de la fila del usuario. La actividad caduca según `session.lifetime`.

Las páginas autenticadas visibles verifican la sesión cada 60 segundos; al volver a una pestaña oculta se verifica nuevamente. Un fallo de red no se interpreta como cierre. Los avisos quedan disponibles en Perfil y seguridad, inicio y el registro administrativo. No se envían correos adicionales.

La cobertura y el estado de cuenta son independientes. Cancelar o suspender una cobertura no veta a la persona ni impide una renovación. Un pago o una asignación administrativa nunca levanta un bloqueo de cuenta.

La asignación administrativa registra importe pagado cero y origen manual. Puede añadir cobertura después de la contratada o reemplazar los períodos desde hoy. No emite cargos ni simula confirmaciones de Culqi. La prueba mantiene el límite de cinco días, una vez por cuenta. Los pagos online mantienen sus verificaciones, cotizaciones y confirmaciones de pasarela.

La apariencia sigue automáticamente `prefers-color-scheme`, igual que el modo oscuro de Tailwind. No hay selector ni preferencia manual que reemplace la configuración del equipo. Las hojas conservan sus estilos y cálculos.

El inicio después de autenticar es el dashboard. Root y gerencia ven operaciones administrativas; asistentes y clientes ven sus proyectos, cobertura y programas. Sin cobertura, el dashboard continúa disponible y los accesos a los programas se muestran deshabilitados. Una marca antigua `is_active=false` no elimina los permisos de un administrador cuya cuenta esté administrativamente habilitada: los bloqueos se aplican mediante `account_status`.
