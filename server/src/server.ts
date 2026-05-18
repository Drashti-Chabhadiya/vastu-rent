import { app } from "./app.js"; 
import { connectPrisma } from "./config/prisma.js";
import awsLambdaFastify from "@fastify/aws-lambda";

let proxy: any;

export const handler = async (event: any, context: any) => {
  if (!proxy) {
    await connectPrisma();
    proxy = awsLambdaFastify(app);
  }
  return proxy(event, context);
};

if (process.env.NODE_ENV !== "production") {
  const start = async () => {
    try {
      await connectPrisma();
      await app.listen({ port: 4000, host: "0.0.0.0" });
      console.log("🚀 Local server running on http://localhost:4000");
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  };
  start();
}

export default async (req: any, res: any) => {
  await app.ready();
  app.server.emit('request', req, res);
};
