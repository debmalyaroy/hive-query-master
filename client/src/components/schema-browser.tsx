import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Database, Table, Key, Link, Hash, Calendar, Mail, DollarSign, Type } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Column {
  id: number;
  name: string;
  dataType: string;
  isPrimaryKey: string;
  isForeignKey: string;
}

interface Table {
  id: number;
  name: string;
  rowCount: number;
  columns: Column[];
}

interface Database {
  id: number;
  name: string;
  tables: Table[];
}

const getColumnIcon = (column: Column) => {
  if (column.isPrimaryKey === "true") return <Key className="w-3 h-3 text-yellow-500" />;
  if (column.isForeignKey === "true") return <Link className="w-3 h-3 text-blue-400" />;
  if (column.dataType === "string") return <Type className="w-3 h-3 text-gray-400" />;
  if (column.dataType === "bigint" || column.dataType === "integer") return <Hash className="w-3 h-3 text-gray-400" />;
  if (column.dataType === "decimal") return <DollarSign className="w-3 h-3 text-gray-400" />;
  if (column.dataType === "timestamp") return <Calendar className="w-3 h-3 text-gray-400" />;
  if (column.name.includes("email")) return <Mail className="w-3 h-3 text-gray-400" />;
  return <Type className="w-3 h-3 text-gray-400" />;
};

const formatRowCount = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M rows`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K rows`;
  }
  return `${count} rows`;
};

export default function SchemaBrowser() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedDatabases, setExpandedDatabases] = useState<Set<number>>(new Set([1, 2]));
  const [expandedTables, setExpandedTables] = useState<Set<number>>(new Set([1, 2, 3]));

  const { data: schema = [], isLoading } = useQuery<Database[]>({
    queryKey: ["/api/schema"],
  });

  const toggleDatabase = (dbId: number) => {
    const newExpanded = new Set(expandedDatabases);
    if (newExpanded.has(dbId)) {
      newExpanded.delete(dbId);
    } else {
      newExpanded.add(dbId);
    }
    setExpandedDatabases(newExpanded);
  };

  const toggleTable = (tableId: number) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableId)) {
      newExpanded.delete(tableId);
    } else {
      newExpanded.add(tableId);
    }
    setExpandedTables(newExpanded);
  };

  const filteredSchema = schema.filter(db =>
    searchTerm === "" ||
    db.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    db.tables.some(table =>
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.columns.some(column =>
        column.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-medium text-gray-900 mb-3">Data Lake Schema</h2>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">Loading schema...</div>
        ) : (
          <div className="space-y-4">
            {filteredSchema.map((database) => (
              <div key={database.id}>
                <Collapsible
                  open={expandedDatabases.has(database.id)}
                  onOpenChange={() => toggleDatabase(database.id)}
                >
                  <CollapsibleTrigger className="flex items-center text-sm font-medium text-gray-700 mb-2 w-full hover:text-gray-900">
                    <Database className="w-4 h-4 text-blue-500 mr-2" />
                    {database.name}
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="ml-4 space-y-3">
                      {database.tables.map((table) => (
                        <div key={table.id}>
                          <Collapsible
                            open={expandedTables.has(table.id)}
                            onOpenChange={() => toggleTable(table.id)}
                          >
                            <CollapsibleTrigger className="flex items-center text-sm text-gray-600 mb-1 cursor-pointer hover:text-gray-900 w-full">
                              <Table className="w-3 h-3 text-green-500 mr-2" />
                              {table.name}
                              <Badge variant="outline" className="ml-auto text-xs">
                                {formatRowCount(table.rowCount || 0)}
                              </Badge>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              <div className="ml-6 space-y-1">
                                {table.columns.map((column) => (
                                  <div key={column.id} className="text-xs text-gray-500 flex items-center">
                                    {getColumnIcon(column)}
                                    <span className="ml-2">{column.name} ({column.dataType})</span>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
