export class OrderAPI {
    client;
    constructor(client) {
        this.client = client;
    }
    listByUser(userId) {
        return this.client.get('/api/ordenes', { userId });
    }
    create(input) {
        return this.client.post('/api/ordenes', input);
    }
}
