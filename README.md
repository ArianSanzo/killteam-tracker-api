# killteam-tracker-api
## Tecnologías

Node.js, Express, Sequelize, SQLite, bcrypt y JSON Web Token.

## Iniciar el servidor

El servidor requiere `JWT_SECRET`, una clave privada usada para firmar las sesiones. En PowerShell, genera una clave y úsala antes de iniciar:

```powershell
$env:JWT_SECRET = node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
npm run dev
```

Mantén la misma clave al reiniciar el servidor; si la cambias, las sesiones emitidas anteriormente dejarán de ser válidas.

En el primer inicio se crean los roles que falten y, si no existe, una cuenta superadmin inicial. La contraseña generada se muestra una sola vez en la consola. Puedes definir `SUPERADMIN_EMAIL`, `SUPERADMIN_NAME` y `SUPERADMIN_PASSWORD` como variables de entorno antes de iniciar.

## Sesión

- `POST /auth/register`: crea una cuenta de usuario.
- `POST /auth/login`: devuelve un token y los datos públicos del usuario.
- `GET /auth/me`: devuelve el usuario asociado al token; requiere `Authorization: Bearer <token>`.

Las contraseñas nuevas se guardan con bcrypt y el inicio de sesión solo acepta contraseñas verificables con bcrypt. La base de datos existente se actualizó para guardar los hashes de las cuentas actuales.
