import { auth } from "../config/auth.js";
import { FastifyInstance } from "fastify";

export async function authRoutes(app: FastifyInstance) {
  app.all("/*", async (request, reply) => {
    // When behind a reverse proxy (like Vercel rewrites), the protocol and host headers must be trusted.
    const proto = (request.headers["x-forwarded-proto"] as string) || request.protocol;
    const host = (request.headers["x-forwarded-host"] as string) || request.headers.host || request.hostname;
    
    let url = `${proto}://${host}${request.url}`;
    
    // Better Auth expects the request URL to match BETTER_AUTH_URL in production.
    if (process.env.BETTER_AUTH_URL) {
      try {
        const parsedBase = new URL(process.env.BETTER_AUTH_URL);
        url = `${parsedBase.origin}${request.url}`;
      } catch (e) {
        // Ignore parsing errors and fallback to header-based URL
      }
    }
    
    // Convert Fastify body to a string payload for the Web Standard Request
    let body = undefined;
    if (request.method !== "GET" && request.method !== "HEAD" && request.body) {
      body = typeof request.body === "string" ? request.body : JSON.stringify(request.body);
    }

    const req = new Request(url, {
      method: request.method,
      headers: request.headers as any,
      body,
    });

    const response = await auth.handler(req);
    
    reply.status(response.status);
    response.headers.forEach((value: any, key: any) => {
      reply.header(key, value);
    });
    
    return reply.send(await response.text());
  });
}