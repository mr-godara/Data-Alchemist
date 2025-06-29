'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { RuleBuilder } from '@/components/rule-builder';
import { PriorityWeights } from '@/components/priority-weights';
import { AIRuleAssistant } from '@/components/ai-rule-assistant';

export default function RulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [weights, setWeights] = useState({
    fulfillment: 0.3,
    load_balance: 0.25,
    efficiency: 0.2,
    deadline_adherence: 0.15,
    skill_match: 0.1
  });

  const handleAddRule = (rule: any) => {
    setRules([...rules, { ...rule, id: Date.now() }]);
  };

  const handleDeleteRule = (ruleId: number) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
  };

  const handleExportRules = () => {
    const exportData = {
      rules,
      weights,
      metadata: {
        version: '1.0',
        created: new Date().toISOString(),
        description: 'Data Alchemist Rules Configuration'
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rules-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/ingest'}>
                ← Back to Data
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Rules Configuration</h1>
                <p className="text-sm text-gray-500">Define business rules and prioritization weights</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                {rules.length} Rules
              </Badge>
              <Button variant="outline" size="sm" onClick={handleExportRules}>
                <span className="mr-2">📥</span>
                Export Config
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="rules" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rules" className="flex items-center">
              <span className="mr-2">⚙️</span>
              Business Rules
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="flex items-center">
              <span className="mr-2">✨</span>
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="weights" className="flex items-center">
              <span className="mr-2">🎛️</span>
              Priority Weights
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center">
              <span className="mr-2">📥</span>
              Export & Deploy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rule Builder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2 text-green-500">➕</span>
                    Create New Rule
                  </CardTitle>
                  <CardDescription>
                    Define business rules for your data processing workflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RuleBuilder onAddRule={handleAddRule} />
                </CardContent>
              </Card>

              {/* Existing Rules */}
              <Card>
                <CardHeader>
                  <CardTitle>Configured Rules ({rules.length})</CardTitle>
                  <CardDescription>
                    Review and manage your business rules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {rules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <span className="text-4xl mx-auto mb-4 text-gray-300 block">⚙️</span>
                      <p className="text-lg font-medium">No rules configured yet</p>
                      <p className="text-sm">Create your first rule using the builder or AI assistant</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rules.map((rule, index) => (
                        <div key={rule.id} className="p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline">{rule.type}</Badge>
                                <Badge variant="secondary">{rule.priority}</Badge>
                              </div>
                              <h4 className="font-medium text-gray-900">{rule.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                              {rule.conditions && (
                                <div className="mt-2 text-xs text-gray-500">
                                  Conditions: {JSON.stringify(rule.conditions)}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteRule(rule.id)}
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-assistant" className="space-y-6">
            <AIRuleAssistant onRuleGenerated={handleAddRule} />
          </TabsContent>

          <TabsContent value="weights" className="space-y-6">
            <PriorityWeights weights={weights} onWeightsChange={(w) => setWeights(w as typeof weights)} />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Configuration</CardTitle>
                <CardDescription>
                  Download your complete rules and weights configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Rules</h4>
                    <p className="text-2xl font-bold text-blue-700">{rules.length}</p>
                    <p className="text-sm text-blue-600">Configured</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900">Weights</h4>
                    <p className="text-2xl font-bold text-green-700">{Object.keys(weights).length}</p>
                    <p className="text-sm text-green-600">Priorities</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Export Options</h4>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" onClick={handleExportRules}>
                      <span className="mr-2">📥</span>
                      Download rules.json
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <span className="mr-2">📊</span>
                      Export as CSV
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Ready to Deploy</h4>
                  <p className="text-sm text-yellow-700">
                    Your configuration is ready to be used with your processed data files. 
                    Export the JSON configuration and use it with your scheduling system.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}