import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface SQLGenerationRequest {
  naturalLanguageQuery: string;
  schemaContext: {
    databases: Array<{
      name: string;
      tables: Array<{
        name: string;
        columns: Array<{
          name: string;
          dataType: string;
          isPrimaryKey: boolean;
          isForeignKey: boolean;
        }>;
      }>;
    }>;
  };
}

export interface SQLGenerationResponse {
  sql: string;
  explanation: string;
  confidence: number;
  estimatedRuntime: string;
  dataScanned: string;
  performance: string;
  isValid: boolean;
  error?: string;
}

export async function generateSQL(request: SQLGenerationRequest): Promise<SQLGenerationResponse> {
  try {
    const prompt = `You are an expert SQL developer for Hive data lake queries. Generate a SQL query based on the natural language request and the provided schema context.

Natural Language Query: ${request.naturalLanguageQuery}

Schema Context:
${JSON.stringify(request.schemaContext, null, 2)}

Requirements:
1. Generate syntactically correct Hive SQL
2. Use proper table references with database prefixes (e.g., sales_db.customers)
3. Consider performance optimizations
4. Provide realistic performance estimates
5. Ensure the query answers the natural language request accurately

Respond with JSON in this exact format:
{
  "sql": "the generated SQL query",
  "explanation": "brief explanation of what the query does",
  "confidence": 0.95,
  "estimatedRuntime": "~2.3 seconds",
  "dataScanned": "~850MB",
  "performance": "Good - Uses efficient JOIN with indexes",
  "isValid": true
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert SQL developer specializing in Hive data lake queries. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      sql: result.sql || "",
      explanation: result.explanation || "",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      estimatedRuntime: result.estimatedRuntime || "Unknown",
      dataScanned: result.dataScanned || "Unknown",
      performance: result.performance || "Unknown",
      isValid: result.isValid !== false,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      sql: "",
      explanation: "",
      confidence: 0,
      estimatedRuntime: "Unknown",
      dataScanned: "Unknown", 
      performance: "Error",
      isValid: false,
      error: error instanceof Error ? error.message : "Failed to generate SQL"
    };
  }
}

export async function executeMockQuery(sql: string): Promise<{
  success: boolean;
  data?: any[];
  rowCount?: number;
  error?: string;
}> {
  // Mock query execution with sample data
  try {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock results based on query type
    if (sql.toLowerCase().includes("customer") && sql.toLowerCase().includes("order")) {
      return {
        success: true,
        data: [
          { customer_id: 12847, first_name: "Sarah", last_name: "Johnson", email: "sarah.johnson@email.com", total_order_value: 15420.50, total_orders: 23 },
          { customer_id: 8291, first_name: "Michael", last_name: "Chen", email: "m.chen@email.com", total_order_value: 14890.25, total_orders: 19 },
          { customer_id: 5634, first_name: "Emma", last_name: "Williams", email: "emma.w@email.com", total_order_value: 13750.80, total_orders: 31 },
          { customer_id: 9823, first_name: "David", last_name: "Rodriguez", email: "d.rodriguez@email.com", total_order_value: 12990.15, total_orders: 17 },
          { customer_id: 3456, first_name: "Lisa", last_name: "Thompson", email: "lisa.thompson@email.com", total_order_value: 11820.40, total_orders: 25 }
        ],
        rowCount: 5
      };
    }
    
    return {
      success: true,
      data: [
        { id: 1, name: "Sample Record 1", value: 100 },
        { id: 2, name: "Sample Record 2", value: 200 },
        { id: 3, name: "Sample Record 3", value: 300 }
      ],
      rowCount: 3
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Query execution failed"
    };
  }
}
