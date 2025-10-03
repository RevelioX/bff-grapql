import express, { Request, Response, NextFunction } from "express";
import { auth } from "express-openid-connect";
import { schema } from "./schema.js";
import { createHandler } from "graphql-http/lib/use/express";
import { rootResolver } from "./resolvers.js";
import { RestClient } from './clients/restClient.js';
import { ProductAPI } from './datasources/productAPI.js';
import { OrderAPI } from './datasources/orderAPI.js';
import { jwtVerify, createRemoteJWKSet } from "jose";

const PORT = process.env.PORT || 4000;

// =======================
// Config de Auth0 SPA
// =======================
const authConfig = {
  authRequired: true, // Solo protege lo que necesites
  auth0Logout: true,
  baseURL: 'http://localhost:4000',
  clientID: 'hd3bNPytwrfZ65tjgmZn5PHRF1chvnz5',
  issuerBaseURL: 'https://dev-3spodgims268xc6l.us.auth0.com',
  secret: 'jwPnuGM7kFOxjvNahFuz3kqYT_B0QjJ50qV1BQGPVECbgcZTSgkNP0L9GRa3xVOE',
  authorizationParams: {
    scope: "openid profile email offline_access",
    audience: "bff-web-audience" // Aquí definís tu audiencia BFF
  },
  routes: {
    login: '/login',
    callback: '/callback',
    logout: 'logout'
  }
};

// =======================
// JWKS y validación JWT
// =======================
const JWKS = createRemoteJWKSet(new URL(`${authConfig.issuerBaseURL}/.well-known/jwks.json`));

async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: authConfig.issuerBaseURL,
      audience: authConfig.authorizationParams.audience
    });
    return payload.sub; // Este será tu userId
  } catch (err) {
    throw new Error("Access Token inválido o expirado");
  }
}

// Middleware para proteger rutas con Access Token
async function accessTokenMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No se proporcionó token' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const userId = await verifyAccessToken(token);
    (req as any).userId = userId;
    next();
  } catch (err: any) {
    res.status(401).json({ error: 'No autorizado', message: err.message });
  }
}

// =======================
// Inicializar Express
// =======================
const app = express();
app.use(express.json());
app.use(auth(authConfig)); // Middleware de login/session

// =======================
// Endpoints públicos
// =======================
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Mostrar Access Token decodificado
app.get("/show-token", accessTokenMiddleware, async (req: Request, res: Response) => {
  res.json({ userId: (req as any).userId });
});

// Callback de login (opcional, solo para mostrar info)
app.get("/callbackcito", (_req: Request, res: Response) => {
  res.send(`
    <h2>Login exitoso</h2>
    <p>Ahora tu SPA puede usar el Access Token para GraphQL</p>
  `);
});

// =======================
// GraphQL protegido
// =======================
app.use("/graphql", accessTokenMiddleware, createHandler({
  schema,
  rootValue: rootResolver,
  context: (req: any, _params: any) => {
    const productosBaseURL = process.env.REST_PRODUCTOS_URL || 'http://localhost:3001';
    const ordenesBaseURL = process.env.REST_ORDENES_URL || 'http://localhost:3002';

    const productClient = new RestClient({ baseURL: productosBaseURL });
    const orderClient = new RestClient({ baseURL: ordenesBaseURL });

    return {
      userId: req.userId,
      productAPI: new ProductAPI(productClient),
      orderAPI: new OrderAPI(orderClient)
    };
  }
}));

// =======================
// Iniciar servidor
// =======================
app.listen(PORT, () => {
  console.log(`[bff-web] listening on :${PORT}`);
});
