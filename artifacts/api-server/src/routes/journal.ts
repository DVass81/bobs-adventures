import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, journalEntriesTable, locationsTable } from "@workspace/db";
import {
  CreateJournalEntryBody,
  UpdateJournalEntryBody,
  GetJournalEntryParams,
  UpdateJournalEntryParams,
  DeleteJournalEntryParams,
  ListJournalEntriesQueryParams,
  ListJournalEntriesResponse,
  GetJournalEntryResponse,
  UpdateJournalEntryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/journal", async (req, res): Promise<void> => {
  const query = ListJournalEntriesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const results = await db
    .select({
      id: journalEntriesTable.id,
      title: journalEntriesTable.title,
      content: journalEntriesTable.content,
      mood: journalEntriesTable.mood,
      locationId: journalEntriesTable.locationId,
      locationName: locationsTable.name,
      visitDate: journalEntriesTable.visitDate,
      createdAt: journalEntriesTable.createdAt,
      updatedAt: journalEntriesTable.updatedAt,
    })
    .from(journalEntriesTable)
    .leftJoin(locationsTable, eq(journalEntriesTable.locationId, locationsTable.id))
    .orderBy(journalEntriesTable.visitDate);

  const filtered = query.data.location_id
    ? results.filter(r => r.locationId === query.data.location_id)
    : results;

  res.json(ListJournalEntriesResponse.parse(filtered));
});

router.post("/journal", async (req, res): Promise<void> => {
  const parsed = CreateJournalEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [entry] = await db.insert(journalEntriesTable).values(parsed.data).returning();

  let locationName = null;
  if (entry.locationId) {
    const [loc] = await db.select().from(locationsTable).where(eq(locationsTable.id, entry.locationId));
    locationName = loc?.name ?? null;
  }

  res.status(201).json(GetJournalEntryResponse.parse({ ...entry, locationName }));
});

router.get("/journal/:id", async (req, res): Promise<void> => {
  const params = GetJournalEntryParams.safeParse({ id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [entry] = await db
    .select({
      id: journalEntriesTable.id,
      title: journalEntriesTable.title,
      content: journalEntriesTable.content,
      mood: journalEntriesTable.mood,
      locationId: journalEntriesTable.locationId,
      locationName: locationsTable.name,
      visitDate: journalEntriesTable.visitDate,
      createdAt: journalEntriesTable.createdAt,
      updatedAt: journalEntriesTable.updatedAt,
    })
    .from(journalEntriesTable)
    .leftJoin(locationsTable, eq(journalEntriesTable.locationId, locationsTable.id))
    .where(eq(journalEntriesTable.id, params.data.id));

  if (!entry) {
    res.status(404).json({ error: "Journal entry not found" });
    return;
  }

  res.json(GetJournalEntryResponse.parse(entry));
});

router.patch("/journal/:id", async (req, res): Promise<void> => {
  const params = UpdateJournalEntryParams.safeParse({ id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateJournalEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [entry] = await db.update(journalEntriesTable).set(parsed.data).where(eq(journalEntriesTable.id, params.data.id)).returning();
  if (!entry) {
    res.status(404).json({ error: "Journal entry not found" });
    return;
  }

  let locationName = null;
  if (entry.locationId) {
    const [loc] = await db.select().from(locationsTable).where(eq(locationsTable.id, entry.locationId));
    locationName = loc?.name ?? null;
  }

  res.json(UpdateJournalEntryResponse.parse({ ...entry, locationName }));
});

router.delete("/journal/:id", async (req, res): Promise<void> => {
  const params = DeleteJournalEntryParams.safeParse({ id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [entry] = await db.delete(journalEntriesTable).where(eq(journalEntriesTable.id, params.data.id)).returning();
  if (!entry) {
    res.status(404).json({ error: "Journal entry not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
