import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { checkSessionIdExist } from "../middlewares/check-session-id-exist";

export async function transactions(app: FastifyInstance) {
  app.get("/", { preHandler: [checkSessionIdExist] }, async (req) => {
    const sessionId = req.cookies.sessionId;

    const transactions = await knex("transactions")
      .where("session_id", sessionId)
      .select();
    return { transactions };
  });

  app.get("/:id", { preHandler: [checkSessionIdExist] }, async (req) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = getTransactionParamsSchema.parse(req.params);
    const sessionId = req.cookies.sessionId;

    const transactions = await knex("transactions")
      .where({ id, session_id: sessionId })
      .first();

    return { transactions };
  });

  app.get(
    "/summary",
    { preHandler: [checkSessionIdExist] },
    async (req, res) => {
      const sessionId = req.cookies.sessionId;
      const summary = await knex("transactions")
        .sum("amount", { as: "amount" })
        .where("session_id", sessionId)
        .first();

      return { summary };
    }
  );

  app.post("/", async (req, res) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const body = createTransactionBodySchema.parse(req.body);

    let sessionId = req.cookies.sessionId;
    if (!sessionId) {
      sessionId = randomUUID();

      res.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      });
    }
    await knex("transactions").insert({
      id: randomUUID(),
      title: body.title,
      amount: body.type === "credit" ? body.amount : body.amount * -1,
      session_id: sessionId,
    });

    return res.status(201).send();
  });
}
