'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Sliders, RotateCw } from 'lucide-react';

interface PriorityWeightsProps {
  weights: Record<string, number>;
  onWeightsChange: (weights: Record<string, number>) => void;
}

export function PriorityWeights({ weights, onWeightsChange }: PriorityWeightsProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [comparison, setComparison] = useState<{ a: string; b: string } | null>(null);

  const weightLabels = {
    fulfillment: 'Maximize Fulfillment',
    load_balance: 'Balance Load',
    efficiency: 'Operational Efficiency',
    deadline_adherence: 'Deadline Adherence',
    skill_match: 'Skill Matching'
  };

  const presets = {
    balanced: {
      fulfillment: 0.2,
      load_balance: 0.2,
      efficiency: 0.2,
      deadline_adherence: 0.2,
      skill_match: 0.2
    },
    fulfillment_focused: {
      fulfillment: 0.4,
      load_balance: 0.2,
      efficiency: 0.15,
      deadline_adherence: 0.15,
      skill_match: 0.1
    },
    efficiency_focused: {
      fulfillment: 0.15,
      load_balance: 0.15,
      efficiency: 0.4,
      deadline_adherence: 0.2,
      skill_match: 0.1
    },
    deadline_critical: {
      fulfillment: 0.1,
      load_balance: 0.15,
      efficiency: 0.15,
      deadline_adherence: 0.5,
      skill_match: 0.1
    }
  };

  const handleSliderChange = (key: string, value: number[]) => {
    const newWeights = { ...weights, [key]: value[0] };
    
    // Normalize to ensure sum equals 1
    const total = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
    const normalized = Object.fromEntries(
      Object.entries(newWeights).map(([k, v]) => [k, v / total])
    );
    
    onWeightsChange(normalized);
  };

  const applyPreset = (presetName: keyof typeof presets) => {
    onWeightsChange(presets[presetName]);
  };

  const randomizeWeights = () => {
    const random = Object.keys(weights).map(() => Math.random());
    const total = random.reduce((sum, w) => sum + w, 0);
    const normalized = Object.fromEntries(
      Object.keys(weights).map((key, index) => [key, random[index] / total])
    );
    onWeightsChange(normalized);
  };

  const handleDragStart = (key: string) => {
    setDraggedItem(key);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetKey: string) => {
    if (!draggedItem || draggedItem === targetKey) return;
    
    // Swap weights
    const newWeights = { ...weights };
    const temp = newWeights[draggedItem];
    newWeights[draggedItem] = newWeights[targetKey];
    newWeights[targetKey] = temp;
    
    onWeightsChange(newWeights);
    setDraggedItem(null);
  };

  const sortedWeights = Object.entries(weights).sort(([,a], [,b]) => b - a);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sliders className="h-5 w-5 mr-2 text-blue-500" />
            Priority Weights Configuration
          </CardTitle>
          <CardDescription>
            Define how different factors should be prioritized in your data processing workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sliders">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sliders">Sliders</TabsTrigger>
              <TabsTrigger value="ranking">Drag & Drop</TabsTrigger>
              <TabsTrigger value="pairwise">Pairwise</TabsTrigger>
            </TabsList>

            <TabsContent value="sliders" className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Adjust Weights</h4>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={randomizeWeights}>
                    <RotateCw className="h-4 w-4 mr-2" />
                    Randomize
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(weights).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">
                        {weightLabels[key as keyof typeof weightLabels]}
                      </Label>
                      <Badge variant="secondary">
                        {(value * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <Slider
                      value={[value]}
                      onValueChange={(newValue) => handleSliderChange(key, newValue)}
                      max={1}
                      min={0}
                      step={0.01}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              {/* Presets */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Quick Presets</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(presets).map(([name, preset]) => (
                    <Button
                      key={name}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(name as keyof typeof presets)}
                      className="justify-start"
                    >
                      {name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ranking" className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Drag and drop to reorder priorities. Higher position = higher weight.
              </div>
              
              <div className="space-y-2">
                {sortedWeights.map(([key, value], index) => (
                  <div
                    key={key}
                    draggable
                    onDragStart={() => handleDragStart(key)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(key)}
                    className={`p-4 bg-white border rounded-lg cursor-move hover:shadow-sm transition-shadow ${
                      draggedItem === key ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">
                          {weightLabels[key as keyof typeof weightLabels]}
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {(value * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pairwise" className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Compare factors pairwise to determine relative importance.
              </div>
              
              <Card className="p-4">
                <div className="text-center">
                  <h4 className="font-medium mb-4">Which is more important?</h4>
                  <div className="flex items-center justify-center space-x-4">
                    <Button size="lg" variant="outline" className="flex-1">
                      Maximize Fulfillment
                    </Button>
                    <span className="text-gray-400">vs</span>
                    <Button size="lg" variant="outline" className="flex-1">
                      Balance Load
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Comparison 1 of 10
                  </p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
            Weight Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedWeights.map(([key, value]) => (
              <div key={key} className="flex items-center space-x-3">
                <div className="w-32 text-sm font-medium">
                  {weightLabels[key as keyof typeof weightLabels]}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                  <div 
                    className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
                <div className="w-12 text-sm text-right">
                  {(value * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}