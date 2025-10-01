import express, {Request, Response, NextFunction} from "express";
import { schema } from "./schema.js";
import { createHandler } from "graphql-http/lib/use/express";
import {rootResolver} from "./resolvers.js";
import { RestClient } from './clients/restClient.js';
import { ProductAPI } from './datasources/productAPI.js';
import { OrderAPI } from './datasources/orderAPI.js';

const app = express();
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
    res.json({status: 'ok'})
})

app.use("/graphql", createHandler({
    schema,
    rootValue: rootResolver,
    context: (req, params) => {
        const productosBaseURL = process.env.REST_PRODUCTOS_URL || 'http://localhost:3001';
        const ordenesBaseURL = process.env.REST_ORDENES_URL || 'http://localhost:3002';

        const productClient = new RestClient({ baseURL: productosBaseURL });
        const orderClient = new RestClient({ baseURL: ordenesBaseURL });

        return {
            productAPI: new ProductAPI(productClient),
            orderAPI: new OrderAPI(orderClient)
        }
    }
}));


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[bff-web] listening on :${PORT}`);
});