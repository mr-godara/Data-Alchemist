'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, AlertCircle, Zap, Eye, CheckCircle, Sparkles } from 'lucide-react';

interface AnomalyDetectionProps {
  data: any[];
  onAnomalyFound: (anomaly: any) => void;
}

interface Anomaly {
  id: string;
  type: 'outlier' | 'pattern' | 'inconsistency' | 'duplicate';
  severity: 'low' | 'medium' | 'high';
  field: string;
  row: number;
  description: string;
  suggestion: string;
  confidence: number;
  originalValue?: any;
  suggestedValue?: any;
}

export function AnomalyDetection({ data, onAnomalyFound }: AnomalyDetectionProps) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (data.length > 0) {
      runAnomalyDetection();
    }
  }, [data]);

  const runAnomalyDetection = async () => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setAppliedSuggestions(new Set());
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const detectedAnomalies = detectAnomalies(data);
    setAnomalies(detectedAnomalies);
    setIsAnalyzing(false);
    setAnalysisComplete(true);
  };

  const detectAnomalies = (data: any[]): Anomaly[] => {
    const anomalies: Anomaly[] = [];
    
    if (!data.length) return anomalies;
    
    // 1. DETECT DUPLICATE IDs - This is critical!
    const idFields = ['ClientID', 'WorkerID', 'TaskID'];
    idFields.forEach(field => {
      if (data[0][field] !== undefined) {
        const seen = new Map<string, number[]>();
        
        data.forEach((row, index) => {
          const value = row[field];
          if (value) {
            if (!seen.has(value)) {
              seen.set(value, []);
            }
            seen.get(value)!.push(index);
          }
        });
        
        // Find duplicates
        seen.forEach((indices, value) => {
          if (indices.length > 1) {
            // Report all duplicate instances except the first one
            indices.slice(1).forEach(index => {
              anomalies.push({
                id: `duplicate-${field}-${index}`,
                type: 'duplicate',
                severity: 'high',
                field,
                row: index,
                description: `Duplicate ${field} "${value}" found (also appears in row ${indices[0] + 1})`,
                suggestion: `Generate unique ${field} or merge duplicate records`,
                confidence: 1.0,
                originalValue: value,
                suggestedValue: `${value}_${index + 1}` // Suggest making it unique
              });
            });
          }
        });
      }
    });

    // 2. Detect outliers in numeric fields
    const numericFields = ['PriorityLevel', 'MaxLoadPerPhase', 'Duration', 'MaxConcurrent'];
    
    numericFields.forEach(field => {
      if (data[0][field] !== undefined) {
        const values = data.map(row => parseFloat(row[field])).filter(v => !isNaN(v));
        if (values.length > 0) {
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
          
          data.forEach((row, index) => {
            const value = parseFloat(row[field]);
            if (!isNaN(value) && Math.abs(value - mean) > 2 * stdDev) {
              const suggestedValue = Math.round(mean);
              anomalies.push({
                id: `outlier-${field}-${index}`,
                type: 'outlier',
                severity: Math.abs(value - mean) > 3 * stdDev ? 'high' : 'medium',
                field,
                row: index,
                description: `${field} value ${value} is significantly different from the average (${mean.toFixed(2)})`,
                suggestion: `Consider reviewing this value. Suggested: ${suggestedValue}`,
                confidence: 0.85,
                originalValue: value,
                suggestedValue: suggestedValue
              });
            }
          });
        }
      }
    });

    // 3. Detect invalid JSON in AttributesJSON field (only if it looks like JSON)
    data.forEach((row, index) => {
      if (row.AttributesJSON && typeof row.AttributesJSON === 'string') {
        const value = row.AttributesJSON.trim();
        // Only validate JSON if it starts with { or [ (looks like JSON)
        if (value.startsWith('{') || value.startsWith('[')) {
          try {
            JSON.parse(value);
          } catch (error) {
            // Try to fix common JSON issues
            let fixedJson = value;
            
            // Fix unescaped quotes
            if (value.includes('"') && !value.match(/\\"/g)) {
              fixedJson = value.replace(/"/g, '\\"');
              fixedJson = `{"message":"${fixedJson}"}`;
            }
            
            anomalies.push({
              id: `json-${index}`,
              type: 'inconsistency',
              severity: 'high',
              field: 'AttributesJSON',
              row: index,
              description: `Invalid JSON format in AttributesJSON`,
              suggestion: `Fix JSON syntax errors`,
              confidence: 0.95,
              originalValue: value,
              suggestedValue: fixedJson
            });
          }
        }
      }
    });

    // 4. Detect malformed AvailableSlots (should be array format)
    data.forEach((row, index) => {
      if (row.AvailableSlots && typeof row.AvailableSlots === 'string') {
        const value = row.AvailableSlots.trim();
        // Should be in format [1,2,3] not "1,2,3"
        if (!value.match(/^\[[\d,\s]*\]$/)) {
          let suggestedValue = value;
          
          // If it's comma-separated numbers, convert to array format
          if (value.match(/^\d+(,\s*\d+)*$/)) {
            suggestedValue = `[${value}]`;
          }
          
          anomalies.push({
            id: `slots-${index}`,
            type: 'inconsistency',
            severity: 'high',
            field: 'AvailableSlots',
            row: index,
            description: `AvailableSlots should be in array format [1,2,3]`,
            suggestion: `Convert to proper array format`,
            confidence: 0.90,
            originalValue: value,
            suggestedValue: suggestedValue
          });
        }
      }
    });

    // 5. Detect unusual skill combinations (too many skills)
    data.forEach((row, index) => {
      if (row.Skills) {
        const skills = row.Skills.split(',').map((s: string) => s.trim());
        if (skills.length > 6) {
          const coreSkills = skills.slice(0, 4); // Keep top 4 skills
          const suggestedSkills = coreSkills.join(', ');
          
          anomalies.push({
            id: `pattern-skills-${index}`,
            type: 'pattern',
            severity: 'medium',
            field: 'Skills',
            row: index,
            description: `Worker has many skills (${skills.length}). Consider focusing on core competencies.`,
            suggestion: 'Focus on primary skills for better matching',
            confidence: 0.75,
            originalValue: row.Skills,
            suggestedValue: suggestedSkills
          });
        }
      }
    });

    // 6. Detect inconsistent ID formats
    data.forEach((row, index) => {
      const idFields = ['ClientID', 'WorkerID', 'TaskID'];
      idFields.forEach(field => {
        if (row[field]) {
          const value = row[field];
          const expectedPrefix = field.charAt(0); // C, W, or T
          
          // Check if ID follows expected format (more flexible - allows C1, C001, etc.)
          if (!value.match(new RegExp(`^${expectedPrefix}\\d+$`))) {
            anomalies.push({
              id: `id-format-${field}-${index}`,
              type: 'inconsistency',
              severity: 'medium',
              field,
              row: index,
              description: `${field} "${value}" doesn't follow expected format (${expectedPrefix}1, ${expectedPrefix}17, etc.)`,
              suggestion: `Use standard ID format: ${expectedPrefix}[number]`,
              confidence: 0.80,
              originalValue: value,
              suggestedValue: `${expectedPrefix}${index + 1}`
            });
          }
        }
      });
    });

    // 7. Detect empty or very short task lists
    data.forEach((row, index) => {
      if (row.RequestedTaskIDs && typeof row.RequestedTaskIDs === 'string') {
        const taskIds = row.RequestedTaskIDs.split(',').map((id: string) => id.trim()).filter((id: string) => id.length > 0);
        
        if (taskIds.length === 1) {
          anomalies.push({
            id: `single-task-${index}`,
            type: 'pattern',
            severity: 'low',
            field: 'RequestedTaskIDs',
            row: index,
            description: `Client has only one requested task. This might be unusual.`,
            suggestion: `Verify if client needs additional tasks`,
            confidence: 0.60,
            originalValue: row.RequestedTaskIDs,
            suggestedValue: row.RequestedTaskIDs // No change suggested, just flagging
          });
        }
      }
    });

    // 8. Detect missing or empty required fields
    data.forEach((row, index) => {
      const requiredFields = {
        'ClientID': 'Client ID is required',
        'ClientName': 'Client Name is required',
        'WorkerID': 'Worker ID is required', 
        'WorkerName': 'Worker Name is required',
        'TaskID': 'Task ID is required',
        'TaskName': 'Task Name is required'
      };

      Object.entries(requiredFields).forEach(([field, message]) => {
        if (row[field] !== undefined) { // Field exists in this entity type
          const value = row[field];
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            anomalies.push({
              id: `missing-${field}-${index}`,
              type: 'inconsistency',
              severity: 'high',
              field,
              row: index,
              description: message,
              suggestion: `Provide a valid ${field}`,
              confidence: 1.0,
              originalValue: value,
              suggestedValue: field.includes('ID') ? `${field.charAt(0)}${index + 1}` : `${field.replace('ID', '').replace('Name', '')} ${index + 1}`
            });
          }
        }
      });
    });

    return anomalies.slice(0, 10); // Limit to top 10 anomalies
  };

  const applySuggestion = (anomaly: Anomaly) => {
    // Mark this suggestion as applied
    setAppliedSuggestions(prev => new Set(Array.from(prev).concat(anomaly.id)));
    
    // Call the parent callback with the anomaly data
    onAnomalyFound({
      ...anomaly,
      action: 'apply',
      rowIndex: anomaly.row,
      fieldName: anomaly.field,
      newValue: anomaly.suggestedValue
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'outlier': return <TrendingUp className="h-4 w-4" />;
      case 'pattern': return <Brain className="h-4 w-4" />;
      case 'inconsistency': return <AlertCircle className="h-4 w-4" />;
      case 'duplicate': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'duplicate': return 'bg-red-100 text-red-800';
      case 'outlier': return 'bg-orange-100 text-orange-800';
      case 'pattern': return 'bg-purple-100 text-purple-800';
      case 'inconsistency': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="h-5 w-5 mr-2 text-purple-500" />
          AI Anomaly Detection
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAnalyzing && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">AI is analyzing your data...</p>
              <p className="text-xs text-gray-500 mt-1">Looking for duplicates, outliers, and inconsistencies</p>
            </div>
          </div>
        )}

        {analysisComplete && (
          <div className="space-y-4">
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                AI analysis complete! Found {anomalies.length} potential issues in your data.
                {anomalies.filter(a => a.type === 'duplicate').length > 0 && (
                  <span className="text-red-600 font-medium">
                    {' '}Including {anomalies.filter(a => a.type === 'duplicate').length} duplicate ID(s) that need immediate attention.
                  </span>
                )}
              </AlertDescription>
            </Alert>

            {anomalies.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-lg font-medium">Your data looks great!</p>
                <p className="text-sm text-gray-400 mt-1">No significant anomalies detected</p>
              </div>
            ) : (
              <div className="space-y-3">
                {anomalies.map((anomaly) => {
                  const isApplied = appliedSuggestions.has(anomaly.id);
                  
                  return (
                    <Card key={anomaly.id} className={`border-l-4 ${anomaly.type === 'duplicate' ? 'border-l-red-500' : 'border-l-purple-500'}`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(anomaly.type)}
                            <span className="font-medium">Row {anomaly.row + 1}</span>
                            <Badge variant="outline" className="text-xs">
                              {anomaly.field}
                            </Badge>
                            <Badge className={getTypeColor(anomaly.type)}>
                              {anomaly.type}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getSeverityColor(anomaly.severity)}>
                              {anomaly.severity}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(anomaly.confidence * 100)}% confidence
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">{anomaly.description}</p>
                        
                        {anomaly.originalValue !== undefined && anomaly.suggestedValue !== undefined && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-3 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="font-medium text-gray-600">Current:</span>
                                <div className="mt-1 p-2 bg-red-50 rounded border">
                                  {String(anomaly.originalValue)}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">AI Suggestion:</span>
                                <div className="mt-1 p-2 bg-green-50 rounded border">
                                  {String(anomaly.suggestedValue)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="bg-blue-50 p-3 rounded-lg mb-3">
                          <div className="flex items-start space-x-2">
                            <Sparkles className="h-4 w-4 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-blue-900">AI Recommendation:</p>
                              <p className="text-xs text-blue-700">{anomaly.suggestion}</p>
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant={isApplied ? "secondary" : "default"}
                          onClick={() => applySuggestion(anomaly)}
                          disabled={isApplied}
                          className="w-full"
                        >
                          {isApplied ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-2" />
                              Applied ✓
                            </>
                          ) : (
                            <>
                              <Zap className="h-3 w-3 mr-2" />
                              Apply One-Click Fix
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <Button
              variant="outline"
              onClick={runAnomalyDetection}
              className="w-full"
            >
              <Brain className="h-4 w-4 mr-2" />
              Re-analyze Data
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}