import { Router, type IRouter } from "express";
import { db, journalEntriesTable, locationsTable, photosTable, campgroundsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  GetTravelStatsResponse,
  GetRecentEntriesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const [locationCount] = await db.select({ count: sql<number>`count(*)::int` }).from(locationsTable);
  const [journalCount] = await db.select({ count: sql<number>`count(*)::int` }).from(journalEntriesTable);
  const [photoCount] = await db.select({ count: sql<number>`count(*)::int` }).from(photosTable);
  const [campgroundCount] = await db.select({ count: sql<number>`count(*)::int` }).from(campgroundsTable);

  const locations = await db.select({ state: locationsTable.state, miles: locationsTable.milesFromHome }).from(locationsTable);
  const statesVisited = new Set(locations.map(l => l.state).filter(Boolean)).size;
  const totalMiles = locations.reduce((sum, l) => sum + (l.miles ?? 0), 0);

  const currentMonth = new Date().getMonth();
  const currentSeason = currentMonth >= 2 && currentMonth <= 8 ? "Spring/Summer Adventure" : "Home Base";

  const stats = {
    totalLocations: locationCount.count,
    totalJournalEntries: journalCount.count,
    totalPhotos: photoCount.count,
    totalCampgrounds: campgroundCount.count,
    totalMilesTraveled: Math.round(totalMiles),
    statesVisited,
    currentSeason,
  };

  res.json(GetTravelStatsResponse.parse(stats));
});

router.get("/stats/recent-entries", async (_req, res): Promise<void> => {
  const entries = await db
    .select({
      id: journalEntriesTable.id,
      title: journalEntriesTable.title,
      content: journalEntriesTable.content,
      mood: journalEntriesTable.mood,
      locationId: journalEntriesTable.locationId,
      locationName: locationsTable.name,
      locationState: locationsTable.state,
      visitDate: journalEntriesTable.visitDate,
    })
    .from(journalEntriesTable)
    .leftJoin(locationsTable, eq(journalEntriesTable.locationId, locationsTable.id))
    .orderBy(sql`${journalEntriesTable.visitDate} DESC`)
    .limit(10);

  const photoCountByJournal = await db
    .select({
      journalId: photosTable.journalId,
      count: sql<number>`count(*)::int`,
    })
    .from(photosTable)
    .groupBy(photosTable.journalId);

  const photoMap = new Map(photoCountByJournal.map(p => [p.journalId, p.count]));

  const result = entries.map(e => ({
    ...e,
    photoCount: photoMap.get(e.id) ?? 0,
    locationState: e.locationState ?? null,
  }));

  res.json(GetRecentEntriesResponse.parse(result));
});

export default router;
