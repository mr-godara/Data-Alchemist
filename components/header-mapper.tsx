'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HeaderMapperProps {
  originalHeaders: string[];
  expectedHeaders: string[];
  mappings: Record<string, string>;
  onMappingChange: (mappings: Record<string, string>) => void;
}

export function HeaderMapper({ 
  originalHeaders, 
  expectedHeaders, 
  mappings, 
  onMappingChange 
}: HeaderMapperProps) {
  const [autoMappings, setAutoMappings] = useState<Record<string, string>>({});
  const [confidence, setConfidence] = useState<Record<string, number>>({});

  useEffect(() => {
    // AI-powered header mapping simulation
    const aiMappings: Record<string, string> = {};
    const aiConfidence: Record<string, number> = {};

    expectedHeaders.forEach(expected => {
      const similarities = originalHeaders.map(original => ({
        original,
        score: calculateSimilarity(expected, original)
      }));

      const bestMatch = similarities.reduce((best, current) => 
        current.score > best.score ? current : best
      );

      if (bestMatch.score > 0.3) { // Threshold for auto-mapping
        aiMappings[expected] = bestMatch.original;
        aiConfidence[expected] = bestMatch.score;
      }
    });

    setAutoMappings(aiMappings);
    setConfidence(aiConfidence);
    onMappingChange(aiMappings);
  }, [originalHeaders, expectedHeaders, onMappingChange]);

  const calculateSimilarity = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase().replace(/[_\s]/g, '');
    const s2 = str2.toLowerCase().replace(/[_\s]/g, '');
    
    // Simple similarity calculation
    if (s1 === s2) return 1.0;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
    
    // Levenshtein distance approximation
    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 1.0;
    
    const distance = levenshteinDistance(s1, s2);
    return 1 - (distance / maxLen);
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  };

  const handleMappingChange = (expectedHeader: string, originalHeader: string) => {
    // Handle the unmapped case by removing the mapping
    if (originalHeader === 'unmapped') {
      const newMappings = { ...mappings };
      delete newMappings[expectedHeader];
      onMappingChange(newMappings);
    } else {
      const newMappings = { ...mappings, [expectedHeader]: originalHeader };
      onMappingChange(newMappings);
    }
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'bg-green-100 text-green-800';
    if (conf >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceIcon = (conf: number) => {
    if (conf >= 0.8) return <span className="text-green-500">✅</span>;
    return <span className="text-yellow-500">⚠️</span>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="mr-2 text-blue-500">✨</span>
          AI Header Mapping
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {expectedHeaders.map((expectedHeader) => {
            const mappedHeader = mappings[expectedHeader];
            const conf = confidence[expectedHeader] || 0;
            
            return (
              <div key={expectedHeader} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="font-mono">
                      {expectedHeader}
                    </Badge>
                    <span className="text-sm text-gray-500">Expected</span>
                  </div>
                </div>
                
                <span className="text-gray-400">→</span>
                
                <div className="flex-1">
                  <Select
                    value={mappedHeader || 'unmapped'}
                    onValueChange={(value) => handleMappingChange(expectedHeader, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select original header" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unmapped">None</SelectItem>
                      {originalHeaders.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {mappedHeader && conf > 0 && (
                  <div className="flex items-center space-x-2">
                    <Badge className={getConfidenceColor(conf)}>
                      <div className="flex items-center space-x-1">
                        {getConfidenceIcon(conf)}
                        <span>{Math.round(conf * 100)}%</span>
                      </div>
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <span className="mr-2 text-blue-500">✨</span>
            <div>
              <h4 className="font-medium text-blue-900">AI Mapping Results</h4>
              <p className="text-sm text-blue-700 mt-1">
                Automatically mapped {Object.keys(mappings).length} of {expectedHeaders.length} headers. 
                Review and adjust mappings as needed before proceeding.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}