import axios from 'axios';
export class RestClient {
    client;
    retries;
    constructor(options) {
        this.client = axios.create({
            baseURL: options.baseURL,
            timeout: options.timeoutMs ?? 5000,
        });
        this.retries = options.retries ?? 2;
    }
    async get(url, params) {
        return this.withRetry(() => this.client.get(url, { params }).then((r) => r.data));
    }
    async post(url, data) {
        return this.withRetry(() => this.client.post(url, data).then((r) => r.data));
    }
    async withRetry(fn, attempt = 0) {
        try {
            return await fn();
        }
        catch (err) {
            if (attempt < this.retries) {
                const delay = 200 * (attempt + 1);
                await new Promise(res => setTimeout(res, delay));
                return this.withRetry(fn, attempt + 1);
            }
            throw err;
        }
    }
}
