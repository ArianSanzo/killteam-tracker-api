# killteam-tracker-api
## Tecnologías

Node.js, Express, Sequelize, SQLite, bcrypt y JSON Web Token.

## Iniciar el servidor

El servidor requiere `JWT_SECRET`, una clave privada usada para firmar las sesiones. En PowerShell, genera una clave y úsala antes de iniciar:

```powershell
$jwtSecret = node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
[Environment]::SetEnvironmentVariable('JWT_SECRET', $jwtSecret, 'User')
$env:JWT_SECRET = $jwtSecret
npm run dev
```

Guarda la clave una sola vez por usuario de Windows. Si la cambias, las sesiones emitidas anteriormente dejarán de ser válidas.

En el primer inicio se crean los roles que falten y, si no existe, una cuenta superadmin inicial. La contraseña generada se muestra una sola vez en la consola. Puedes definir `SUPERADMIN_EMAIL`, `SUPERADMIN_NAME` y `SUPERADMIN_PASSWORD` como variables de entorno antes de iniciar.

## Sesión

- `POST /auth/register`: crea una cuenta de usuario.
- `POST /auth/login`: devuelve un token y los datos públicos del usuario.
- `GET /auth/me`: devuelve el usuario asociado al token; requiere `Authorization: Bearer <token>`.
- `PATCH /auth/me`: actualiza nombre, email o contraseña. Para cambiar email o contraseña, también requiere `currentPassword`.

Las contraseñas se guardan y verifican con bcrypt. El inicio de sesión no admite contraseñas almacenadas en texto plano.

La administración de usuarios requiere rol superadmin: `GET /users`, `GET /roles`, `PUT /users/:id/role` con `{ "roleId": 2 }` y `DELETE /users/:id`. El superadmin no puede cambiar ni eliminar su propia cuenta, y siempre debe quedar al menos un superadmin.

## Partidas

Las rutas de partidas requieren sesión. Al crear una partida, el propietario se toma del token y la fecha actual se usa si no se envía `date`. Admin y superadmin pueden consultar y editar el historial completo; el endpoint `/matches/:matchId/continue` solo permite continuar partidas propias.

- `PUT /matches/:matchId/game-teams/:gameTeamId/turning-points/:turningPoint`: guarda `critOp`, `tacOp` y `killOp` como puntajes acumulados de ese turning point. Al guardar uno, crea el siguiente con esos puntajes; si luego corriges el anterior, actualiza el siguiente mientras no haya sido modificado manualmente.
- `PATCH /matches/:matchId/game-teams/:gameTeamId/operatives/:gameOperativeId/wounds`: actualiza heridas con `{ "wounds": 8 }`.
- `PATCH /matches/:matchId/finished`: finaliza la partida con `{ "isFinished": true }`.

Las escrituras de equipos, operativos, armas, habilidades y reglas requieren rol admin o superadmin. Al crear un operativo se debe enviar al menos un `weaponIds`; `abilityIds` es opcional. Las armas admiten `ruleIds`. En una actualización, las asociaciones solo se reemplazan si se incluye su arreglo correspondiente. La eliminación de elementos del catálogo se bloquea cuando rompería referencias del historial.

Al borrar una partida se eliminan sus filas `GameTeam`, `GameOperative` y `PointsTable`; no se borran las plantillas del catálogo. Borrar un usuario sí borra sus partidas y las copias dependientes.
