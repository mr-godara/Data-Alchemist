'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Search, Filter, Edit2, Save, X, Zap, Sparkles } from 'lucide-react';

interface DataGridProps {
  data: any[];
  validationResults: any[];
  onDataChange: (data: any[]) => void;
}

export function DataGrid({ data, validationResults, onDataChange }: DataGridProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterErrors, setFilterErrors] = useState(false);
  const [editValue, setEditValue] = useState('');

  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const filteredData = useMemo(() => {
    let filtered = data;
    
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      
      // Natural language search processing
      if (lowerSearch.includes('high priority') || lowerSearch.includes('urgent')) {
        filtered = filtered.filter(row => 
          row.PriorityLevel && parseInt(row.PriorityLevel) >= 4
        );
      } else if (lowerSearch.includes('javascript') || lowerSearch.includes('react')) {
        filtered = filtered.filter(row =>
          row.Skills && row.Skills.toLowerCase().includes('javascript') ||
          row.RequiredSkills && row.RequiredSkills.toLowerCase().includes('javascript') ||
          row.Skills && row.Skills.toLowerCase().includes('react') ||
          row.RequiredSkills && row.RequiredSkills.toLowerCase().includes('react')
        );
      } else if (lowerSearch.includes('frontend') || lowerSearch.includes('ui')) {
        filtered = filtered.filter(row =>
          row.Category && row.Category.toLowerCase().includes('frontend') ||
          row.WorkerGroup && row.WorkerGroup.toLowerCase().includes('frontend') ||
          row.TaskName && row.TaskName.toLowerCase().includes('ui')
        );
      } else if (lowerSearch.includes('overloaded') || lowerSearch.includes('busy')) {
        filtered = filtered.filter(row =>
          row.MaxLoadPerPhase && parseInt(row.MaxLoadPerPhase) > 8
        );
      } else if (lowerSearch.includes('missing') || lowerSearch.includes('error')) {
        const errorRows = new Set(validationResults.filter(r => r.type === 'error').map(r => r.row));
        filtered = filtered.filter((_, index) => errorRows.has(index));
      } else {
        // Regular text search
        filtered = filtered.filter(row =>
          Object.values(row).some(value =>
            String(value).toLowerCase().includes(lowerSearch)
          )
        );
      }
    }
    
    if (filterErrors) {
      const errorRows = new Set(validationResults.map(result => result.row));
      filtered = filtered.filter((_, index) => errorRows.has(index));
    }
    
    return filtered;
  }, [data, searchTerm, filterErrors, validationResults]);

  const getValidationStatus = (rowIndex: number, columnName: string) => {
    const result = validationResults.find(
      r => r.row === rowIndex && r.field === columnName
    );
    return result?.type || null;
  };

  const getValidationMessage = (rowIndex: number, columnName: string) => {
    const result = validationResults.find(
      r => r.row === rowIndex && r.field === columnName
    );
    return result?.message || '';
  };

  const getValidationSuggestion = (rowIndex: number, columnName: string) => {
    const result = validationResults.find(
      r => r.row === rowIndex && r.field === columnName
    );
    return result?.suggestion || '';
  };

  const handleCellEdit = (rowIndex: number, columnName: string, value: string) => {
    setEditingCell(`${rowIndex}-${columnName}`);
    setEditValue(value);
  };

  const handleSaveEdit = (rowIndex: number, columnName: string) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [columnName]: editValue };
    onDataChange(newData);
    setEditingCell(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleApplySuggestion = (rowIndex: number, columnName: string) => {
    const suggestion = getValidationSuggestion(rowIndex, columnName);
    if (suggestion) {
      const newData = [...data];
      newData[rowIndex] = { ...newData[rowIndex], [columnName]: suggestion };
      onDataChange(newData);
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'error':
        return <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full" />;
      case 'warning':
        return <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full bg-yellow-500" />;
      default:
        return null;
    }
  };

  const getDisplayValue = (row: any, column: string) => {
    const value = row[column];
    
    // Show meaningful names instead of IDs where possible
    if (column === 'ClientName' || column === 'WorkerName' || column === 'TaskName') {
      return value;
    }
    
    // For other fields, return the actual value
    return String(value);
  };

  const handleNaturalLanguageSearch = (query: string) => {
    setSearchTerm(query);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            Interactive Data Grid ({filteredData.length} rows)
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Try: 'high priority clients' or 'javascript workers'"
                value={searchTerm}
                onChange={(e) => handleNaturalLanguageSearch(e.target.value)}
                className="pl-9 w-64"
              />
              {searchTerm && (
                <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4" />
              )}
            </div>
            <Button
              variant={filterErrors ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterErrors(!filterErrors)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Errors Only
            </Button>
          </div>
        </div>
        
        {searchTerm && (
          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
            <Sparkles className="inline h-4 w-4 mr-1" />
            {searchTerm.includes('high priority') ? 'Showing high priority clients (level 4-5)' :
             searchTerm.includes('javascript') ? 'Showing JavaScript-related records' :
             searchTerm.includes('frontend') ? 'Showing frontend tasks and workers' :
             searchTerm.includes('overloaded') ? 'Showing workers with high task loads' :
             searchTerm.includes('missing') ? 'Showing records with validation errors' :
             `Searching for: ${searchTerm}`}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column}</span>
                      {validationResults.some(r => r.field === column) && (
                        <div className="flex items-center space-x-1">
                          {validationResults.some(r => r.field === column && r.type === 'error') && (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          )}
                          {validationResults.some(r => r.field === column && r.type === 'warning') && (
                            <AlertCircle className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((row, rowIndex) => {
                // Find the original row index in the full dataset
                const originalRowIndex = data.findIndex(originalRow => 
                  JSON.stringify(originalRow) === JSON.stringify(row)
                );
                
                return (
                  <tr key={originalRowIndex} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {originalRowIndex + 1}
                    </td>
                    {columns.map((column) => {
                      const cellKey = `${originalRowIndex}-${column}`;
                      const isEditing = editingCell === cellKey;
                      const validationStatus = getValidationStatus(originalRowIndex, column);
                      const validationMessage = getValidationMessage(originalRowIndex, column);
                      const validationSuggestion = getValidationSuggestion(originalRowIndex, column);
                      
                      return (
                        <td
                          key={column}
                          className={`px-4 py-3 text-sm relative group ${
                            validationStatus === 'error' ? 'bg-red-50' :
                            validationStatus === 'warning' ? 'bg-yellow-50' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {isEditing ? (
                              <div className="flex items-center space-x-2 flex-1">
                                <Input
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="h-8 text-sm"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveEdit(originalRowIndex, column);
                                    } else if (e.key === 'Escape') {
                                      handleCancelEdit();
                                    }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleSaveEdit(originalRowIndex, column)}
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={handleCancelEdit}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <span className="flex-1">{getDisplayValue(row, column)}</span>
                                <div className="flex items-center space-x-1">
                                  {getStatusBadge(validationStatus)}
                                  {validationSuggestion && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500"
                                      onClick={() => handleApplySuggestion(originalRowIndex, column)}
                                      title="Apply AI suggestion"
                                    >
                                      <Zap className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleCellEdit(originalRowIndex, column, String(row[column]))}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {validationMessage && (
                            <div className="absolute bottom-full left-0 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap max-w-xs">
                              <div>{validationMessage}</div>
                              {validationSuggestion && (
                                <div className="text-blue-200 mt-1">
                                  <Zap className="inline h-3 w-3 mr-1" />
                                  Suggestion: {validationSuggestion}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No data found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Try a different search term' : 'Upload data to get started'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}