import { 
  databases, tables, columns, queries, queryResults,
  type Database, type Table, type Column, type Query, type QueryResult,
  type InsertDatabase, type InsertTable, type InsertColumn, type InsertQuery, type InsertQueryResult
} from "@shared/schema";

export interface IStorage {
  // Database operations
  getDatabases(): Promise<Database[]>;
  createDatabase(database: InsertDatabase): Promise<Database>;
  
  // Table operations
  getTablesByDatabase(databaseId: number): Promise<Table[]>;
  createTable(table: InsertTable): Promise<Table>;
  
  // Column operations
  getColumnsByTable(tableId: number): Promise<Column[]>;
  createColumn(column: InsertColumn): Promise<Column>;
  
  // Query operations
  getQueries(): Promise<Query[]>;
  createQuery(query: InsertQuery): Promise<Query>;
  getQueryById(id: number): Promise<Query | undefined>;
  
  // Query result operations
  getQueryResult(queryId: number): Promise<QueryResult | undefined>;
  createQueryResult(result: InsertQueryResult): Promise<QueryResult>;
}

export class MemStorage implements IStorage {
  private databases: Map<number, Database> = new Map();
  private tables: Map<number, Table> = new Map();
  private columns: Map<number, Column> = new Map();
  private queries: Map<number, Query> = new Map();
  private queryResults: Map<number, QueryResult> = new Map();
  
  private currentDbId = 1;
  private currentTableId = 1;
  private currentColumnId = 1;
  private currentQueryId = 1;
  private currentResultId = 1;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Sales Database
    const salesDb: Database = { id: this.currentDbId++, name: "sales_db", description: "Sales and customer data" };
    this.databases.set(salesDb.id, salesDb);
    
    // Analytics Database
    const analyticsDb: Database = { id: this.currentDbId++, name: "analytics_db", description: "Analytics and tracking data" };
    this.databases.set(analyticsDb.id, analyticsDb);

    // Sales tables
    const customersTable: Table = { id: this.currentTableId++, name: "customers", databaseId: salesDb.id, rowCount: 1200000, description: "Customer information" };
    this.tables.set(customersTable.id, customersTable);
    
    const ordersTable: Table = { id: this.currentTableId++, name: "orders", databaseId: salesDb.id, rowCount: 2800000, description: "Order transactions" };
    this.tables.set(ordersTable.id, ordersTable);
    
    const productsTable: Table = { id: this.currentTableId++, name: "products", databaseId: salesDb.id, rowCount: 15000, description: "Product catalog" };
    this.tables.set(productsTable.id, productsTable);

    // Analytics tables
    const sessionsTable: Table = { id: this.currentTableId++, name: "user_sessions", databaseId: analyticsDb.id, rowCount: 50000000, description: "User session data" };
    this.tables.set(sessionsTable.id, sessionsTable);
    
    const pageViewsTable: Table = { id: this.currentTableId++, name: "page_views", databaseId: analyticsDb.id, rowCount: 200000000, description: "Page view events" };
    this.tables.set(pageViewsTable.id, pageViewsTable);

    // Customer columns
    this.columns.set(this.currentColumnId++, { id: this.currentColumnId - 1, name: "customer_id", dataType: "bigint", tableId: customersTable.id, isPrimaryKey: "true", isForeignKey: "false" });
    this.columns.set(this.currentColumnId++, { id: this.currentColumnId - 1, name: "first_name", dataType: "string", tableId: customersTable.id, isPrimaryKey: "false", isForeignKey: "false" });
    this.columns.set(this.currentColumnId++, { id: this.currentColumnId - 1, name: "last_name", dataType: "string", tableId: customersTable.id, isPrimaryKey: "false", isForeignKey: "false" });
    this.columns.set(this.currentColumnId++, { id: this.currentColumnId - 1, name: "email", dataType: "string", tableId: customersTable.id, isPrimaryKey: "false", isForeignKey: "false" });
    this.columns.set(this.currentColumnId++, { id: this.currentColumnId - 1, name: "created_date", dataType: "timestamp", tableId: customersTable.id, isPrimaryKey: "false", isForeignKey: "false" });

