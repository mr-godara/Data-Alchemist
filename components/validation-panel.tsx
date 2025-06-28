'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, AlertTriangle, CheckCircle, Zap, RefreshCw, X } from 'lucide-react';

interface ValidationResult {
  type: 'error' | 'warning' | 'info';
  field: string;
  row: number;
  message: string;
  suggestion?: string;
}

interface ValidationPanelProps {
  results: ValidationResult[];
  onFixError: (error: ValidationResult) => void;
}

export function ValidationPanel({ results, onFixError }: ValidationPanelProps) {
  const [selectedTab, setSelectedTab] = useState('all');
  const [isRunningValidation, setIsRunningValidation] = useState(false);

  const errorCount = results.filter(r => r.type === 'error').length;
  const warningCount = results.filter(r => r.type === 'warning').length;
  const totalCount = results.length;

  const filteredResults = results.filter(result => {
    if (selectedTab === 'all') return true;
    return result.type === selectedTab;
  });

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const runValidation = () => {
    setIsRunningValidation(true);
    setTimeout(() => {
      setIsRunningValidation(false);
    }, 2000);
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
            Validation Results
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline"
            onClick={runValidation}
            disabled={isRunningValidation}
          >
            {isRunningValidation ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Re-validate
          </Button>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="text-center p-2 bg-red-50 rounded">
            <p className="text-lg font-bold text-red-600">{errorCount}</p>
            <p className="text-xs text-red-600">Errors</p>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded">
            <p className="text-lg font-bold text-yellow-600">{warningCount}</p>
            <p className="text-xs text-yellow-600">Warnings</p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <p className="text-lg font-bold text-green-600">{totalCount === 0 ? 'All' : totalCount - errorCount - warningCount}</p>
            <p className="text-xs text-green-600">Passed</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Issues */}
        <div>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
              <TabsTrigger value="error">Errors ({errorCount})</TabsTrigger>
              <TabsTrigger value="warning">Warnings ({warningCount})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedTab} className="mt-4">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredResults.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>No {selectedTab === 'all' ? 'issues' : selectedTab + 's'} found</p>
                    <p className="text-sm text-gray-400 mt-1">Your data looks clean!</p>
                  </div>
                ) : (
                  filteredResults.map((result, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-white hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2 flex-1">
                          {getResultIcon(result.type)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                Row {result.row + 1}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {result.field}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-900">{result.message}</p>
                            {result.suggestion && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                <div className="flex items-center space-x-1 mb-1">
                                  <Zap className="h-3 w-3 text-blue-500" />
                                  <span className="font-medium text-blue-700">AI Suggestion:</span>
                                </div>
                                <p className="text-blue-600">{result.suggestion}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => onFixError(result)}
                          >
                            <Zap className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}