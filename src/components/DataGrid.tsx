
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Client, Worker, Task, ValidationError } from '@/types/data';
import { Edit, Search } from 'lucide-react';

interface DataGridProps {
  data: Client[] | Worker[] | Task[];
  type: 'clients' | 'workers' | 'tasks';
  validationErrors: ValidationError[];
  onUpdateData: (data: any[]) => void;
  onNaturalLanguageQuery: (query: string) => void;
}

const DataGrid: React.FC<DataGridProps> = ({ 
  data, 
  type, 
  validationErrors, 
  onUpdateData,
  onNaturalLanguageQuery 
}) => {
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const handleCellEdit = (rowIndex: number, column: string, value: string) => {
    const newData = [...data];
    (newData[rowIndex] as any)[column] = value;
    onUpdateData(newData);
    setEditingCell(null);
  };

  const handleNaturalLanguageSearch = () => {
    if (searchQuery.trim()) {
      onNaturalLanguageQuery(searchQuery);
    }
  };

  const getErrorsForCell = (rowIndex: number, column: string) => {
    return validationErrors.filter(error => 
      error.rowIndex === rowIndex && error.field === column
    );
  };

  return (
    <Card className="magic-card">
      <CardHeader>
        <CardTitle className="glow-text capitalize">{type} Data</CardTitle>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder={`Search ${type} or ask in natural language...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNaturalLanguageSearch()}
              className="pr-10"
            />
            <Button
              size="sm"
              onClick={handleNaturalLanguageSearch}
              className="absolute right-1 top-1 h-8 w-8"
              variant="ghost"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(column => (
                  <TableHead key={column} className="text-white font-semibold">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map(column => {
                    const cellErrors = getErrorsForCell(rowIndex, column);
                    const isEditing = editingCell?.row === rowIndex && editingCell?.col === column;
                    const cellValue = (row as any)[column];
                    
                    return (
                      <TableCell key={column} className="relative">
                        {isEditing ? (
                          <Input
                            defaultValue={cellValue}
                            onBlur={(e) => handleCellEdit(rowIndex, column, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleCellEdit(rowIndex, column, (e.target as HTMLInputElement).value);
                              }
                            }}
                            autoFocus
                            className="h-8"
                          />
                        ) : (
                          <div
                            className={`cursor-pointer hover:bg-accent/50 p-1 rounded ${
                              cellErrors.length > 0 ? 'bg-red-500/20 border border-red-500' : ''
                            }`}
                            onClick={() => setEditingCell({ row: rowIndex, col: column })}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                {Array.isArray(cellValue) ? cellValue.join(', ') : String(cellValue)}
                              </span>
                              <Edit className="h-3 w-3 opacity-50" />
                            </div>
                            {cellErrors.length > 0 && (
                              <div className="mt-1">
                                {cellErrors.map(error => (
                                  <Badge key={error.id} variant="destructive" className="text-xs">
                                    {error.message}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataGrid;