    // Order columns
    this.columns.set(this.currentColumnId++, { id: this.currentColumnId - 1, name: "order_id", dataType: "bigint", tableId: ordersTable.id, isPrimaryKey: "true", isForeignKey: "false" });
    this.columns.set(this.currentColumnId++, { id: this.currentColumnId - 1, name: "customer_id", dataType: "bigint", tableId: ordersTable.id, isPrimaryKey: "false", isForeignKey: "true" });
    this.columns.set(this.currentColumnId++, { id: this.currentColumnId - 1, name: "total_amount", dataType: "decimal", tableId: ordersTable.id, isPrimaryKey: "false", isForeignKey: "false" });
    this.columns.set(this.currentColumnId++, { id: this.currentColumnId - 1, name: "order_date", dataType: "timestamp", tableId: ordersTable.id, isPrimaryKey: "false", isForeignKey: "false" });

    // Product columns
    this.columns.set(this.currentColumnId++, { id: this.currentColumnId - 1, name: "product_id", dataType: "bigint", tableId: productsTable.id, isPrimaryKey: "true", isForeignKey: "false" });
    this.columns.set(this.currentColumnId++, { id: this.currentColumnId - 1, name: "product_name", dataType: "string", tableId: productsTable.id, isPrimaryKey: "false", isForeignKey: "false" });
    this.columns.set(this.currentColumnId++, { id: this.currentColumnId - 1, name: "category", dataType: "string", tableId: productsTable.id, isPrimaryKey: "false", isForeignKey: "false" });
    this.columns.set(this.currentColumnId++, { id: this.currentColumnId - 1, name: "price", dataType: "decimal", tableId: productsTable.id, isPrimaryKey: "false", isForeignKey: "false" });
  }

  async getDatabases(): Promise<Database[]> {
    return Array.from(this.databases.values());
  }

  async createDatabase(database: InsertDatabase): Promise<Database> {
    const newDb: Database = { ...database, id: this.currentDbId++ };
    this.databases.set(newDb.id, newDb);
    return newDb;
  }

  async getTablesByDatabase(databaseId: number): Promise<Table[]> {
    return Array.from(this.tables.values()).filter(table => table.databaseId === databaseId);
  }

  async createTable(table: InsertTable): Promise<Table> {
    const newTable: Table = { ...table, id: this.currentTableId++ };
    this.tables.set(newTable.id, newTable);
    return newTable;
  }

  async getColumnsByTable(tableId: number): Promise<Column[]> {
    return Array.from(this.columns.values()).filter(column => column.tableId === tableId);
  }

  async createColumn(column: InsertColumn): Promise<Column> {
    const newColumn: Column = { ...column, id: this.currentColumnId++ };
    this.columns.set(newColumn.id, newColumn);
    return newColumn;
  }

  async getQueries(): Promise<Query[]> {
    return Array.from(this.queries.values()).sort((a, b) => 
      new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
    );
  }

  async createQuery(query: InsertQuery): Promise<Query> {
    const newQuery: Query = { 
      ...query, 
      id: this.currentQueryId++,
      createdAt: new Date()
    };
    this.queries.set(newQuery.id, newQuery);
    return newQuery;
  }

  async getQueryById(id: number): Promise<Query | undefined> {
    return this.queries.get(id);
  }

  async getQueryResult(queryId: number): Promise<QueryResult | undefined> {
    return Array.from(this.queryResults.values()).find(result => result.queryId === queryId);
  }

  async createQueryResult(result: InsertQueryResult): Promise<QueryResult> {
    const newResult: QueryResult = { ...result, id: this.currentResultId++ };
    this.queryResults.set(newResult.id, newResult);
    return newResult;
  }
}

export const storage = new MemStorage();
