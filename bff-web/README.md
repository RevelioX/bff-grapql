<!-- AUTO-GENERATED TUTORIAL STYLE README -->

# ShopNest BFF-Web (GraphQL + Node.js + TypeScript)

Guía paso a paso para construir un Backend for Frontend (BFF) con GraphQL sobre microservicios REST (productos y órdenes). Incluye teoría esencial de GraphQL, explicación de cada archivo, y cómo probar la API (curl y Postman).

---
## 1. ¿Qué es un BFF y por qué GraphQL?
Un BFF actúa como capa adaptadora entre el frontend y múltiples backends/microservicios. Beneficios:
- Reduce overfetching/underfetching (el cliente pide exactamente lo que necesita).
- Centraliza políticas cross-cutting (auth, caching, rate limiting, logging).
- Aísla cambios internos de microservicios.

GraphQL aporta:
- Tipado fuerte: Schema como contrato único.
- Single endpoint (normalmente /graphql).
- Declaratividad: el cliente construye la forma de la respuesta.
- Evolución incremental (añadir campos sin romper clientes existentes).

Conceptos clave GraphQL:
- Schema Definition Language (SDL): declara tipos, queries y mutations.
- Query: operación de lectura (similar a GET conceptual, pero siempre POST normalmente).
- Mutation: operación que modifica estado (crear/actualizar/borrar).
- Resolver: función que retorna el valor de un campo del schema.
- Root / RootValue: objeto que mapea nombre de operación → función resolver.
- Context: objeto compartido por todos los resolvers de una petición (auth, dataSources, loaders, etc.).

---
## 2. Estructura final del proyecto
```
bff-web/
  package.json
  tsconfig.json
  Dockerfile
  .dockerignore
  .env.example
  src/
    server.ts              # Bootstrap Express + GraphQL handler
    schema.ts              # Definición SDL del schema GraphQL
    resolvers.ts           # Root resolvers (Query/Mutation)
    types.ts               # DTOs usados internamente
    clients/
      restClient.ts        # Cliente HTTP genérico con retries
    datasources/
      productAPI.ts        # Acceso a microservicio productos
      orderAPI.ts          # Acceso a microservicio órdenes
  README.md (este tutorial)
```

---
## 3. Paso a paso de implementación

### Paso 3.1: Inicializar proyecto Node + TypeScript
```bash
mkdir bff-web && cd bff-web
npm init -y
npm install express graphql graphql-http axios zod dotenv
npm install -D typescript ts-node-dev @types/node @types/express
npx tsc --init
```
Configura `tsconfig.json` (target moderno, outDir `dist`, strict true).

### Paso 3.2: Definir el Schema (`src/schema.ts`)
SDL con tipos Product, Order, queries y mutation:
```ts
import { buildSchema } from 'graphql';

export const schema = buildSchema(`
  type Product { _id: ID! nombre: String! descripcionCorta: String precio: Float! stock: Int! }
  type OrderItem { productId: ID! cantidad: Int! }
  type Order { _id: ID! userId: String! items: [OrderItem!]! total: Float! createdAt: String! }
  input CreateOrderItemInput { productId: ID! cantidad: Int! }
  input CreateOrderInput { userId: String! items: [CreateOrderItemInput!]! direccionEnvio: String }
  type Query { products(search: String): [Product!]! product(id: ID!): Product ordersByUser(userId: String!): [Order!]! }
  type Mutation { createOrder(input: CreateOrderInput!): Order! }
`);
```
Explicación: cada operación (products, product, ordersByUser, createOrder) será implementada por un resolver.

### Paso 3.3: DTOs y tipos internos (`src/types.ts`)
```ts
export interface ProductDTO { _id: string; nombre: string; descripcionCorta?: string; precio: number; stock: number; }
export interface OrderItemDTO { productId: string; cantidad: number; }
export interface OrderDTO { _id: string; userId: string; items: OrderItemDTO[]; total: number; createdAt: string; }
export interface CreateOrderInput { userId: string; items: { productId: string; cantidad: number }[]; direccionEnvio?: string; }
```
Propósito: formalizar la forma de los datos que vienen de los microservicios.

