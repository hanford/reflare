import { Route } from '.';
import { UpstreamOptions } from './middlewares/upstream';

export interface Context {
  route: Route;
  hostname: string;
  request: Request;
  response: Response;
  upstream: UpstreamOptions | null;
  onRequest?: (request: Request, url: string) => Request;
  onResponse?: (response: Response, url: string) => Response;
}

export type Middleware = (
  context: Context,
  next: () => Promise<void | null> | void | null,
) => Promise<void | null> | void | null;

export interface Pipeline {
  push: (...middlewares: Middleware[]) => void | null;
  execute: (context: Context) => Promise<void | null>;
}
