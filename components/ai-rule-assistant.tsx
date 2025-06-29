'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AIRuleAssistantProps {
  onRuleGenerated: (rule: any) => void;
}

export function AIRuleAssistant({ onRuleGenerated }: AIRuleAssistantProps) {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRule, setGeneratedRule] = useState<any>(null);

  const examplePrompts = [
    "Workers should not work more than 40 hours per week",
    "High priority clients get their tasks done first",
    "Tasks from the same client should be grouped together",
    "Senior workers should handle complex projects",
    "Urgent tasks must be completed within 24 hours",
    "Frontend developers should work on UI tasks",
    "No worker should have more than 3 tasks at once"
  ];

  const handleGenerate = async () => {
    if (!input.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate rule based on input
    const rule = generateRuleFromText(input);
    setGeneratedRule(rule);
    setIsGenerating(false);
  };

  const generateRuleFromText = (text: string): any => {
    // Enhanced AI simulation - in real implementation, this would use NLP
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('hours') && (lowerText.includes('week') || lowerText.includes('day'))) {
      const hours = lowerText.match(/(\d+)\s*hours?/)?.[1] || '40';
      const period = lowerText.includes('day') ? 'day' : 'week';
      
      return {
        name: `${period === 'week' ? 'Weekly' : 'Daily'} Hour Limit`,
        type: 'load_limit',
        priority: 'high',
        description: `Limit worker hours per ${period} to ${hours}`,
        conditions: [
          { field: `${period}ly_hours`, operator: 'less_than_or_equal', value: hours }
        ],
        action: 'prevent_assignment',
        explanation: `This rule ensures work-life balance by preventing workers from being assigned more than ${hours} hours per ${period}.`
      };
    }
    
    if (lowerText.includes('priority') && (lowerText.includes('first') || lowerText.includes('precedence'))) {
      return {
        name: 'Priority-Based Scheduling',
        type: 'precedence_override',
        priority: 'high',
        description: 'Prioritize high-priority client tasks in scheduling',
        conditions: [
          { field: 'client_priority', operator: 'greater_than_or_equal', value: '4' }
        ],
        action: 'increase_priority',
        explanation: 'Tasks from clients with priority level 4 or 5 will be scheduled before lower priority tasks.'
      };
    }
    
    if (lowerText.includes('client') && lowerText.includes('group')) {
      return {
        name: 'Client Task Grouping',
        type: 'co_run_group',
        priority: 'medium',
        description: 'Group tasks from the same client together',
        conditions: [
          { field: 'client_id', operator: 'equals', value: 'same' }
        ],
        action: 'group_tasks',
        explanation: 'Tasks from the same client will be scheduled together to improve efficiency and communication.'
      };
    }
    
    if (lowerText.includes('senior') && (lowerText.includes('complex') || lowerText.includes('difficult'))) {
      return {
        name: 'Senior Worker Assignment',
        type: 'skill_match',
        priority: 'medium',
        description: 'Assign complex tasks to senior workers',
        conditions: [
          { field: 'worker_qualification', operator: 'equals', value: 'senior' },
          { field: 'task_complexity', operator: 'greater_than', value: '3' }
        ],
        action: 'preferred_assignment',
        explanation: 'Complex or difficult tasks will be preferentially assigned to workers with senior qualification level.'
      };
    }
    
    if (lowerText.includes('urgent') && lowerText.includes('24')) {
      return {
        name: 'Urgent Task Deadline',
        type: 'phase_window',
        priority: 'critical',
        description: 'Complete urgent tasks within 24 hours',
        conditions: [
          { field: 'task_urgency', operator: 'equals', value: 'urgent' }
        ],
        action: 'deadline_constraint',
        explanation: 'Tasks marked as urgent must be completed within 24 hours of assignment.'
      };
    }
    
    if (lowerText.includes('frontend') && lowerText.includes('ui')) {
      return {
        name: 'Frontend Developer UI Assignment',
        type: 'skill_match',
        priority: 'medium',
        description: 'Assign UI tasks to frontend developers',
        conditions: [
          { field: 'worker_skills', operator: 'contains', value: 'frontend' },
          { field: 'task_category', operator: 'equals', value: 'ui' }
        ],
        action: 'skill_based_assignment',
        explanation: 'UI and frontend tasks will be assigned to workers with frontend development skills.'
      };
    }
    
    if (lowerText.includes('3 tasks') || lowerText.includes('three tasks')) {
      return {
        name: 'Maximum Concurrent Tasks',
        type: 'load_limit',
        priority: 'medium',
        description: 'Limit workers to maximum 3 concurrent tasks',
        conditions: [
          { field: 'concurrent_tasks', operator: 'less_than_or_equal', value: '3' }
        ],
        action: 'prevent_assignment',
        explanation: 'Workers cannot be assigned more than 3 tasks at the same time to maintain quality and focus.'
      };
    }
    
    // Default rule for unrecognized patterns
    return {
      name: 'Custom Business Rule',
      type: 'pattern_match',
      priority: 'medium',
      description: input.length > 100 ? input.substring(0, 100) + '...' : input,
      conditions: [
        { field: 'custom_condition', operator: 'matches', value: 'user_defined' }
      ],
      action: 'apply_custom_logic',
      explanation: 'This is a custom rule based on your specific requirements. You may need to refine the conditions and actions.'
    };
  };

  const handleAcceptRule = () => {
    if (generatedRule) {
      onRuleGenerated(generatedRule);
      setGeneratedRule(null);
      setInput('');
    }
  };

  const handleTryExample = (example: string) => {
    setInput(example);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="text-blue-500 mr-2">🚀</span>
          AI Rule Assistant
        </CardTitle>
        <p className="text-sm text-gray-600">
          Describe your business rule in plain English and AI will convert it to a structured rule
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="Example: 'Workers should not work more than 40 hours per week' or 'High priority clients get their tasks done first'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <Button 
          onClick={handleGenerate}
          disabled={!input.trim() || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              AI is thinking...
            </>
          ) : (
            <>
              <span className="mr-2">🛠️</span>
              Convert to Rule
            </>
          )}
        </Button>

        {generatedRule && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✅</span>
                  <h4 className="font-medium text-green-900">{generatedRule.name}</h4>
                </div>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {generatedRule.type}
                </Badge>
              </div>
              
              <p className="text-sm text-green-700 mb-3">{generatedRule.description}</p>
              
              {generatedRule.explanation && (
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500 mr-2">💡</span>
                    <div>
                      <p className="text-xs font-medium text-blue-900">How this works:</p>
                      <p className="text-xs text-blue-700">{generatedRule.explanation}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2 mb-4">
                <h5 className="text-xs font-medium text-green-800">Conditions:</h5>
                {generatedRule.conditions.map((condition: any, index: number) => (
                  <div key={index} className="text-xs text-green-600 bg-white p-2 rounded">
                    <code>{condition.field} {condition.operator} {condition.value}</code>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <Button size="sm" onClick={handleAcceptRule} className="flex-1">
                  <span className="mr-2">✅</span>
                  Add This Rule
                </Button>
                <Button size="sm" variant="outline" onClick={() => setGeneratedRule(null)}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3 text-sm flex items-center">
            <span className="text-blue-500 mr-2">🚀</span>
            Try These Examples:
          </h4>
          <div className="space-y-2">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleTryExample(prompt)}
                className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded block text-left w-full transition-colors"
              >
                💡 {prompt}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}