### Paso 3.4: Cliente REST genérico (`src/clients/restClient.ts`)
```ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
interface RestClientOptions { baseURL: string; timeoutMs?: number; retries?: number; }
export class RestClient { /* crea instancia axios y aplica retries exponenciales simples */ }
```
Razón: centralizar timeouts, retries y futuras mejoras (headers auth, tracing).

Código completo:
```ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
interface RestClientOptions { baseURL: string; timeoutMs?: number; retries?: number; }
export class RestClient { private client: AxiosInstance; private retries: number; constructor(o: RestClientOptions){ this.client = axios.create({ baseURL: o.baseURL, timeout: o.timeoutMs ?? 5000 }); this.retries = o.retries ?? 2; }
  async get<T>(url:string, params?:Record<string,any>):Promise<T>{ return this.withRetry(()=>this.client.get<any,AxiosResponse<T>>(url,{params}).then((r)=>r.data)); }
  async post<T>(url:string,data?:any):Promise<T>{ return this.withRetry(()=>this.client.post<any,AxiosResponse<T>>(url,data).then((r)=>r.data)); }
  private async withRetry<T>(fn:()=>Promise<T>, attempt=0):Promise<T>{ try { return await fn(); } catch(e){ if(attempt < this.retries){ await new Promise(r=>setTimeout(r,200*(attempt+1))); return this.withRetry(fn,attempt+1);} throw e; } }
}
```

### Paso 3.5: DataSources (`datasources/productAPI.ts`, `datasources/orderAPI.ts`)
Encapsulan endpoints REST y ocultan rutas concretas al resto del BFF.
```ts
export class ProductAPI { constructor(private client: RestClient){} list(search?:string){ return this.client.get('/api/productos', search?{search}:undefined);} get(id:string){ return this.client.get(`/api/productos/${id}`);} }
```
```ts
export class OrderAPI { constructor(private client: RestClient){} listByUser(userId:string){ return this.client.get('/api/ordenes',{userId}); } create(input:CreateOrderInput){ return this.client.post('/api/ordenes', input); } }
```

### Paso 3.6: Resolvers root (`src/resolvers.ts`)
Mapean nombres del schema a funciones que llaman a DataSources.
```ts
export const rootResolver = {
  products: (args,{productAPI}) => productAPI.list(args.search),
  product: (args,{productAPI}) => productAPI.get(args.id),
  ordersByUser: (args,{orderAPI}) => orderAPI.listByUser(args.userId),
  createOrder: (args,{orderAPI,userId}) => { if(userId && userId!==args.input.userId) throw new Error('FORBIDDEN_USER_MISMATCH'); return orderAPI.create(args.input); }
};
```
Nota: future place para auth real (JWT → context.userId).

### Paso 3.7: Servidor Express + GraphQL (`src/server.ts`)
Responsable de:
- Crear app Express
- Inyectar dataSources en el contexto por request
- Exponer /health y /graphql
```ts
import express from 'express';
import { schema } from './schema.js';
import { createHandler } from 'graphql-http/lib/use/express';
import { rootResolver } from './resolvers.js';
import { RestClient } from './clients/restClient.js';
import { ProductAPI } from './datasources/productAPI.js';
import { OrderAPI } from './datasources/orderAPI.js';
const app = express();
app.use(express.json());
app.get('/health', (_req,res)=>res.json({status:'ok'}));
app.use('/graphql',(req,_res,next)=>{
  const productosBaseURL=process.env.REST_PRODUCTOS_URL||'http://localhost:3001';
  const ordenesBaseURL=process.env.REST_ORDENES_URL||'http://localhost:3002';
  const productClient=new RestClient({baseURL:productosBaseURL});
  const orderClient=new RestClient({baseURL:ordenesBaseURL});
  (req as any).context={ productAPI:new ProductAPI(productClient), orderAPI:new OrderAPI(orderClient) };
  next();
});
app.use('/graphql', createHandler({ schema, rootValue: rootResolver, context: (req)=> (req as any).context }));
app.listen(process.env.PORT||4000,()=> console.log('[bff-web] listening on :'+(process.env.PORT||4000))); 
```

