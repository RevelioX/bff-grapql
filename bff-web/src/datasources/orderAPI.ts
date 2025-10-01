import {RestClient} from '../clients/restClient.js';
import {OrderDTO, CreateOrderInput} from '../types.js';

export class OrderAPI {
    constructor(private client: RestClient){}

    listByUser(userId: string): Promise<OrderDTO[]> {
        return this.client.get<OrderDTO[]>('api/ordenes', {userId});
    }

    create(input: CreateOrderInput): Promise<OrderDTO>{
        return this.client.post<OrderDTO>('api/ordenes', input);
    }
}