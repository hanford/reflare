import { Middleware } from '../../types/middleware';
import { UpstreamOptions, onResponseCallback, onRequestCallback } from '../../types/middlewares/upstream';

export const cloneRequest = (
  url: string,
  request: Request,
): Request => {
  const requestInit: CfRequestInit = {
    body: request.body,
    method: request.method,
    headers: request.headers,
  };
  return new Request(url, requestInit);
};

export const getURL = (
  url: string,
  upstream: UpstreamOptions,
): string => {
  const cloneURL = new URL(url);
  const {
    domain,
    port,
    protocol,
  } = upstream;

  cloneURL.hostname = domain;

  if (protocol !== undefined) {
    cloneURL.protocol = `${protocol}:`;
  }

  if (port === undefined) {
    cloneURL.port = '';
  } else {
    cloneURL.port = port.toString();
  }

  return cloneURL.href;
};

/**
 * The `useUpstream` middleware sents the request to the upstream and captures
 * the response.
 * @param context - The context of the middleware pipeline
 * @param next - The function to invoke the next middleware in the pipeline
 */
export const useUpstream: Middleware = async (
  context,
  next,
) => {
  const { request, upstream } = context;

  if (upstream === null) {
    await next();
    return;
  }

  const url = getURL(
    request.url,
    upstream,
  );

  const onRequest: onRequestCallback[] | null = upstream.onRequest
    ? Array.isArray(upstream.onRequest)
      ? upstream.onRequest
      : [upstream.onRequest]
    : null;

  const onResponse: onResponseCallback[] | null = upstream.onResponse
    ? Array.isArray(upstream.onResponse)
      ? upstream.onResponse
      : [upstream.onResponse]
    : null;

    if (onRequest) {
      upstreamRequest = onRequest.reduce(
        (prevReq: Request, fn: onRequestCallback) => fn(cloneRequest(url, prevReq), url),
        upstreamRequest,
      );
    }

  context.response = await fetch(upstreamRequest);

  if (onResponse) {
    context.response = onResponse.reduce(
      (prevRes: Response, fn: onResponseCallback) => fn(new Response(prevRes.body, prevRes), url),
      new Response(context.response.body, context.response),
    );
  }

  await next();
};
