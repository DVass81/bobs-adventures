import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, campgroundsTable, locationsTable } from "@workspace/db";
import {
  CreateCampgroundBody,
  UpdateCampgroundBody,
  UpdateCampgroundParams,
  DeleteCampgroundParams,
  ListCampgroundsResponse,
  UpdateCampgroundResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/campgrounds", async (req, res): Promise<void> => {
  const results = await db
    .select({
      id: campgroundsTable.id,
      name: campgroundsTable.name,
      locationId: campgroundsTable.locationId,
      locationName: locationsTable.name,
      rating: campgroundsTable.rating,
      notes: campgroundsTable.notes,
      hookups: campgroundsTable.hookups,
      pricePerNight: campgroundsTable.pricePerNight,
      wouldReturn: campgroundsTable.wouldReturn,
      stayDate: campgroundsTable.stayDate,
      createdAt: campgroundsTable.createdAt,
    })
    .from(campgroundsTable)
    .leftJoin(locationsTable, eq(campgroundsTable.locationId, locationsTable.id))
    .orderBy(campgroundsTable.createdAt);

  res.json(ListCampgroundsResponse.parse(results));
});

router.post("/campgrounds", async (req, res): Promise<void> => {
  const parsed = CreateCampgroundBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [campground] = await db.insert(campgroundsTable).values(parsed.data).returning();

  let locationName = null;
  if (campground.locationId) {
    const [loc] = await db.select().from(locationsTable).where(eq(locationsTable.id, campground.locationId));
    locationName = loc?.name ?? null;
  }

  res.status(201).json({ ...campground, locationName });
});

router.patch("/campgrounds/:id", async (req, res): Promise<void> => {
  const params = UpdateCampgroundParams.safeParse({ id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCampgroundBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [campground] = await db.update(campgroundsTable).set(parsed.data).where(eq(campgroundsTable.id, params.data.id)).returning();
  if (!campground) {
    res.status(404).json({ error: "Campground not found" });
    return;
  }

  let locationName = null;
  if (campground.locationId) {
    const [loc] = await db.select().from(locationsTable).where(eq(locationsTable.id, campground.locationId));
    locationName = loc?.name ?? null;
  }

  res.json(UpdateCampgroundResponse.parse({ ...campground, locationName }));
});

router.delete("/campgrounds/:id", async (req, res): Promise<void> => {
  const params = DeleteCampgroundParams.safeParse({ id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [campground] = await db.delete(campgroundsTable).where(eq(campgroundsTable.id, params.data.id)).returning();
  if (!campground) {
    res.status(404).json({ error: "Campground not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
