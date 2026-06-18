import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CreateAxiosDefaults,
} from "axios";

export type HttpRequestConfig = Pick<
  AxiosRequestConfig,
  "headers" | "params" | "signal"
>;

export interface HttpClient {
  get<TResponse>(
    url: string,
    config?: HttpRequestConfig,
  ): Promise<TResponse>;
}

export class AxiosHttpClientAdapter implements HttpClient {
  constructor(private readonly client: AxiosInstance) {}

  async get<TResponse>(
    url: string,
    config?: HttpRequestConfig,
  ): Promise<TResponse> {
    const response = await this.client.get<TResponse>(url, config);
    return response.data;
  }
}

export class ApiClientFactory {
  static create(baseURL: string, config?: CreateAxiosDefaults): HttpClient {
    return new AxiosHttpClientAdapter(
      axios.create({
        baseURL,
        timeout: 10_000,
        ...config,
      }),
    );
  }
}

export class ApiClientSingleton {
  private static instance: HttpClient | null = null;

  static getInstance(baseURL: string): HttpClient {
    if (ApiClientSingleton.instance === null) {
      ApiClientSingleton.instance = ApiClientFactory.create(baseURL);
    }

    return ApiClientSingleton.instance;
  }
}
