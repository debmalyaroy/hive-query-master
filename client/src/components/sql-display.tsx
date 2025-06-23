import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Play, Code, Info, Clock, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SqlDisplayProps {
  query: any;
}

export default function SqlDisplay({ query }: SqlDisplayProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    if (query?.sql) {
      await navigator.clipboard.writeText(query.sql);
      toast({
        title: "Copied to clipboard",
        description: "SQL query has been copied to your clipboard.",
      });
    }
  };

  const handleDownload = () => {
    if (query?.sql) {
      const blob = new Blob([query.sql], { type: "text/sql" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "generated-query.sql";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Downloaded",
        description: "SQL query has been downloaded as a file.",
      });
    }
  };

  if (!query) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Code className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No SQL Generated Yet</h3>
          <p className="text-sm">Enter a natural language query above to generate SQL</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      {/* SQL Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Code className="w-5 h-5 text-primary" />
          <span className="font-medium text-gray-900">Generated SQL Query</span>
          <Badge variant={query.isValid ? "default" : "destructive"}>
            {query.isValid ? "Valid" : "Invalid"}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Play className="w-4 h-4 mr-2" />
            Execute Query
          </Button>
        </div>
      </div>

      {/* SQL Code */}
      <div className="p-6">
        {query.error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center text-red-800 text-sm font-medium mb-2">
              <Info className="w-4 h-4 mr-2" />
              Error Generating SQL
            </div>
            <p className="text-red-700 text-sm">{query.error}</p>
          </div>
        ) : (
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
            <code>{query.sql}</code>
          </pre>
        )}
      </div>

      {/* Query Insights */}
      {query.performance && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-3">Query Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 border-blue-200 p-3">
              <div className="flex items-center text-blue-800 text-sm">
                <Info className="w-4 h-4 mr-2" />
                <span className="font-medium">Performance</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">{query.performance}</p>
            </Card>
            <Card className="bg-green-50 border-green-200 p-3">
              <div className="flex items-center text-green-800 text-sm">
                <Clock className="w-4 h-4 mr-2" />
                <span className="font-medium">Est. Runtime</span>
              </div>
              <p className="text-xs text-green-700 mt-1">{query.estimatedRuntime}</p>
            </Card>
            <Card className="bg-amber-50 border-amber-200 p-3">
              <div className="flex items-center text-amber-800 text-sm">
                <Database className="w-4 h-4 mr-2" />
                <span className="font-medium">Data Scanned</span>
              </div>
              <p className="text-xs text-amber-700 mt-1">{query.dataScanned}</p>
            </Card>
          </div>
        </div>
      )}

      {/* Explanation */}
      {query.explanation && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-2">Query Explanation</h4>
          <p className="text-sm text-gray-600">{query.explanation}</p>
        </div>
      )}
    </Card>
  );
}
