export class ProductAPI {
    client;
    constructor(client) {
        this.client = client;
    }
    list(search) {
        return this.client.get('/api/productos', search ? { search } : undefined);
    }
    get(id) {
        return this.client.get(`/api/productos/${id}`);
    }
}
