import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, Settings, User, Search } from "lucide-react";
import SchemaBrowser from "@/components/schema-browser";
import QueryInput from "@/components/query-input";
import SqlDisplay from "@/components/sql-display";
import QueryResults from "@/components/query-results";

export default function Home() {
  const [activeTab, setActiveTab] = useState("sql");
  const [currentQuery, setCurrentQuery] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7.5 5.6L10 7L8.6 9.5L7 8L5.4 9.5L4 7L6.5 5.6L7.5 4V5.6M16.5 18.4L14 17L15.4 14.5L17 16L18.6 14.5L20 17L17.5 18.4L16.5 20V18.4M12 7C14.76 7 17 9.24 17 12S14.76 17 12 17S7 14.76 7 12S9.24 7 12 7M12 9C10.34 9 9 10.34 9 12S10.34 15 12 15S15 13.66 15 12S13.66 9 12 9Z"/>
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">SQL Genie</h1>
            <Badge variant="secondary" className="text-sm">Natural Language to SQL</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="text-gray-500 hover:text-gray-700"
            >
              <History className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">History</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <Settings className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16 h-screen">
        {/* Schema Browser Sidebar */}
        <SchemaBrowser />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Query Input Section */}
          <QueryInput onQueryGenerated={setCurrentQuery} />

          {/* Tabs for SQL and Results */}
          <div className="bg-white border-b border-gray-200">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex h-auto bg-transparent p-0">
                <TabsTrigger 
                  value="sql" 
                  className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-6 py-4"
                >
                  Generated SQL
                </TabsTrigger>
                <TabsTrigger 
                  value="results" 
                  className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-6 py-4"
                >
                  Query Results
                </TabsTrigger>
                <TabsTrigger 
                  value="plan" 
                  className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-6 py-4"
                >
                  Execution Plan
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
            <Tabs value={activeTab} className="h-full">
              <TabsContent value="sql" className="h-full mt-0">
                <SqlDisplay query={currentQuery} />
              </TabsContent>
              <TabsContent value="results" className="h-full mt-0">
                <QueryResults query={currentQuery} />
              </TabsContent>
              <TabsContent value="plan" className="h-full mt-0">
                <Card className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-4">🚧</div>
                    <h3 className="text-lg font-medium mb-2">Execution Plan</h3>
                    <p className="text-sm">Query execution plan visualization coming soon</p>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Query History Sidebar */}
        {showHistory && (
          <div className="w-80 bg-white border-l border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Query History</h3>
            </div>
            <div className="p-4 space-y-3">
              <Card className="p-3 cursor-pointer hover:bg-gray-50">
                <p className="text-sm text-gray-900 mb-1">Top customers by order value</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </Card>
              <Card className="p-3 cursor-pointer hover:bg-gray-50">
                <p className="text-sm text-gray-900 mb-1">Monthly revenue trends</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </Card>
              <Card className="p-3 cursor-pointer hover:bg-gray-50">
                <p className="text-sm text-gray-900 mb-1">Product categories performance</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
