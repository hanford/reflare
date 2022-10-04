export type onResponseCallback = (k: Response, url: string) => Response;
export type onRequestCallback = (k: Request, url: string) => Request;

export interface UpstreamOptions {
  domain: string;
  protocol?: 'http' | 'https';
  port?: number;
  timeout?: number;
  weight?: number;
  onRequest?: onRequestCallback | onRequestCallback[];
  onResponse?: onResponseCallback | onResponseCallback[];
}
