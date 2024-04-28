import { expect, it, beforeAll, afterAll, describe } from "vitest";
import request from "supertest";
import { app } from "../app";

describe("Transactions routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
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
        .set("Cookie", cookies);

      expect(listTransactionsResponse.body.transactions).toEqual([
        expect.objectContaining({
          id: expect.any(String),
          title: "New transaction",
          amount: 100,
        }),
      ]);
    }
  });
});
