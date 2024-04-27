import { FastifyReply, FastifyRequest } from "fastify";

export async function checkSessionIdExist(
  req: FastifyRequest,
  res: FastifyReply
) {
  const { sessionId } = req.cookies;
  if (!sessionId) {
    res.status(401).send({
      error: "Unauthorized.",
    });
    return;
  }
}
