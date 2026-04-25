import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, photosTable, locationsTable } from "@workspace/db";
import {
  CreatePhotoBody,
  DeletePhotoParams,
  ListPhotosQueryParams,
  ListPhotosResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/photos", async (req, res): Promise<void> => {
  const query = ListPhotosQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const results = await db
    .select({
      id: photosTable.id,
      url: photosTable.url,
      caption: photosTable.caption,
      journalId: photosTable.journalId,
      locationId: photosTable.locationId,
      locationName: locationsTable.name,
      takenAt: photosTable.takenAt,
      createdAt: photosTable.createdAt,
    })
    .from(photosTable)
    .leftJoin(locationsTable, eq(photosTable.locationId, locationsTable.id))
    .orderBy(photosTable.takenAt);

  let filtered = results;
  if (query.data.journal_id != null) {
    filtered = filtered.filter(p => p.journalId === query.data.journal_id);
  }
  if (query.data.location_id != null) {
    filtered = filtered.filter(p => p.locationId === query.data.location_id);
  }

  res.json(ListPhotosResponse.parse(filtered));
});

router.post("/photos", async (req, res): Promise<void> => {
  const parsed = CreatePhotoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [photo] = await db.insert(photosTable).values(parsed.data).returning();

  let locationName = null;
  if (photo.locationId) {
    const [loc] = await db.select().from(locationsTable).where(eq(locationsTable.id, photo.locationId));
    locationName = loc?.name ?? null;
  }

  res.status(201).json({ ...photo, locationName });
});

router.delete("/photos/:id", async (req, res): Promise<void> => {
  const params = DeletePhotoParams.safeParse({ id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [photo] = await db.delete(photosTable).where(eq(photosTable.id, params.data.id)).returning();
  if (!photo) {
    res.status(404).json({ error: "Photo not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
