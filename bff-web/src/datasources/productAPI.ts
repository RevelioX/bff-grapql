import { RestClient } from '../clients/restClient.js';
import { ProductDTO } from '../types.js';

export class ProductAPI { 
    constructor(private client: RestClient) {}

    list(search?: string): Promise<ProductDTO[]> {
        return this.client.get<ProductDTO[]>('api/productos', search ? { search } : undefined );
    }

    get(id: string): Promise<ProductDTO | null> {
        return this.client.get<ProductDTO>(`/api/productos/${id}`);
    }
}