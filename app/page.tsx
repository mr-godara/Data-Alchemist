'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [showSampleData, setShowSampleData] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const features = [
    {
      icon: <span className="text-2xl">📤</span>,
      title: "Drop & Clean",
      description: "Upload messy CSV/XLSX files and let AI tidy them up automatically",
      color: "bg-blue-500"
    },
    {
      icon: <span className="text-2xl">⚡</span>,
      title: "One-Click Fixes",
      description: "Fix data problems directly in the table with smart suggestions",
      color: "bg-green-500"
    },
    {
      icon: <span className="text-2xl">✨</span>,
      title: "Plain English Rules",
      description: "Type rules in natural language - AI converts them to settings",
      color: "bg-purple-500"
    },
    {
      icon: <span className="text-2xl">⚙️</span>,
      title: "Smart Priorities",
      description: "Use sliders to set what matters most - cost, speed, or quality",
      color: "bg-orange-500"
    }
  ];

  const entityTypes = [
    { 
      name: "Clients", 
      icon: <span className="text-xl">👥</span>, 
      count: 0, 
      color: "bg-blue-100 text-blue-800", 
      description: "People requesting work with priority levels",
      examples: "Companies, departments, or individuals who need tasks completed"
    },
    { 
      name: "Workers", 
      icon: <span className="text-xl">💼</span>, 
      count: 0, 
      color: "bg-green-100 text-green-800", 
      description: "People who can do the work with specific skills",
      examples: "Employees, contractors, or team members with different capabilities"
    },
    { 
      name: "Tasks", 
      icon: <span className="text-xl">📋</span>, 
      count: 0, 
      color: "bg-purple-100 text-purple-800", 
      description: "Units of work that need to be completed",
      examples: "Projects, assignments, or jobs with time and skill requirements"
    }
  ];

  // Enhanced sample data with proper relationships
  const sampleData = {
    clients: [
      { ClientID: 'C1', ClientName: 'Acme Corp', PriorityLevel: 3, RequestedTaskIDs: 'T1,T2,T3', GroupTag: 'GroupA', AttributesJSON: '{"location":"New York","budget":100000}' },
      { ClientID: 'C2', ClientName: 'Globex Inc', PriorityLevel: 1, RequestedTaskIDs: 'T4,T5', GroupTag: 'GroupB', AttributesJSON: '{"message":"ensure deliverables align with project scope","location":"London","budget":56000}' },
      { ClientID: 'C3', ClientName: 'Initech', PriorityLevel: 4, RequestedTaskIDs: 'T1,T3,T4', GroupTag: 'GroupA', AttributesJSON: '{"sla":"24h","vip":true}' },
      { ClientID: 'C4', ClientName: 'Umbrella Co', PriorityLevel: 5, RequestedTaskIDs: 'T2,T5', GroupTag: 'GroupC', AttributesJSON: '{"message":"budget approved pending CFO review","location":"Mumbai","budget":112000}' },
      { ClientID: 'C5', ClientName: 'Stark Industries', PriorityLevel: 2, RequestedTaskIDs: 'T1,T4,T5', GroupTag: 'GroupB', AttributesJSON: '{"notes":"rush order","budget":200000}' }
    ],
    workers: [
      { WorkerID: 'W001', WorkerName: 'Alice Thompson', Skills: 'JavaScript,React,Node.js', AvailableSlots: '[1,2,3,4,5]', MaxLoadPerPhase: 8, WorkerGroup: 'frontend-team', QualificationLevel: 'senior' },
      { WorkerID: 'W002', WorkerName: 'Bob Anderson', Skills: 'Python,Django,PostgreSQL', AvailableSlots: '[1,3,5]', MaxLoadPerPhase: 6, WorkerGroup: 'backend-team', QualificationLevel: 'expert' },
      { WorkerID: 'W003', WorkerName: 'Carol Williams', Skills: 'Java,Spring,MySQL', AvailableSlots: '[2,4,5]', MaxLoadPerPhase: 7, WorkerGroup: 'backend-team', QualificationLevel: 'intermediate' },
      { WorkerID: 'W004', WorkerName: 'David Johnson', Skills: 'C#,.NET,SQL Server', AvailableSlots: '[1,2,3,4,5]', MaxLoadPerPhase: 9, WorkerGroup: 'backend-team', QualificationLevel: 'senior' },
      { WorkerID: 'W005', WorkerName: 'Eva Martinez', Skills: 'PHP,Laravel,MySQL', AvailableSlots: '[2,3,4]', MaxLoadPerPhase: 5, WorkerGroup: 'backend-team', QualificationLevel: 'junior' }
    ],
    tasks: [
      { TaskID: 'T1', TaskName: 'Website Redesign', Category: 'frontend', Duration: 3, RequiredSkills: 'JavaScript,React,CSS', PreferredPhases: '1-3', MaxConcurrent: 2 },
      { TaskID: 'T2', TaskName: 'Database Migration', Category: 'backend', Duration: 2, RequiredSkills: 'Python,PostgreSQL', PreferredPhases: '2-3', MaxConcurrent: 1 },
      { TaskID: 'T3', TaskName: 'API Development', Category: 'backend', Duration: 4, RequiredSkills: 'Node.js,Express', PreferredPhases: '1-4', MaxConcurrent: 3 },
      { TaskID: 'T4', TaskName: 'Mobile App UI', Category: 'mobile', Duration: 2, RequiredSkills: 'Swift,iOS', PreferredPhases: '3-4', MaxConcurrent: 2 },
      { TaskID: 'T5', TaskName: 'Android Development', Category: 'mobile', Duration: 5, RequiredSkills: 'Kotlin,Android', PreferredPhases: '1-5', MaxConcurrent: 2 }
    ]
  };

  const handleStartWithSampleData = () => {
    // Store sample data in localStorage for the ingest page to use
    localStorage.setItem('sampleData', JSON.stringify(sampleData));
    window.location.href = '/ingest?entity=clients&sample=true';
  };

  const handleFileUpload = () => {
    // Create a file input element and trigger it
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        // Store file information and redirect to ingest page
        const fileInfo = Array.from(files).map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }));
        localStorage.setItem('uploadedFiles', JSON.stringify(fileInfo));
        window.location.href = '/ingest?entity=clients';
      }
    };
    input.click();
  };

  const handleNaturalLanguageSearch = (query: string) => {
    // Simulate natural language processing
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('high priority') || lowerQuery.includes('urgent')) {
      return 'Showing clients with priority level 4-5';
    } else if (lowerQuery.includes('javascript') || lowerQuery.includes('react')) {
      return 'Showing workers with JavaScript/React skills';
    } else if (lowerQuery.includes('frontend') || lowerQuery.includes('ui')) {
      return 'Showing frontend tasks and workers';
    } else if (lowerQuery.includes('overloaded') || lowerQuery.includes('busy')) {
      return 'Showing workers with high task loads';
    } else if (lowerQuery.includes('missing') || lowerQuery.includes('error')) {
      return 'Showing data with validation errors';
    }
    
    return `Searching for: ${query}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <span className="text-white">✨</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Data Alchemist</h1>
                <p className="text-sm text-gray-500">Your AI-powered spreadsheet cleaning assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={showSampleData} onOpenChange={setShowSampleData}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <span className="mr-2">🗄️</span>
                    Try Sample Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Sample Data Preview</DialogTitle>
                    <DialogDescription>
                      See how clean, connected data should look
                    </DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="clients" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="clients">Clients</TabsTrigger>
                      <TabsTrigger value="workers">Workers</TabsTrigger>
                      <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    </TabsList>
                    {Object.entries(sampleData).map(([key, data]) => (
                      <TabsContent key={key} value={key} className="mt-4">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-gray-50">
                                {Object.keys(data[0]).map((header) => (
                                  <th key={header} className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {data.slice(0, 5).map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  {Object.values(row).map((cell, cellIndex) => (
                                    <td key={cellIndex} className="border border-gray-300 px-4 py-2 text-sm">
                                      {String(cell).length > 50 ? String(cell).substring(0, 50) + '...' : String(cell)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                              {data.length > 5 && (
                                <tr>
                                  <td colSpan={Object.keys(data[0]).length} className="border border-gray-300 px-4 py-2 text-sm text-gray-500 text-center">
                                    ... and {data.length - 5} more rows
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={() => setShowSampleData(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleStartWithSampleData}>
                      <span className="mr-2">▶️</span>
                      Start with This Data
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button size="sm" onClick={handleFileUpload} className="bg-gradient-to-r from-blue-500 to-purple-600">
                <span className="mr-2">📤</span>
                Upload Your Files
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Drop Messy Data, Get Clean Results
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Upload your raw CSV or Excel files and let AI clean them up automatically. 
            Fix problems with one click, set rules in plain English, and export production-ready data.
          </p>
          
          {/* Natural Language Search Demo */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Input
                placeholder="Try: 'Show me high priority clients' or 'Find workers with JavaScript skills'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg border-2 border-blue-200 focus:border-blue-500 rounded-xl"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500">✨</span>
            </div>
            {searchQuery && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                <span className="mr-1">⚡</span>
                {handleNaturalLanguageSearch(searchQuery)}
              </div>
            )}
          </div>
        </div>

        {/* How It Works */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                activeStep === index ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
              onClick={() => setActiveStep(index)}
            >
              <CardHeader className="text-center">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Data Types Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2 text-blue-500">🗄️</span>
              What Kind of Data Can You Clean?
            </CardTitle>
            <CardDescription>
              We specialize in three types of business data that work together
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {entityTypes.map((entity, index) => (
                <Card key={entity.name} className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">{entity.name}</CardTitle>
                    <div className={`p-2 rounded-lg ${entity.color.replace('text-', 'bg-').replace('bg-', 'bg-opacity-20 bg-')}`}>
                      {entity.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{entity.description}</p>
                    <p className="text-xs text-gray-500 mb-4">{entity.examples}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.location.href = `/ingest?entity=${entity.name.toLowerCase()}`}
                    >
                      <span className="mr-2">📤</span>
                      Upload {entity.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Simple Workflow */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2 text-green-500">→</span>
              Simple 4-Step Process
            </CardTitle>
            <CardDescription>
              From messy spreadsheet to clean data in minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                <h3 className="font-semibold mb-1">Drop Files</h3>
                <p className="text-sm text-gray-600">Upload your messy CSV or Excel files</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                <h3 className="font-semibold mb-1">AI Cleans</h3>
                <p className="text-sm text-gray-600">AI finds problems and suggests fixes</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                <h3 className="font-semibold mb-1">Set Rules</h3>
                <p className="text-sm text-gray-600">Type rules in plain English</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">4</div>
                <h3 className="font-semibold mb-1">Export Clean</h3>
                <p className="text-sm text-gray-600">Download perfect data files</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">For Non-Technical Users</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800">
              <ul className="space-y-2 text-sm">
                <li>• No coding or complex formulas needed</li>
                <li>• Plain English rule creation</li>
                <li>• One-click problem fixes</li>
                <li>• Visual feedback on data quality</li>
                <li>• Export ready-to-use files</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">AI-Powered Features</CardTitle>
            </CardHeader>
            <CardContent className="text-green-800">
              <ul className="space-y-2 text-sm">
                <li>• Automatic error detection</li>
                <li>• Smart data suggestions</li>
                <li>• Natural language search</li>
                <li>• Relationship validation</li>
                <li>• Intelligent rule conversion</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            onClick={handleStartWithSampleData}
          >
            <span className="mr-2">▶️</span>
            Try with Sample Data
          </Button>
          <Button size="lg" variant="outline" onClick={handleFileUpload}>
            <span className="mr-2">📤</span>
            Upload Your Files
          </Button>
          <Dialog open={showDocumentation} onOpenChange={setShowDocumentation}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline">
                <span className="mr-2">📄</span>
                How It Works
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>How Data Alchemist Works</DialogTitle>
                <DialogDescription>
                  Your complete guide to cleaning messy spreadsheets
                </DialogDescription>
              </DialogHeader>
              <div className="prose max-w-none">
                <h3>🎯 Perfect For</h3>
                <ul>
                  <li><strong>Business Users:</strong> No technical skills required</li>
                  <li><strong>Project Managers:</strong> Clean data for resource allocation</li>
                  <li><strong>HR Teams:</strong> Organize worker skills and availability</li>
                  <li><strong>Operations:</strong> Validate client requests and task assignments</li>
                </ul>

                <h3>🔧 What We Fix</h3>
                <ul>
                  <li><strong>Duplicate Records:</strong> Find and merge duplicate entries</li>
                  <li><strong>Missing Data:</strong> Identify gaps and suggest fixes</li>
                  <li><strong>Format Issues:</strong> Fix dates, numbers, and text formatting</li>
                  <li><strong>Broken Relationships:</strong> Ensure data connections work</li>
                  <li><strong>Invalid Values:</strong> Catch out-of-range or impossible data</li>
                </ul>

                <h3>🤖 AI Features</h3>
                <ul>
                  <li><strong>Natural Language Search:</strong> "Show me high priority clients"</li>
                  <li><strong>Smart Suggestions:</strong> AI recommends fixes for problems</li>
                  <li><strong>Rule Creation:</strong> Type rules in plain English</li>
                  <li><strong>Anomaly Detection:</strong> Find unusual patterns automatically</li>
                  <li><strong>One-Click Fixes:</strong> Apply suggestions with a single click</li>
                </ul>

                <h3>📊 Data Types We Handle</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-blue-600">Clients</h4>
                    <p className="text-sm mt-2">People or groups requesting work with priority levels and task requirements</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-green-600">Workers</h4>
                    <p className="text-sm mt-2">People who can do work with specific skills and availability schedules</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-purple-600">Tasks</h4>
                    <p className="text-sm mt-2">Units of work with duration, skill requirements, and timing preferences</p>
                  </div>
                </div>

                <h3>🚀 Getting Started</h3>
                <ol>
                  <li><strong>Upload:</strong> Drop your CSV or Excel files</li>
                  <li><strong>Review:</strong> See what AI found and fixed</li>
                  <li><strong>Edit:</strong> Make changes directly in the data table</li>
                  <li><strong>Rules:</strong> Set priorities using sliders or plain English</li>
                  <li><strong>Export:</strong> Download clean files ready for use</li>
                </ol>

                <h3>💡 Pro Tips</h3>
                <ul>
                  <li>Start with sample data to see how it works</li>
                  <li>Use natural language to search and filter data</li>
                  <li>Let AI suggest fixes before making manual changes</li>
                  <li>Set priority weights to match your business needs</li>
                  <li>Export both data and rules for downstream tools</li>
                </ul>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}