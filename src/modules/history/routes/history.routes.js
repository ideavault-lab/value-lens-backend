import {
  getHistoryForUser,
  getHistoryEntry,
  deleteHistoryEntry,
} from "../services/history.service.js";

export default async function historyRoutes(app) {
  // All history routes require an authenticated user
  app.addHook("preHandler", app.requireAuth);

  // GET /history?limit=20&skip=0
  app.get("/", async (req, reply) => {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = Number(req.query.skip) || 0;

    const { items, total } = await getHistoryForUser(req.user.id, { limit, skip });

    return reply.send({ success: true, total, items });
  });

  // GET /history/:id
  app.get("/:id", async (req, reply) => {
    const entry = await getHistoryEntry(req.user.id, req.params.id);

    if (!entry) {
      return reply.code(404).send({ success: false, message: "History entry not found" });
    }

    return reply.send({ success: true, item: entry });
  });

  // DELETE /history/:id
  app.delete("/:id", async (req, reply) => {
    const deleted = await deleteHistoryEntry(req.user.id, req.params.id);

    if (!deleted) {
      return reply.code(404).send({ success: false, message: "History entry not found" });
    }

    return reply.send({ success: true, message: "Deleted" });
  });
}