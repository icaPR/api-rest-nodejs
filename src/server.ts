import fastify from "fastify";
import cookie from "@fastify/cookie";
import { transactions } from "./routes/transactions";

const app = fastify();

app.register(cookie);

app.register(transactions, { prefix: "transactions" });

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("HTTP Server Running!");
  });
