# Futuras Mejoras (Roadmap sugerido)

## Seguridad
- Validar Access Token JWT (Auth0) en cada request GraphQL (middleware Express).
- Diferenciar scopes/roles para queries sensibles (p.ej. órdenes de otros usuarios sólo para ROLE_ADMIN).
- Implementar flujo Client Credentials para upstream y propagar Bearer token a microservicios.

## Resiliencia
- Timeouts configurables (axios) + abort controller.
- Retries exponenciales y circuit breaker (biblioteca como opossum).
- Bulkhead: limitar concurrencia hacia cada servicio.

## Performance
- DataLoader para batch de productos por id.
- Cache in-memory (TTL corto) para listados de productos con mismo search.
- ETags condicionales si backend REST los expone (a futuro).

## Observabilidad
- requestId (header x-request-id entrante o generado) y propagación.
- Logs JSON (pino) + niveles configurables.
- Métricas Prometheus (histogramas de latencia por operación GraphQL) /health separado de /metrics.

## DX / Calidad
- Tests unitarios de resolvers (mocks de APIs).
- Tests contract (pacto) BFF ↔ servicios REST.
- ESLint + Prettier en pre-commit (husky).

## Esquema / Dominios
- Añadir paginación en products (cursor o offset) para grandes catálogos.
- Enriquecer Order con detalles de productos (hydration interna en BFF).
- Mutations para actualizar stock (seguras) con control de concurrencia.

## Seguridad avanzada
- Rate limiting por API Key / userId en capa BFF.
- WAF / protección básica (helmet ya incluido, falta endurecer CSP cuando haya frontend).

## Infra / Deploy
- Build multi-stage ya presente; agregar scanning (Trivy) en CI.
- Terraform para infraestructura (ECR, ECS Fargate, Secrets Manager). 
- Canary releases (feature flags) para nuevos campos GraphQL.

## Errores
- Mapa de errores interno → GraphQL extensions.code estandarizado (NOT_FOUND, UPSTREAM_TIMEOUT, VALIDATION_ERROR, FORBIDDEN, etc.).
- Redacción segura (no filtrar detalles internos).

## Accesibilidad de cambios de esquema
- Publicar schema SDL en endpoint /schema.graphql para tooling.
- Versionado semántico del schema (changelog). 

---
Este roadmap puede priorizarse según objetivos académicos: sugerido comenzar por autenticación JWT, DataLoader y normalización de errores.