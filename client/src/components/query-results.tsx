import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, Loader2, Database, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QueryResultsProps {
  query: any;
}

export default function QueryResults({ query }: QueryResultsProps) {
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const executeQueryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/execute-query", {
        queryId: query.queryId,
        sql: query.sql
      });
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data);
      if (data.success) {
        toast({
          title: "Query Executed",
          description: `Query completed successfully with ${data.rowCount} rows returned.`,
        });
      } else {
        toast({
          title: "Execution Failed",
          description: data.error || "Query execution failed",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Execution Error",
        description: error instanceof Error ? error.message : "Failed to execute query",
        variant: "destructive",
      });
    },
  });

  const handleExecute = () => {
    if (!query?.sql) {
      toast({
        title: "No SQL to Execute",
        description: "Please generate a SQL query first",
        variant: "destructive",
      });
      return;
    }
    executeQueryMutation.mutate();
  };

  if (!query) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No Query Results</h3>
          <p className="text-sm">Generate and execute a SQL query to see results</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Results Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Database className="w-5 h-5 text-primary" />
          <span className="font-medium text-gray-900">Query Results</span>
          {results && (
            <Badge variant={results.success ? "default" : "destructive"}>
              {results.success ? `${results.rowCount} rows` : "Error"}
            </Badge>
          )}
        </div>
        <Button 
          onClick={handleExecute}
          disabled={executeQueryMutation.isPending || !query.sql}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {executeQueryMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          Execute Query
        </Button>
      </div>

      {/* Results Content */}
      <div className="flex-1 p-4 overflow-auto">
        {!results ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Play className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Click "Execute Query" to run the SQL and see results</p>
            </div>
          </div>
        ) : results.success ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Query Results</h4>
              <span className="text-xs text-gray-500">
                Showing {results.data?.length || 0} of {results.rowCount} rows
              </span>
            </div>
            
            {results.data && results.data.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      {Object.keys(results.data[0]).map((column) => (
                        <TableHead key={column} className="text-xs font-medium text-gray-500 uppercase">
                          {column.replace(/_/g, ' ')}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.data.map((row: any, index: number) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        {Object.values(row).map((value: any, cellIndex: number) => (
                          <TableCell key={cellIndex} className="text-sm">
                            {typeof value === 'number' && value.toString().includes('.') ? 
                              Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) :
                              typeof value === 'number' ? 
                              Number(value).toLocaleString() :
                              String(value)
                            }
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No data returned from query</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center text-red-800 text-sm font-medium mb-2">
              <AlertCircle className="w-4 h-4 mr-2" />
              Query Execution Error
            </div>
            <p className="text-red-700 text-sm">{results.error}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
