import express from 'express';
import { schema } from './schema.js';
import { createHandler } from 'graphql-http/lib/use/express';
import { rootResolver } from './resolvers.js';
import { RestClient } from './clients/restClient.js';
import { ProductAPI } from './datasources/productAPI.js';
import { OrderAPI } from './datasources/orderAPI.js';
// Simple request id generator (placeholder)
function reqId() {
    return Math.random().toString(36).substring(2, 10);
}
const app = express();
app.use(express.json());
// Health
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.use('/graphql', createHandler({
    schema,
    rootValue: rootResolver,
    context: (req, params) => {
        const productosBaseURL = process.env.REST_PRODUCTOS_URL || 'http://localhost:3001';
        const ordenesBaseURL = process.env.REST_ORDENES_URL || 'http://localhost:3002';
        const productClient = new RestClient({ baseURL: productosBaseURL });
        const orderClient = new RestClient({ baseURL: ordenesBaseURL });
        return {
            productAPI: new ProductAPI(productClient),
            orderAPI: new OrderAPI(orderClient),
            // userId: derivar de JWT (pendiente)
        };
    },
}));
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`[bff-web] listening on :${PORT}`);
});
