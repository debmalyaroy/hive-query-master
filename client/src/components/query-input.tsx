import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wand2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QueryInputProps {
  onQueryGenerated: (query: any) => void;
}

const exampleQueries = [
  "Top selling products",
  "Customer acquisition by month", 
  "Revenue trends",
  "Show me users with most page views",
  "Average order value by customer"
];

export default function QueryInput({ onQueryGenerated }: QueryInputProps) {
  const [naturalQuery, setNaturalQuery] = useState("Show me the top 10 customers by total order value in the last quarter");
  const { toast } = useToast();

  const generateSqlMutation = useMutation({
    mutationFn: async (naturalLanguageQuery: string) => {
      const response = await apiRequest("POST", "/api/generate-sql", {
        naturalLanguageQuery
      });
      return response.json();
    },
    onSuccess: (data) => {
      onQueryGenerated(data);
      toast({
        title: "SQL Generated Successfully",
        description: "Your natural language query has been converted to SQL.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate SQL",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!naturalQuery.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a natural language query",
        variant: "destructive",
      });
      return;
    }
    generateSqlMutation.mutate(naturalQuery.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleExampleClick = (example: string) => {
    setNaturalQuery(example);
  };

  return (
    <div className="bg-white border-b border-gray-200 p-6">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Natural Language Query
        </label>
        <Card className="relative">
          <Textarea
            placeholder="Ask your question in plain English... e.g., 'Show me the top 10 customers by total order value in the last quarter'"
            value={naturalQuery}
            onChange={(e) => setNaturalQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-24 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <div className="absolute bottom-4 right-4 flex items-center space-x-2">
            <span className="text-xs text-gray-400">Press Ctrl+Enter to generate</span>
            <Button
              onClick={handleGenerate}
              disabled={generateSqlMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {generateSqlMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              Generate SQL
            </Button>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-500">Examples:</span>
        {exampleQueries.map((example, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => handleExampleClick(example)}
          >
            {example}
          </Badge>
        ))}
      </div>
    </div>
  );
}
