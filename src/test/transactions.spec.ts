import { expect, it, beforeAll, afterAll, describe, beforeEach } from "vitest";
import { execSync } from "node:child_process";
import request from "supertest";
import { app } from "../app";

describe("Transactions routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should create a new transaction", async () => {
    const response = await request(app.server).post("/transactions").send({
      title: "New transaction",
      amount: 100,
      type: "credit",
    });

    expect(response.statusCode).toBe(201);
  });

  it("should list all transactions", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 100,
        type: "credit",
      });
    const cookies = createTransactionResponse.get("Set-Cookie");

    if (cookies) {
      const listTransactionsResponse = await request(app.server)
        .get("/transactions")
        .set("Cookie", cookies)
        .expect(200);

      expect(listTransactionsResponse.body.transactions).toEqual([
        expect.objectContaining({
          id: expect.any(String),
          title: "New transaction",
          amount: 100,
        }),
      ]);
    }
  });

  it("should be able to get a specific transaction", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 100,
        type: "credit",
      });
    const cookies = createTransactionResponse.get("Set-Cookie");

    if (cookies) {
      const listTransactionsResponse = await request(app.server)
        .get("/transactions")
        .set("Cookie", cookies)
        .expect(200);

      const transactionId = listTransactionsResponse.body.transactions[0].id;

      const listTransactionsByIdResponse = await request(app.server)
        .get(`/transactions/${transactionId}`)
        .set("Cookie", cookies)
        .expect(200);
      expect(listTransactionsByIdResponse.body.transactions).toEqual(
        expect.objectContaining({
          title: "New transaction",
          amount: 100,
        })
      );
    }
  });
});
