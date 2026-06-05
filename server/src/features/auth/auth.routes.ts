import { auth } from "../../config/auth.js";
import { FastifyInstance } from "fastify";

export async function authRoutes(app: FastifyInstance) {
  app.get("/session-token", async (request, reply) => {
    const token =
      request.cookies["better-auth.session_token"] ||
      request.cookies["__Secure-better-auth.session_token"];

    if (!token) {
      return reply.status(401).send({ error: "No session token found in cookies" });
    }

    return { sessionToken: token };
  });

  app.all("/*", async (request, reply) => {
    // When behind a reverse proxy (like Vercel rewrites), the protocol and host headers must be trusted.
    const proto = (request.headers["x-forwarded-proto"] as string) || request.protocol;
    const host = (request.headers["x-forwarded-host"] as string) || request.headers.host || request.hostname;
    
    const url = `${proto}://${host}${request.url}`;
    
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