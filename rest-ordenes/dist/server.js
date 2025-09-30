import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { connectMongo } from './config/db.js';
import orderRoutes from './routes/orderRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/ordenes', orderRoutes);
app.use(errorHandler);
const PORT = Number(process.env.PORT) || 3002;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopnest_ordenes';
async function bootstrap() {
    await connectMongo(MONGODB_URI);
    app.listen(PORT, () => console.log(`rest-ordenes escuchando en puerto ${PORT}`));
}
bootstrap().catch(err => {
    console.error('Fallo al iniciar la aplicación', err);
    process.exit(1);
});
