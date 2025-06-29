'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RuleBuilderProps {
  onAddRule: (rule: any) => void;
}

export function RuleBuilder({ onAddRule }: RuleBuilderProps) {
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [ruleType, setRuleType] = useState('');
  const [priority, setPriority] = useState('medium');
  const [conditions, setConditions] = useState<Array<{ field: string; operator: string; value: string }>>([]);

  const ruleTypes = [
    { value: 'co_run_group', label: 'Co-run Group' },
    { value: 'slot_restriction', label: 'Slot Restriction' },
    { value: 'load_limit', label: 'Load Limit' },
    { value: 'phase_window', label: 'Phase Window' },
    { value: 'pattern_match', label: 'Pattern Match' },
    { value: 'precedence_override', label: 'Precedence Override' }
  ];

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'contains', label: 'Contains' },
    { value: 'in', label: 'In List' }
  ];

  const addCondition = () => {
    setConditions([...conditions, { field: '', operator: 'equals', value: '' }]);
  };

  const updateCondition = (index: number, field: keyof typeof conditions[0], value: string) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!ruleName || !ruleType) return;

    const rule = {
      name: ruleName,
      description: ruleDescription,
      type: ruleType,
      priority,
      conditions: conditions.filter(c => c.field && c.value),
      created: new Date().toISOString()
    };

    onAddRule(rule);
    
    // Reset form
    setRuleName('');
    setRuleDescription('');
    setRuleType('');
    setPriority('medium');
    setConditions([]);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rule-name">Rule Name</Label>
          <Input 
            id="rule-name"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            placeholder="e.g., Worker Load Limit"
          />
        </div>
        <div>
          <Label htmlFor="rule-type">Rule Type</Label>
          <Select value={ruleType} onValueChange={setRuleType}>
            <SelectTrigger>
              <SelectValue placeholder="Select rule type" />
            </SelectTrigger>
            <SelectContent>
              {ruleTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="rule-description">Description</Label>
        <Textarea 
          id="rule-description"
          value={ruleDescription}
          onChange={(e) => setRuleDescription(e.target.value)}
          placeholder="Describe what this rule does..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Conditions</Label>
          <Button size="sm" variant="outline" onClick={addCondition}>
            <span className="mr-2">➕</span>
            Add Condition
          </Button>
        </div>
        
        <div className="space-y-2">
          {conditions.map((condition, index) => (
            <Card key={index} className="p-3">
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <Input 
                    placeholder="Field name"
                    value={condition.field}
                    onChange={(e) => updateCondition(index, 'field', e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <Select 
                    value={condition.operator} 
                    onValueChange={(value) => updateCondition(index, 'operator', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map(op => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-4">
                  <Input 
                    placeholder="Value"
                    value={condition.value}
                    onChange={(e) => updateCondition(index, 'value', e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => removeCondition(index)}
                    className="h-8 w-8 p-0"
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Button 
        onClick={handleSubmit} 
        className="w-full"
        disabled={!ruleName || !ruleType}
      >
        Add Rule
      </Button>
    </div>
  );
}