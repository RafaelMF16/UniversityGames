import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

export interface ApiRequestOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: QueryParams;
}

@Injectable({
  providedIn: 'root'
})
export class ApiRequestService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://127.0.0.1:8000/api/v1';

  get<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.get<T>(this.resolveUrl(endpoint), this.createOptions(options));
  }

  post<TResponse, TBody = unknown>(endpoint: string, body: TBody, options?: ApiRequestOptions): Observable<TResponse> {
    return this.http.post<TResponse>(this.resolveUrl(endpoint), body, this.createOptions(options));
  }

  put<TResponse, TBody = unknown>(endpoint: string, body: TBody, options?: ApiRequestOptions): Observable<TResponse> {
    return this.http.put<TResponse>(this.resolveUrl(endpoint), body, this.createOptions(options));
  }

  delete<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.delete<T>(this.resolveUrl(endpoint), this.createOptions(options));
  }

  private createOptions(options?: ApiRequestOptions) {
    return {
      headers: options?.headers,
      params: this.createHttpParams(options?.params)
    };
  }

  private createHttpParams(params?: QueryParams): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }

  private resolveUrl(endpoint: string): string {
    if (/^https?:\/\//i.test(endpoint) || !this.baseUrl) {
      return endpoint;
    }

    return `${this.baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  }
}
