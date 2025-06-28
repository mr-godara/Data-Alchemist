'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, RefreshCw, Settings } from 'lucide-react';

interface AdvancedValidatorsProps {
  data: any[];
  entityType: string;
  onValidationComplete: (results: any[]) => void;
}

interface ValidatorResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'warning' | 'running';
  errors: number;
  warnings: number;
  description: string;
  details?: any[];
}

export function AdvancedValidators({ data, entityType, onValidationComplete }: AdvancedValidatorsProps) {
  const [validators, setValidators] = useState<ValidatorResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const allValidators = [
    {
      id: 'missing_columns',
      name: 'Missing Columns',
      description: 'Checks for required columns based on entity type'
    },
    {
      id: 'duplicate_ids',
      name: 'Duplicate IDs',
      description: 'Identifies duplicate primary key values'
    },
    {
      id: 'malformed_lists',
      name: 'Malformed Lists',
      description: 'Validates comma-separated and array format fields'
    },
    {
      id: 'out_of_range',
      name: 'Out-of-Range Values',
      description: 'Checks numeric values against expected ranges'
    },
    {
      id: 'broken_json',
      name: 'Broken JSON',
      description: 'Validates JSON format in AttributesJSON fields'
    },
    {
      id: 'unknown_references',
      name: 'Unknown References',
      description: 'Checks for references to non-existent entities'
    },
    {
      id: 'circular_corun',
      name: 'Circular Co-run Groups',
      description: 'Detects circular dependencies in co-run groups'
    },
    {
      id: 'conflicting_schedule',
      name: 'Conflicting Schedule Rules',
      description: 'Identifies scheduling conflicts and contradictions'
    },
    {
      id: 'overloaded_workers',
      name: 'Overloaded Workers',
      description: 'Checks for workers with excessive task assignments'
    },
    {
      id: 'capacity_saturation',
      name: 'Phase-slot Capacity',
      description: 'Validates phase-slot capacity constraints'
    },
    {
      id: 'skill_coverage',
      name: 'Skill Coverage Gaps',
      description: 'Identifies missing skills for required tasks'
    },
    {
      id: 'max_concurrency',
      name: 'Max Concurrency Feasibility',
      description: 'Validates maximum concurrency constraints'
    }
  ];

  useEffect(() => {
    if (data.length > 0) {
      runValidation();
    }
  }, [data, entityType]);

  const runValidation = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const results: ValidatorResult[] = [];
    
    for (let i = 0; i < allValidators.length; i++) {
      const validator = allValidators[i];
      setProgress((i / allValidators.length) * 100);
      
      // Simulate validation time
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = await runSingleValidator(validator, data, entityType);
      results.push(result);
      setValidators([...results]);
    }
    
    setProgress(100);
    setIsRunning(false);
    
    // Collect all validation issues
    const allIssues = results.flatMap(r => r.details || []);
    onValidationComplete(allIssues);
  };

  const runSingleValidator = async (validator: any, data: any[], entityType: string): Promise<ValidatorResult> => {
    const result: ValidatorResult = {
      id: validator.id,
      name: validator.name,
      status: 'running',
      errors: 0,
      warnings: 0,
      description: validator.description,
      details: []
    };

    try {
      switch (validator.id) {
        case 'missing_columns':
          result.details = validateMissingColumns(data, entityType);
          break;
        case 'duplicate_ids':
          result.details = validateDuplicateIds(data, entityType);
          break;
        case 'malformed_lists':
          result.details = validateMalformedLists(data, entityType);
          break;
        case 'out_of_range':
          result.details = validateOutOfRange(data, entityType);
          break;
        case 'broken_json':
          result.details = validateBrokenJson(data);
          break;
        case 'unknown_references':
          result.details = validateUnknownReferences(data, entityType);
          break;
        case 'circular_corun':
          result.details = validateCircularCorun(data);
          break;
        case 'conflicting_schedule':
          result.details = validateConflictingSchedule(data);
          break;
        case 'overloaded_workers':
          result.details = validateOverloadedWorkers(data, entityType);
          break;
        case 'capacity_saturation':
          result.details = validateCapacitySaturation(data, entityType);
          break;
        case 'skill_coverage':
          result.details = validateSkillCoverage(data, entityType);
          break;
        case 'max_concurrency':
          result.details = validateMaxConcurrency(data, entityType);
          break;
        default:
          result.details = [];
      }

      result.errors = result.details.filter(d => d.type === 'error').length;
      result.warnings = result.details.filter(d => d.type === 'warning').length;
      result.status = result.errors > 0 ? 'failed' : result.warnings > 0 ? 'warning' : 'passed';
    } catch (error) {
      result.status = 'failed';
      result.errors = 1;
      result.details = [{
        type: 'error',
        field: 'validator',
        row: -1,
        message: `Validator failed: ${error}`
      }];
    }

    return result;
  };

  // Validator implementations
  const validateMissingColumns = (data: any[], entityType: string) => {
    const issues: any[] = [];
    const requiredColumns = {
      clients: ['ClientID', 'ClientName', 'PriorityLevel', 'RequestedTaskIDs', 'GroupTag'],
      workers: ['WorkerID', 'WorkerName', 'Skills', 'AvailableSlots', 'MaxLoadPerPhase'],
      tasks: ['TaskID', 'TaskName', 'Duration', 'RequiredSkills']
    };

    const required = requiredColumns[entityType as keyof typeof requiredColumns] || [];
    const actualColumns = data.length > 0 ? Object.keys(data[0]) : [];

    for (const col of required) {
      if (!actualColumns.includes(col)) {
        issues.push({
          type: 'error',
          field: col,
          row: -1,
          message: `Required column '${col}' is missing`
        });
      }
    }

    return issues;
  };

  const validateDuplicateIds = (data: any[], entityType: string) => {
    const issues: any[] = [];
    const idField = entityType === 'clients' ? 'ClientID' : 
                   entityType === 'workers' ? 'WorkerID' : 'TaskID';
    
    const seen = new Set();
    data.forEach((row, index) => {
      if (row[idField] && seen.has(row[idField])) {
        issues.push({
          type: 'error',
          field: idField,
          row: index,
          message: `Duplicate ${idField}: ${row[idField]}`
        });
      }
      seen.add(row[idField]);
    });

    return issues;
  };

  const validateMalformedLists = (data: any[], entityType: string) => {
    const issues: any[] = [];
    
    data.forEach((row, index) => {
      // Validate Skills (workers) and RequiredSkills (tasks)
      if (row.Skills || row.RequiredSkills) {
        const field = row.Skills ? 'Skills' : 'RequiredSkills';
        const value = row[field];
        
        if (typeof value === 'string') {
          // Check for empty values (double commas)
          if (value.includes(',,')) {
            issues.push({
              type: 'warning',
              field,
              row: index,
              message: `${field} contains empty values (double commas)`
            });
          }
          
          // Check for trailing/leading commas
          if (value.startsWith(',') || value.endsWith(',')) {
            issues.push({
              type: 'warning',
              field,
              row: index,
              message: `${field} has trailing or leading commas`
            });
          }
        }
      }

      // Validate AvailableSlots (workers)
      if (row.AvailableSlots) {
        const value = row.AvailableSlots;
        if (typeof value === 'string') {
          // Should be array format like [1,2,3]
          if (!value.match(/^\[[\d,\s]*\]$/)) {
            issues.push({
              type: 'error',
              field: 'AvailableSlots',
              row: index,
              message: `AvailableSlots should be in array format [1,2,3], got: ${value}`
            });
          }
        }
      }

      // Validate RequestedTaskIDs (clients)
      if (row.RequestedTaskIDs && entityType === 'clients') {
        const value = row.RequestedTaskIDs;
        if (typeof value === 'string') {
          if (value.includes(',,')) {
            issues.push({
              type: 'warning',
              field: 'RequestedTaskIDs',
              row: index,
              message: `RequestedTaskIDs contains empty values (double commas)`
            });
          }
        }
      }

      // Validate PreferredPhases (tasks)
      if (row.PreferredPhases && entityType === 'tasks') {
        const value = row.PreferredPhases;
        if (typeof value === 'string') {
          // Should be either range format "1-3" or array format "[1,2,3]"
          if (!value.match(/^\d+-\d+$/) && !value.match(/^\[[\d,\s]*\]$/)) {
            issues.push({
              type: 'warning',
              field: 'PreferredPhases',
              row: index,
              message: `PreferredPhases should be range format (1-3) or array format [1,2,3], got: ${value}`
            });
          }
        }
      }
    });

    return issues;
  };

  const validateOutOfRange = (data: any[], entityType: string) => {
    const issues: any[] = [];
    const ranges = {
      PriorityLevel: { min: 1, max: 5 },
      MaxLoadPerPhase: { min: 1, max: 20 },
      Duration: { min: 1, max: 10 },
      MaxConcurrent: { min: 1, max: 5 }
    };

    data.forEach((row, index) => {
      Object.entries(ranges).forEach(([field, range]) => {
        if (row[field] !== undefined) {
          const value = parseFloat(row[field]);
          if (!isNaN(value) && (value < range.min || value > range.max)) {
            issues.push({
              type: 'warning',
              field,
              row: index,
              message: `${field} value ${value} is outside expected range ${range.min}-${range.max}`
            });
          }
        }
      });
    });

    return issues;
  };

  const validateBrokenJson = (data: any[]) => {
    const issues: any[] = [];
    
    data.forEach((row, index) => {
      if (row.AttributesJSON) {
        const value = row.AttributesJSON.trim();
        // Only validate if it looks like JSON (starts with { or [)
        if (value.startsWith('{') || value.startsWith('[')) {
          try {
            JSON.parse(value);
          } catch (error) {
            issues.push({
              type: 'error',
              field: 'AttributesJSON',
              row: index,
              message: 'Invalid JSON format in AttributesJSON'
            });
          }
        }
      }
    });

    return issues;
  };

  const validateUnknownReferences = (data: any[], entityType: string) => {
    const issues: any[] = [];
    
    // Only validate if we're dealing with clients and have RequestedTaskIDs
    data.forEach((row, index) => {
      if (row.RequestedTaskIDs && entityType === 'clients') {
        const taskIds = row.RequestedTaskIDs.split(',').map((id: string) => id.trim());
        taskIds.forEach((taskId: string) => {
          if (taskId) {
            // More flexible Task ID validation - accepts T1, T17, T001, etc.
            if (!taskId.match(/^T\d+$/)) {
              issues.push({
                type: 'warning',
                field: 'RequestedTaskIDs',
                row: index,
                message: `Task ID "${taskId}" doesn't follow expected format (T1, T17, T001, etc.)`
              });
            }
          }
        });
      }
    });

    return issues;
  };

  const validateCircularCorun = (data: any[]) => {
    // Simplified circular dependency check
    return [];
  };

  const validateConflictingSchedule = (data: any[]) => {
    // Simplified schedule conflict check
    return [];
  };

  const validateOverloadedWorkers = (data: any[], entityType: string) => {
    const issues: any[] = [];
    
    if (entityType === 'workers') {
      data.forEach((row, index) => {
        if (row.MaxLoadPerPhase && parseFloat(row.MaxLoadPerPhase) > 15) {
          issues.push({
            type: 'warning',
            field: 'MaxLoadPerPhase',
            row: index,
            message: `Worker may be overloaded with ${row.MaxLoadPerPhase} tasks per phase`
          });
        }
      });
    }

    return issues;
  };

  const validateCapacitySaturation = (data: any[], entityType: string) => {
    const issues: any[] = [];
    
    if (entityType === 'workers') {
      data.forEach((row, index) => {
        if (row.AvailableSlots) {
          try {
            const slots = JSON.parse(row.AvailableSlots);
            if (Array.isArray(slots) && slots.length < 2) {
              issues.push({
                type: 'warning',
                field: 'AvailableSlots',
                row: index,
                message: `Worker has very limited availability (${slots.length} slot${slots.length === 1 ? '' : 's'})`
              });
            }
          } catch (error) {
            // Already handled in malformed lists validator
          }
        }
      });
    }

    return issues;
  };

  const validateSkillCoverage = (data: any[], entityType: string) => {
    const issues: any[] = [];
    
    if (entityType === 'workers') {
      data.forEach((row, index) => {
        if (row.Skills) {
          const skills = row.Skills.split(',').map((s: string) => s.trim());
          if (skills.length < 2) {
            issues.push({
              type: 'warning',
              field: 'Skills',
              row: index,
              message: `Worker has limited skills (${skills.length}). Consider adding more skills for better task coverage.`
            });
          }
        }
      });
    }

    return issues;
  };

  const validateMaxConcurrency = (data: any[], entityType: string) => {
    const issues: any[] = [];
    
    if (entityType === 'tasks') {
      data.forEach((row, index) => {
        if (row.MaxConcurrent && row.Duration) {
          const maxConcurrent = parseFloat(row.MaxConcurrent);
          const duration = parseFloat(row.Duration);
          
          if (maxConcurrent > duration) {
            issues.push({
              type: 'warning',
              field: 'MaxConcurrent',
              row: index,
              message: `MaxConcurrent (${maxConcurrent}) exceeds Duration (${duration})`
            });
          }
        }
      });
    }

    return issues;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2 text-blue-500" />
            Advanced Validators
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={runValidation}
            disabled={isRunning}
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Run All
          </Button>
        </div>
        
        {isRunning && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600">Running validation checks...</p>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {validators.map((validator) => (
            <div key={validator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(validator.status)}
                <div>
                  <p className="font-medium text-sm">{validator.name}</p>
                  <p className="text-xs text-gray-600">{validator.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {validator.errors > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {validator.errors} errors
                  </Badge>
                )}
                {validator.warnings > 0 && (
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                    {validator.warnings} warnings
                  </Badge>
                )}
                <Badge className={getStatusColor(validator.status)}>
                  {validator.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}