### Paso 3.8: Variables de entorno (.env.example)
```env
PORT=4000
REST_PRODUCTOS_URL=http://localhost:3001
REST_ORDENES_URL=http://localhost:3002
```
Futuras (Auth0) se añadirán después.

### Paso 3.9: Scripts NPM (`package.json` relevante)
```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
  "build": "tsc -p .",
  "start": "node dist/server.js"
}
```

### Paso 3.10: Dockerfile (multi-stage)
```Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN if [ -f package-lock.json ]; then npm ci; \
  elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
  else npm install; fi

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

---
## 4. Esquema GraphQL completo (SDL)
```graphql
type Product { _id: ID! nombre: String! descripcionCorta: String precio: Float! stock: Int! }
type OrderItem { productId: ID! cantidad: Int! }
type Order { _id: ID! userId: String! items: [OrderItem!]! total: Float! createdAt: String! }
input CreateOrderItemInput { productId: ID! cantidad: Int! }
input CreateOrderInput { userId: String! items: [CreateOrderItemInput!]! direccionEnvio: String }
type Query { products(search: String): [Product!]! product(id: ID!): Product ordersByUser(userId: String!): [Order!]! }
type Mutation { createOrder(input: CreateOrderInput!): Order! }
```

---
## 5. Ejecución local
```bash
cp .env.example .env
npm install
npm run dev
# POST a http://localhost:4000/graphql
```
Si usas los microservicios en Docker Compose, levanta todo desde la raíz.

---
## 6. Ejemplos de operaciones
### Query: Listar productos
```json
{ "query": "{ products { _id nombre precio stock } }" }
```
### Query: Buscar productos (variable)
```json
{ "query": "query($q:String){ products(search:$q){ _id nombre precio } }", "variables": { "q": "mouse" } }
```
### Query: Producto por id
```json
{ "query": "query($id:ID!){ product(id:$id){ _id nombre precio } }", "variables": { "id": "<ID>" } }
```
### Mutation: Crear orden
```json
{ "query": "mutation($input:CreateOrderInput!){ createOrder(input:$input){ _id total items { productId cantidad } } }", "variables": { "input": { "userId": "user-123", "items": [{ "productId": "<ID_PRODUCTO>", "cantidad": 2 }], "direccionEnvio": "Calle Falsa 123" } } }
```
### Query: Órdenes por usuario
```json
{ "query": "query($u:String!){ ordersByUser(userId:$u){ _id total createdAt } }", "variables": { "u": "user-123" } }
```

---
## 7. Uso con curl

### 7.1. Health Check
```bash
curl -X GET http://localhost:4000/health
```

### 7.2. Introspección del Schema
```bash
curl -X POST http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"query { __schema { types { name } } }"}'
```

### 7.3. Consultar todos los productos
```bash
curl -X POST http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"query { products { _id nombre descripcionCorta precio stock } }"}'
```

### 7.4. Consultar un producto específico
```bash
curl -X POST http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"query { product(id: \"PRODUCT_ID_HERE\") { _id nombre descripcionCorta precio stock } }"}'
```

### 7.5. Buscar productos con filtro
```bash
curl -X POST http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"query { products(search: \"Producto\") { _id nombre descripcionCorta precio stock } }"}'
```

### 7.6. Crear una orden
```bash
curl -X POST http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "mutation { createOrder(input: { userId: \"user123\", items: [{ productId: \"PRODUCT_ID_HERE\", cantidad: 2 }], direccionEnvio: \"Calle 123, Ciudad\" }) { _id userId total createdAt } }"
  }'
