import { pgTable, serial, text, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { locationsTable } from "./locations";

export const campgroundsTable = pgTable("campgrounds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  locationId: integer("location_id").references(() => locationsTable.id, { onDelete: "set null" }),
  rating: integer("rating"),
  notes: text("notes"),
  hookups: text("hookups").notNull().default("none"),
  pricePerNight: real("price_per_night"),
  wouldReturn: boolean("would_return").notNull().default(true),
  stayDate: text("stay_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCampgroundSchema = createInsertSchema(campgroundsTable).omit({ id: true, createdAt: true });
export type InsertCampground = z.infer<typeof insertCampgroundSchema>;
export type Campground = typeof campgroundsTable.$inferSelect;
