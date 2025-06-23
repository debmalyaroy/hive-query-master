// Monaco Editor setup for SQL syntax highlighting
// This file is prepared for future integration of Monaco Editor
// Currently using simple pre/code blocks, but can be enhanced

export const sqlKeywords = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER',
  'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL',
  'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'AS', 'AND', 'OR',
  'NOT', 'NULL', 'IS', 'IN', 'BETWEEN', 'LIKE', 'EXISTS', 'CASE', 'WHEN',
  'THEN', 'ELSE', 'END', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP',
  'ALTER', 'TABLE', 'INDEX', 'VIEW', 'DATABASE', 'SCHEMA'
];

export const hiveKeywords = [
  'PARTITIONED BY', 'CLUSTERED BY', 'SORTED BY', 'INTO', 'BUCKETS',
  'ROW FORMAT', 'STORED AS', 'LOCATION', 'TBLPROPERTIES', 'MSCK',
  'REPAIR TABLE', 'SHOW PARTITIONS', 'DESCRIBE FORMATTED', 'EXPLAIN',
  'ANALYZE TABLE', 'COMPUTE STATISTICS'
];

// Future: Monaco Editor configuration for SQL
export const monacoSqlConfig = {
  theme: 'vs-dark',
  language: 'sql',
  options: {
    fontSize: 14,
    fontFamily: 'Fira Code, monospace',
    lineNumbers: 'on',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    automaticLayout: true
  }
};