```

### 7.7. Consultar órdenes de un usuario
```bash
curl -X POST http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"query { ordersByUser(userId: \"user123\") { _id userId total createdAt items { productId cantidad } } }"}'
```

### 7.8. Query con variables (recomendado para producción)
```bash
curl -X POST http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "query GetProductById($productId: ID!) { product(id: $productId) { _id nombre descripcionCorta precio stock } }",
    "variables": { "productId": "PRODUCT_ID_HERE" }
  }'
```

### 7.9. Mutation con variables
```bash
curl -X POST http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "mutation CreateOrder($input: CreateOrderInput!) { createOrder(input: $input) { _id userId total createdAt items { productId cantidad } } }",
    "variables": {
      "input": {
        "userId": "user123",
        "items": [
          { "productId": "PRODUCT_ID_HERE", "cantidad": 2 }
        ],
        "direccionEnvio": "Calle 123, Ciudad"
      }
    }
  }'
```

### 7.10. Ejemplo completo paso a paso

1. **Primero crear un producto** (usando el servicio REST directamente):
```bash
curl -X POST http://localhost:3001/api/productos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Laptop Gaming",
    "descripcionCorta": "Laptop para gaming de alta gama",
    "descripcionLarga": "Laptop con procesador Intel i7, 16GB RAM, tarjeta gráfica RTX 4060",
    "precio": 1299.99,
    "stock": 5,
    "categoria": "Electrónicos"
  }'
```

2. **Consultar productos desde GraphQL**:
```bash
curl -X POST http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"query { products { _id nombre descripcionCorta precio stock } }"}'
```

3. **Crear una orden usando el ID del producto**:
```bash
curl -X POST http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "mutation { createOrder(input: { userId: \"user123\", items: [{ productId: \"USE_PRODUCT_ID_FROM_STEP_2\", cantidad: 1 }], direccionEnvio: \"Av. Córdoba 123, Buenos Aires\" }) { _id userId total createdAt } }"
  }'
```

4. **Verificar las órdenes del usuario**:
```bash
curl -X POST http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"query { ordersByUser(userId: \"user123\") { _id userId total createdAt items { productId cantidad } } }"}'
```

---
## 8. Uso con Postman
1. Crear nueva petición: método POST, URL `http://localhost:4000/graphql`.
2. Header: `Content-Type: application/json`.
3. Body (raw / JSON):
```json
{ "query": "{ products { _id nombre precio } }" }
```
4. Para variables, estructura:
```json
{ "query": "query($q:String){ products(search:$q){ _id nombre } }", "variables": { "q": "monitor" } }
```
5. Guardar en una Collection para reutilizar.
6. (Opcional futuro) Añadir header Authorization Bearer <token> una vez integrada la autenticación.

Exportar Collection: Postman → Save → Export. Puede versionarse en `postman/`.

---
## 9. Buenas prácticas (resumen)
- Colocar lógica de acceso a REST en dataSources, no dentro de resolvers.
- Context liviano: solo instancias necesarias por request.
- Manejo de errores consistente → mapear a GraphQL error codes (pendiente).
- Añadir caching y DataLoader para N+1 queries futuras.

---
## 10. Próximos pasos
Ver también `NEXT_STEPS.md`:
- Autenticación JWT (middleware) + userId en context.
- DataLoader para detalles de productos dentro de órdenes.
- Normalización de errores (extensions.code).
- Metrics y logging estructurado.
- Circuit breaker / timeouts configurables.

---
## 11. FAQ rápida
¿Por qué un solo resolver objeto (rootResolver)?  Para simplicidad inicial; se puede migrar a un esquema modular (por tipo) fácilmente.

¿Por qué buildSchema en vez de graphql-tools? Suficiente para un MVP; graphql-tools facilita modularización y stitching si crece.

¿Cómo versiono el schema? Exporta el SDL a un archivo `.graphql` y manten un changelog semántico (additive = minor, breaking = major).

---
## 12. Referencias
- https://graphql.org/learn/
- https://spec.graphql.org/
- Patrones BFF: https://martinfowler.com/articles/bff.html

---
Fin del tutorial.
