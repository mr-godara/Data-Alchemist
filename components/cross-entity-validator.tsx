'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, AlertTriangle, RefreshCw, Network, Users, Briefcase, FileSpreadsheet } from 'lucide-react';

interface CrossEntityValidatorProps {
  clientsData: any[];
  workersData: any[];
  tasksData: any[];
  onValidationComplete: (results: any[]) => void;
}

interface ValidationResult {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'client-task' | 'task-worker' | 'worker-phase' | 'priority' | 'coverage';
  entity: string;
  row: number;
  field: string;
  message: string;
  suggestion?: string;
  relatedEntities?: string[];
}

export function CrossEntityValidator({ 
  clientsData, 
  workersData, 
  tasksData, 
  onValidationComplete 
}: CrossEntityValidatorProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [validationComplete, setValidationComplete] = useState(false);

  useEffect(() => {
    if (clientsData.length > 0 || workersData.length > 0 || tasksData.length > 0) {
      runCrossEntityValidation();
    }
  }, [clientsData, workersData, tasksData]);

  const runCrossEntityValidation = async () => {
    setIsValidating(true);
    setProgress(0);
    setValidationComplete(false);
    
    const allResults: ValidationResult[] = [];
    
    // Step 1: Validate Client → Task relationships
    setProgress(20);
    await new Promise(resolve => setTimeout(resolve, 500));
    const clientTaskResults = validateClientTaskRelationships(clientsData, tasksData);
    allResults.push(...clientTaskResults);
    
    // Step 2: Validate Task → Worker skill coverage
    setProgress(40);
    await new Promise(resolve => setTimeout(resolve, 500));
    const taskWorkerResults = validateTaskWorkerSkillCoverage(tasksData, workersData);
    allResults.push(...taskWorkerResults);
    
    // Step 3: Validate Worker → Phase availability
    setProgress(60);
    await new Promise(resolve => setTimeout(resolve, 500));
    const workerPhaseResults = validateWorkerPhaseAvailability(workersData, tasksData);
    allResults.push(...workerPhaseResults);
    
    // Step 4: Validate Priority Level distribution
    setProgress(80);
    await new Promise(resolve => setTimeout(resolve, 500));
    const priorityResults = validatePriorityDistribution(clientsData);
    allResults.push(...priorityResults);
    
    // Step 5: Validate PreferredPhases normalization
    setProgress(100);
    await new Promise(resolve => setTimeout(resolve, 500));
    const phaseResults = validatePreferredPhasesNormalization(tasksData);
    allResults.push(...phaseResults);
    
    setResults(allResults);
    setIsValidating(false);
    setValidationComplete(true);
    onValidationComplete(allResults);
  };

  const validateClientTaskRelationships = (clients: any[], tasks: any[]): ValidationResult[] => {
    const results: ValidationResult[] = [];
    const taskIds = new Set(tasks.map(task => task.TaskID));
    
    clients.forEach((client, index) => {
      if (client.RequestedTaskIDs) {
        const requestedTasks = client.RequestedTaskIDs.split(',').map((id: string) => id.trim());
        
        requestedTasks.forEach((taskId: string) => {
          if (taskId && !taskIds.has(taskId)) {
            results.push({
              id: `client-task-${index}-${taskId}`,
              type: 'error',
              category: 'client-task',
              entity: 'clients',
              row: index,
              field: 'RequestedTaskIDs',
              message: `Client "${client.ClientName}" requests non-existent task "${taskId}"`,
              suggestion: `Remove "${taskId}" or ensure task exists in tasks dataset`,
              relatedEntities: ['tasks']
            });
          }
        });
        
        // Check for empty task requests
        if (requestedTasks.length === 0 || (requestedTasks.length === 1 && !requestedTasks[0])) {
          results.push({
            id: `client-empty-tasks-${index}`,
            type: 'warning',
            category: 'client-task',
            entity: 'clients',
            row: index,
            field: 'RequestedTaskIDs',
            message: `Client "${client.ClientName}" has no requested tasks`,
            suggestion: 'Assign at least one task to this client'
          });
        }
        
        // Check for excessive task requests (potential overload)
        if (requestedTasks.length > 10) {
          results.push({
            id: `client-many-tasks-${index}`,
            type: 'warning',
            category: 'client-task',
            entity: 'clients',
            row: index,
            field: 'RequestedTaskIDs',
            message: `Client "${client.ClientName}" requests ${requestedTasks.length} tasks (potentially excessive)`,
            suggestion: 'Consider splitting into multiple phases or clients'
          });
        }
      }
    });
    
    return results;
  };

  const validateTaskWorkerSkillCoverage = (tasks: any[], workers: any[]): ValidationResult[] => {
    const results: ValidationResult[] = [];
    
    // Collect all worker skills
    const allWorkerSkills = new Set<string>();
    workers.forEach((worker: any) => {
      if (worker.Skills) {
        const skills = worker.Skills.split(',').map((skill: string) => skill.trim());
        skills.forEach((skill: string) => allWorkerSkills.add(skill));
      }
    });
    
    tasks.forEach((task: any, index: number) => {
      if (task.RequiredSkills) {
        const requiredSkills = task.RequiredSkills.split(',').map((skill: string) => skill.trim());
        const missingSkills: string[] = [];
        
        requiredSkills.forEach((skill: string) => {
          if (skill && !allWorkerSkills.has(skill)) {
            missingSkills.push(skill);
          }
        });
        
        if (missingSkills.length > 0) {
          results.push({
            id: `task-skill-coverage-${index}`,
            type: 'error',
            category: 'task-worker',
            entity: 'tasks',
            row: index,
            field: 'RequiredSkills',
            message: `Task "${task.TaskName}" requires skills not available in worker pool: ${missingSkills.join(', ')}`,
            suggestion: `Add workers with skills: ${missingSkills.join(', ')} or modify task requirements`,
            relatedEntities: ['workers']
          });
        }
        
        // Check for skill redundancy (too many workers with same skill)
        requiredSkills.forEach((skill: string) => {
          const workersWithSkill = workers.filter(worker => 
            worker.Skills && worker.Skills.includes(skill)
          ).length;
          
          if (workersWithSkill > 5) {
            results.push({
              id: `skill-redundancy-${index}-${skill}`,
              type: 'info',
              category: 'task-worker',
              entity: 'tasks',
              row: index,
              field: 'RequiredSkills',
              message: `Skill "${skill}" is available in ${workersWithSkill} workers (high redundancy)`,
              suggestion: 'Consider diversifying worker skills or optimizing assignments'
            });
          }
        });
      }
    });
    
    return results;
  };

  const validateWorkerPhaseAvailability = (workers: any[], tasks: any[]): ValidationResult[] => {
    const results: ValidationResult[] = [];
    
    workers.forEach((worker: any, index: number) => {
      if (worker.AvailableSlots) {
        try {
          const availableSlots = JSON.parse(worker.AvailableSlots);
          
          if (!Array.isArray(availableSlots)) {
            results.push({
              id: `worker-slots-format-${index}`,
              type: 'error',
              category: 'worker-phase',
              entity: 'workers',
              row: index,
              field: 'AvailableSlots',
              message: `Worker "${worker.WorkerName}" has invalid AvailableSlots format`,
              suggestion: 'Use array format: [1,2,3,4,5]'
            });
            return;
          }
          
          // Check for invalid phase numbers
          const invalidSlots = availableSlots.filter(slot => 
            typeof slot !== 'number' || slot < 1 || slot > 10
          );
          
          if (invalidSlots.length > 0) {
            results.push({
              id: `worker-invalid-slots-${index}`,
              type: 'warning',
              category: 'worker-phase',
              entity: 'workers',
              row: index,
              field: 'AvailableSlots',
              message: `Worker "${worker.WorkerName}" has invalid phase numbers: ${invalidSlots.join(', ')}`,
              suggestion: 'Use phase numbers between 1-10'
            });
          }
          
          // Check for very limited availability
          if (availableSlots.length < 2) {
            results.push({
              id: `worker-limited-availability-${index}`,
              type: 'warning',
              category: 'worker-phase',
              entity: 'workers',
              row: index,
              field: 'AvailableSlots',
              message: `Worker "${worker.WorkerName}" has very limited availability (${availableSlots.length} phase${availableSlots.length === 1 ? '' : 's'})`,
              suggestion: 'Consider expanding worker availability or adjusting workload'
            });
          }
          
        } catch (error) {
          results.push({
            id: `worker-slots-parse-${index}`,
            type: 'error',
            category: 'worker-phase',
            entity: 'workers',
            row: index,
            field: 'AvailableSlots',
            message: `Worker "${worker.WorkerName}" has unparseable AvailableSlots`,
            suggestion: 'Fix JSON format: [1,2,3,4,5]'
          });
        }
      }
      
      // Validate MaxLoadPerPhase against task requirements
      if (worker.MaxLoadPerPhase) {
        const maxLoad = parseInt(worker.MaxLoadPerPhase);
        if (maxLoad > 15) {
          results.push({
            id: `worker-overload-${index}`,
            type: 'warning',
            category: 'worker-phase',
            entity: 'workers',
            row: index,
            field: 'MaxLoadPerPhase',
            message: `Worker "${worker.WorkerName}" may be overloaded with ${maxLoad} tasks per phase`,
            suggestion: 'Consider reducing load or adding more workers'
          });
        }
      }
    });
    
    return results;
  };

  const validatePriorityDistribution = (clients: any[]): ValidationResult[] => {
    const results: ValidationResult[] = [];
    
    const priorityCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    clients.forEach(client => {
      const priority = parseInt(client.PriorityLevel);
      if (priority >= 1 && priority <= 5) {
        priorityCounts[priority as keyof typeof priorityCounts]++;
      }
    });
    
    const totalClients = clients.length;
    const highPriorityClients = priorityCounts[4] + priorityCounts[5];
    const highPriorityPercentage = (highPriorityClients / totalClients) * 100;
    
    if (highPriorityPercentage > 60) {
      results.push({
        id: 'priority-distribution-high',
        type: 'warning',
        category: 'priority',
        entity: 'clients',
        row: -1,
        field: 'PriorityLevel',
        message: `${highPriorityPercentage.toFixed(1)}% of clients have high priority (4-5). This may impact scheduling efficiency.`,
        suggestion: 'Review priority assignments to ensure balanced workload distribution'
      });
    }
    
    if (priorityCounts[5] === 0) {
      results.push({
        id: 'priority-no-critical',
        type: 'info',
        category: 'priority',
        entity: 'clients',
        row: -1,
        field: 'PriorityLevel',
        message: 'No clients have critical priority (5). Consider if any clients need urgent attention.',
        suggestion: 'Review if any clients should have critical priority'
      });
    }
    
    return results;
  };

  const validatePreferredPhasesNormalization = (tasks: any[]): ValidationResult[] => {
    const results: ValidationResult[] = [];
    
    tasks.forEach((task: any, index: number) => {
      if (task.PreferredPhases) {
        const phases = task.PreferredPhases;
        
        // Check range format (e.g., "1-3")
        const rangeMatch = phases.match(/^(\d+)-(\d+)$/);
        if (rangeMatch) {
          const start = parseInt(rangeMatch[1]);
          const end = parseInt(rangeMatch[2]);
          
          if (start > end) {
            results.push({
              id: `task-phase-range-invalid-${index}`,
              type: 'error',
              category: 'coverage',
              entity: 'tasks',
              row: index,
              field: 'PreferredPhases',
              message: `Task "${task.TaskName}" has invalid phase range: ${phases} (start > end)`,
              suggestion: `Use valid range format like "1-${end}" or "${end}-${start}"`
            });
          }
          
          if (task.Duration && (end - start + 1) < parseInt(task.Duration)) {
            results.push({
              id: `task-phase-duration-mismatch-${index}`,
              type: 'warning',
              category: 'coverage',
              entity: 'tasks',
              row: index,
              field: 'PreferredPhases',
              message: `Task "${task.TaskName}" preferred phases (${end - start + 1}) less than duration (${task.Duration})`,
              suggestion: `Extend phase range to accommodate duration of ${task.Duration} phases`
            });
          }
        }
        
        // Check array format (e.g., "[1,2,3]")
        else if (phases.startsWith('[') && phases.endsWith(']')) {
          try {
            const phaseArray = JSON.parse(phases);
            if (!Array.isArray(phaseArray)) {
              results.push({
                id: `task-phase-array-invalid-${index}`,
                type: 'error',
                category: 'coverage',
                entity: 'tasks',
                row: index,
                field: 'PreferredPhases',
                message: `Task "${task.TaskName}" has invalid phase array format`,
                suggestion: 'Use array format: [1,2,3] or range format: "1-3"'
              });
            } else {
              const invalidPhases = phaseArray.filter(p => typeof p !== 'number' || p < 1 || p > 10);
              if (invalidPhases.length > 0) {
                results.push({
                  id: `task-phase-numbers-invalid-${index}`,
                  type: 'warning',
                  category: 'coverage',
                  entity: 'tasks',
                  row: index,
                  field: 'PreferredPhases',
                  message: `Task "${task.TaskName}" has invalid phase numbers: ${invalidPhases.join(', ')}`,
                  suggestion: 'Use phase numbers between 1-10'
                });
              }
            }
          } catch (error) {
            results.push({
              id: `task-phase-parse-error-${index}`,
              type: 'error',
              category: 'coverage',
              entity: 'tasks',
              row: index,
              field: 'PreferredPhases',
              message: `Task "${task.TaskName}" has unparseable PreferredPhases`,
              suggestion: 'Use valid format: [1,2,3] or "1-3"'
            });
          }
        }
        
        // Invalid format
        else {
          results.push({
            id: `task-phase-format-invalid-${index}`,
            type: 'error',
            category: 'coverage',
            entity: 'tasks',
            row: index,
            field: 'PreferredPhases',
            message: `Task "${task.TaskName}" has invalid PreferredPhases format: ${phases}`,
            suggestion: 'Use range format "1-3" or array format [1,2,3]'
          });
        }
      }
    });
    
    return results;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'client-task': return <Users className="h-4 w-4" />;
      case 'task-worker': return <Briefcase className="h-4 w-4" />;
      case 'worker-phase': return <FileSpreadsheet className="h-4 w-4" />;
      case 'priority': return <AlertTriangle className="h-4 w-4" />;
      case 'coverage': return <Network className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'client-task': return 'bg-blue-100 text-blue-800';
      case 'task-worker': return 'bg-green-100 text-green-800';
      case 'worker-phase': return 'bg-purple-100 text-purple-800';
      case 'priority': return 'bg-orange-100 text-orange-800';
      case 'coverage': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const errorCount = results.filter(r => r.type === 'error').length;
  const warningCount = results.filter(r => r.type === 'warning').length;
  const infoCount = results.filter(r => r.type === 'info').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Network className="h-5 w-5 mr-2 text-blue-500" />
            Cross-Entity Relationship Validation
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={runCrossEntityValidation}
            disabled={isValidating}
          >
            {isValidating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Validate Relationships
          </Button>
        </div>
        
        {isValidating && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600">Validating data relationships...</p>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {validationComplete && (
          <div className="space-y-4">
            <Alert>
              <Network className="h-4 w-4" />
              <AlertDescription>
                Cross-entity validation complete. Found {results.length} relationship issues across {clientsData.length} clients, {workersData.length} workers, and {tasksData.length} tasks.
              </AlertDescription>
            </Alert>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-3 bg-red-50 rounded">
                <p className="text-lg font-bold text-red-600">{errorCount}</p>
                <p className="text-xs text-red-600">Errors</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded">
                <p className="text-lg font-bold text-yellow-600">{warningCount}</p>
                <p className="text-xs text-yellow-600">Warnings</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded">
                <p className="text-lg font-bold text-blue-600">{infoCount}</p>
                <p className="text-xs text-blue-600">Info</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <p className="text-lg font-bold text-green-600">{Math.max(0, 100 - results.length)}</p>
                <p className="text-xs text-green-600">Health Score</p>
              </div>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Network className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>All entity relationships are valid!</p>
                <p className="text-sm text-gray-400 mt-1">Your data is properly connected.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.map((result) => (
                  <div key={result.id} className="p-3 border rounded-lg bg-white hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(result.type)}
                        <Badge className={getCategoryColor(result.category)}>
                          <div className="flex items-center space-x-1">
                            {getCategoryIcon(result.category)}
                            <span>{result.category}</span>
                          </div>
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {result.entity}
                        </Badge>
                        {result.row >= 0 && (
                          <Badge variant="outline" className="text-xs">
                            Row {result.row + 1}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-900 mb-1">{result.message}</p>
                    
                    {result.suggestion && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                        <p className="text-blue-700"><strong>Suggestion:</strong> {result.suggestion}</p>
                      </div>
                    )}
                    
                    {result.relatedEntities && result.relatedEntities.length > 0 && (
                      <div className="mt-2 flex items-center space-x-1">
                        <span className="text-xs text-gray-500">Related:</span>
                        {result.relatedEntities.map(entity => (
                          <Badge key={entity} variant="secondary" className="text-xs">
                            {entity}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}