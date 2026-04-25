import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, locationsTable } from "@workspace/db";
import {
  CreateLocationBody,
  UpdateLocationBody,
  GetLocationParams,
  UpdateLocationParams,
  DeleteLocationParams,
  ListLocationsResponse,
  GetLocationResponse,
  UpdateLocationResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/locations", async (req, res): Promise<void> => {
  const locations = await db.select().from(locationsTable).orderBy(locationsTable.createdAt);
  res.json(ListLocationsResponse.parse(locations.map(l => ({ ...l, arrivalDate: l.arrivalDate ?? null, departureDate: l.departureDate ?? null }))));
});

router.post("/locations", async (req, res): Promise<void> => {
  const parsed = CreateLocationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [location] = await db.insert(locationsTable).values(parsed.data).returning();
  res.status(201).json(GetLocationResponse.parse(location));
});

router.get("/locations/:id", async (req, res): Promise<void> => {
  const params = GetLocationParams.safeParse({ id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [location] = await db.select().from(locationsTable).where(eq(locationsTable.id, params.data.id));
  if (!location) {
    res.status(404).json({ error: "Location not found" });
    return;
  }
  res.json(GetLocationResponse.parse(location));
});

router.patch("/locations/:id", async (req, res): Promise<void> => {
  const params = UpdateLocationParams.safeParse({ id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateLocationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [location] = await db.update(locationsTable).set(parsed.data).where(eq(locationsTable.id, params.data.id)).returning();
  if (!location) {
    res.status(404).json({ error: "Location not found" });
    return;
  }
  res.json(UpdateLocationResponse.parse(location));
});

router.delete("/locations/:id", async (req, res): Promise<void> => {
  const params = DeleteLocationParams.safeParse({ id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [location] = await db.delete(locationsTable).where(eq(locationsTable.id, params.data.id)).returning();
  if (!location) {
    res.status(404).json({ error: "Location not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
