
﻿# Servicio REST Órdenes

Microservicio de gestión de órdenes para ShopNest.

## Endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Healthcheck |
| GET | `/api/ordenes` | Lista de órdenes (opcional `?userId=`) |
| GET | `/api/ordenes/:id` | Detalle de una orden |
| POST | `/api/ordenes` | Crea una nueva orden |

### Modelo `Order`
```json
{
   "_id": "ObjectId",
   "userId": "string",
   "items": [ { "productId": "string", "cantidad": 1 } ],
   "direccionEnvio": "string?",
   "total": 123.45,
   "createdAt": "ISO",
   "updatedAt": "ISO"
}
```

### POST /api/ordenes (payload)
```json
{
   "userId": "user-123",
   "items": [ { "productId": "prod-1", "cantidad": 2 } ],
   "direccionEnvio": "Calle Falsa 123"
}
```

## Validaciones
- `items` no vacío.
- `cantidad` > 0.
- Calcula `total` de forma dummy (100 por item) — reemplazar en escenarios reales.

## Variables de Entorno (`.env`)
```
PORT=3002
MONGODB_URI=mongodb://localhost:27017/shopnest_ordenes
LOG_LEVEL=info
REQUEST_TIMEOUT_MS=3000
```

## Desarrollo Local
```bash
npm install
npm run dev
# http://localhost:3002/health
```

## Build y Run (Node)
```bash
npm run build
npm start
```

---

## Docker
### Build
```bash
docker build -t rest-ordenes:local .
```
### Run (requiere Mongo local)
```bash
docker run --name mongo -p 27017:27017 -d mongo:6

docker run --env MONGODB_URI=mongodb://host.docker.internal:27017/shopnest_ordenes \
   -p 3002:3002 rest-ordenes:local
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
   rest-ordenes:
      build: .
      environment:
         - MONGODB_URI=mongodb://mongo:27017/shopnest_ordenes
      ports:
         - "3002:3002"
      depends_on:
         - mongo
YAML

docker compose up --build
```

---

## Pruebas con curl
### Health
```bash
curl -s http://localhost:3002/health | jq
```

### Crear orden
```bash
curl -s -X POST http://localhost:3002/api/ordenes \
   -H 'Content-Type: application/json' \
   -d '{"userId":"user-1","items":[{"productId":"p1","cantidad":2}],"direccionEnvio":"Av Siempre Viva"}' | jq
```

### Listar órdenes
```bash
curl -s http://localhost:3002/api/ordenes | jq
```

### Listar órdenes de un usuario
```bash
curl -s "http://localhost:3002/api/ordenes?userId=user-1" | jq
```

### Obtener detalle
```bash
ORDER_ID="<reemplazar>"
curl -s http://localhost:3002/api/ordenes/$ORDER_ID | jq
```

## Estructura del Proyecto
```
rest-ordenes/
   src/
      config/db.ts
      controllers/orderController.ts
      middleware/errorHandler.ts
      models/Order.ts
      routes/orderRoutes.ts
      services/orderService.ts
      validators/orderSchemas.ts
      server.ts
   Dockerfile
   .dockerignore
   package.json
   tsconfig.json
   .env.example
   README.md
```

## Futuras Mejoras
- Integrar precios reales desde servicio de productos.
- Añadir autenticación/autorization.
- Tests unitarios e integración.
- Manejo de paginación y filtros.
