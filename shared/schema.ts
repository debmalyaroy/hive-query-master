import { pgTable, text, serial, integer, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const databases = pgTable("databases", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  databaseId: integer("database_id").references(() => databases.id),
  rowCount: integer("row_count").default(0),
  description: text("description"),
});

export const columns = pgTable("columns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dataType: text("data_type").notNull(),
  tableId: integer("table_id").references(() => tables.id),
  isPrimaryKey: text("is_primary_key").default("false"),
  isForeignKey: text("is_foreign_key").default("false"),
  description: text("description"),
});

export const queries = pgTable("queries", {
  id: serial("id").primaryKey(),
  naturalLanguageQuery: text("natural_language_query").notNull(),
  generatedSql: text("generated_sql").notNull(),
  executionTime: decimal("execution_time"),
  isValid: text("is_valid").default("true"),
  insights: jsonb("insights"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const queryResults = pgTable("query_results", {
  id: serial("id").primaryKey(),
  queryId: integer("query_id").references(() => queries.id),
  resultData: jsonb("result_data"),
  rowCount: integer("row_count"),
});

export const insertDatabaseSchema = createInsertSchema(databases).omit({ id: true });
export const insertTableSchema = createInsertSchema(tables).omit({ id: true });
export const insertColumnSchema = createInsertSchema(columns).omit({ id: true });
export const insertQuerySchema = createInsertSchema(queries).omit({ id: true, createdAt: true });
export const insertQueryResultSchema = createInsertSchema(queryResults).omit({ id: true });

export type Database = typeof databases.$inferSelect;
export type Table = typeof tables.$inferSelect;
export type Column = typeof columns.$inferSelect;
export type Query = typeof queries.$inferSelect;
export type QueryResult = typeof queryResults.$inferSelect;

export type InsertDatabase = z.infer<typeof insertDatabaseSchema>;
export type InsertTable = z.infer<typeof insertTableSchema>;
export type InsertColumn = z.infer<typeof insertColumnSchema>;
export type InsertQuery = z.infer<typeof insertQuerySchema>;
export type InsertQueryResult = z.infer<typeof insertQueryResultSchema>;
