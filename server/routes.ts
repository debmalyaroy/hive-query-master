import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateSQL, executeMockQuery, type SQLGenerationRequest } from "./services/openai";
import { insertQuerySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all databases with their tables and columns
  app.get("/api/schema", async (req, res) => {
    try {
      const databases = await storage.getDatabases();
      const result = [];
      
      for (const database of databases) {
        const tables = await storage.getTablesByDatabase(database.id);
        const dbWithTables = {
          ...database,
          tables: []
        };
        
        for (const table of tables) {
          const columns = await storage.getColumnsByTable(table.id);
          dbWithTables.tables.push({
            ...table,
            columns
          });
        }
        
        result.push(dbWithTables);
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schema" });
    }
  });

  // Generate SQL from natural language
  app.post("/api/generate-sql", async (req, res) => {
    try {
      const { naturalLanguageQuery } = req.body;
      
      if (!naturalLanguageQuery) {
        return res.status(400).json({ error: "naturalLanguageQuery is required" });
      }

      // Get schema context
      const databases = await storage.getDatabases();
      const schemaContext = {
        databases: []
      };
      
      for (const database of databases) {
        const tables = await storage.getTablesByDatabase(database.id);
        const dbContext = {
          name: database.name,
          tables: []
        };
        
        for (const table of tables) {
          const columns = await storage.getColumnsByTable(table.id);
          dbContext.tables.push({
            name: table.name,
            columns: columns.map(col => ({
              name: col.name,
              dataType: col.dataType,
              isPrimaryKey: col.isPrimaryKey === "true",
              isForeignKey: col.isForeignKey === "true"
            }))
          });
        }
        
        schemaContext.databases.push(dbContext);
      }

      const request: SQLGenerationRequest = {
        naturalLanguageQuery,
        schemaContext
      };

      const sqlResult = await generateSQL(request);
      
      // Save query to storage
      const queryData = {
        naturalLanguageQuery,
        generatedSql: sqlResult.sql,
        executionTime: sqlResult.estimatedRuntime,
        isValid: sqlResult.isValid ? "true" : "false",
        insights: {
          confidence: sqlResult.confidence,
          performance: sqlResult.performance,
          dataScanned: sqlResult.dataScanned,
          explanation: sqlResult.explanation
        }
      };

      const savedQuery = await storage.createQuery(queryData);
      
      res.json({
        queryId: savedQuery.id,
        ...sqlResult
      });
    } catch (error) {
      console.error("SQL generation error:", error);
      res.status(500).json({ error: "Failed to generate SQL" });
    }
  });

  // Execute SQL query (mock)
  app.post("/api/execute-query", async (req, res) => {
    try {
      const { queryId, sql } = req.body;
      
      if (!sql) {
        return res.status(400).json({ error: "SQL query is required" });
      }

      const result = await executeMockQuery(sql);
      
      if (queryId && result.success) {
        // Save query result
        await storage.createQueryResult({
          queryId,
          resultData: result.data,
          rowCount: result.rowCount || 0
        });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Query execution error:", error);
      res.status(500).json({ error: "Failed to execute query" });
    }
  });

  // Get query history
  app.get("/api/queries", async (req, res) => {
    try {
      const queries = await storage.getQueries();
      res.json(queries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch query history" });
    }
  });

  // Get query by ID
  app.get("/api/queries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const query = await storage.getQueryById(id);
      
      if (!query) {
        return res.status(404).json({ error: "Query not found" });
      }
      
      const result = await storage.getQueryResult(id);
      
      res.json({
        ...query,
        result
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch query" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
