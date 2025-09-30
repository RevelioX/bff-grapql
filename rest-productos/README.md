
# Servicio REST de Productos

Microservicio REST para la gestión de productos en ShopNest.

## Ejecución rápida

1. Clona el repositorio y entra a la carpeta `servicio-productos`.
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Ejecuta la app:
   ```bash
   npm run start:dev
   ```
4. El servicio estará disponible en `http://localhost:5001/api/productos`.

---

## Ejecución con Docker

1. Construye la imagen:
   ```bash
   docker build -t shopnest-productos .
2. Ejecuta el contenedor:
   ```bash
   docker run -p 5001:5001 shopnest-productos
   ```

---

## Estructura recomendada
```
/src
  /controllers
  /models
  /services
  index.ts
﻿# Servicio REST Productos
Microservicio de gestión de productos para ShopNest.
## Endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Healthcheck |
| GET | `/api/productos` | Lista de productos (filtro `?search=` opcional) |
| GET | `/api/productos/:id` | Detalle de un producto |
| POST | `/api/productos` | Crea un producto |
| PUT | `/api/productos/:id` | Actualiza un producto |
| DELETE | `/api/productos/:id` | Elimina un producto |

### Modelo `Product`
```json
{
   "_id": "ObjectId",
   "nombre": "string",
   "descripcionCorta": "string?",
   "descripcionLarga": "string?",
   "precio": 123.45,
   "imagenes": ["url1", "url2"],
   "categoria": "string?",
   "stock": 10,
   "createdAt": "ISO",
   "updatedAt": "ISO"
}
```

### POST /api/productos (payload)
```json
{
   "nombre": "Camiseta",
   "descripcionCorta": "Camiseta básica",
   "precio": 19.99,
   "imagenes": ["https://ejemplo/img1.png"],
   "stock": 50
}
```

### PUT /api/productos/:id (payload ejemplo parcial)
```json
{
   "precio": 17.99,
   "stock": 40
}
```

## Validaciones
- `nombre` requerido.
- `precio` > 0.
- `stock` >= 0.

## Variables de Entorno (`.env`)
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/shopnest_productos
LOG_LEVEL=info
REQUEST_TIMEOUT_MS=3000
```

## Desarrollo Local
```bash
npm install
npm run dev
# http://localhost:3001/health
```

## Build y Run (Node)
```bash
npm run build
npm start
```

## Docker
### Build
```bash
docker build -t rest-productos:local .
```
### Run (requiere Mongo local)
```bash
docker run --name mongo -p 27017:27017 -d mongo:6

docker run --env MONGODB_URI=mongodb://host.docker.internal:27017/shopnest_productos \
   -p 3001:3001 rest-productos:local
```

### Docker Compose (ejemplo rápido inline)
```bash
cat > docker-compose.yml <<'YAML'
version: "3.9"
services:
   mongo:
      image: mongo:6
      ports:
         - "27017:27017"
   rest-productos:
      build: .
      environment:
         - MONGODB_URI=mongodb://mongo:27017/shopnest_productos
      ports:
         - "3001:3001"
      depends_on:
         - mongo
YAML

docker compose up --build
```

## Pruebas con curl
### Health
```bash
curl -s http://localhost:3001/health | jq
```

### Crear producto
```bash
curl -s -X POST http://localhost:3001/api/productos \
   -H 'Content-Type: application/json' \
   -d '{"nombre":"Camiseta","precio":19.99,"stock":50}' | jq
```

### Listar productos
```bash
curl -s http://localhost:3001/api/productos | jq
```

### Buscar productos (texto)
```bash
curl -s "http://localhost:3001/api/productos?search=camiseta" | jq
```

### Obtener detalle
```bash
PRODUCT_ID="<reemplazar>"
curl -s http://localhost:3001/api/productos/$PRODUCT_ID | jq
```

### Actualizar producto
```bash
PRODUCT_ID="<reemplazar>"
curl -s -X PUT http://localhost:3001/api/productos/$PRODUCT_ID \
   -H 'Content-Type: application/json' \
   -d '{"precio":17.99,"stock":40}' | jq
```

### Eliminar producto
```bash
PRODUCT_ID="<reemplazar>"
curl -s -X DELETE http://localhost:3001/api/productos/$PRODUCT_ID -w "\nStatus:%{http_code}\n"
```

## Estructura del Proyecto
```
rest-productos/
   src/
      config/db.ts
      controllers/productController.ts
      middleware/errorHandler.ts
      models/Product.ts
      routes/productRoutes.ts
      services/productService.ts
      validators/productSchemas.ts
      server.ts
   Dockerfile
   .dockerignore
   package.json
   tsconfig.json
   .env.example
   README.md
```

## Futuras Mejoras
- Índices compuestos por categoría + texto.
- Paginación real (`page`, `pageSize`).
- Autenticación/roles para escritura.
- Tests y coverage.
