import axios, {AxiosInstance, AxiosResponse} from 'axios';

interface RestClientOptions {
    baseURL: string;
    timeoutM?: number;
    retries?: number;
}
//Wrapper de axios con mecanismos de reintentos ante fallos.
export class RestClient{
    private client: AxiosInstance;
    private retries: number;

    constructor(options: RestClientOptions){
        this.client = axios.create({
            baseURL: options.baseURL,
            timeout: options.timeoutM ?? 5000
        })
        this.retries =  options.retries ?? 2;
    }


    async get<T>(url: string, params?: Record<string, any>): Promise<T> {
        return this.withRetry<T>(() => this.client.get<any, AxiosResponse<T>>(url, { params }).then((r: AxiosResponse<T>) => r.data));
      }

    async post<T>(url: string, data?: any): Promise<T> {
        return this.withRetry<T>(() => this.client.post<any, AxiosResponse<T>>(url, data).then((r: AxiosResponse<T>) => r.data));
      }

    private async withRetry<T>(fn: () => Promise<T>, attempt = 0): Promise<T> {
        try {
          return await fn();
        } catch (err) {
          if (attempt < this.retries) {
            const delay = 200 * (attempt + 1);
            await new Promise(res => setTimeout(res, delay));
            return this.withRetry(fn, attempt + 1);
          }
          throw err;
        }

    }

}