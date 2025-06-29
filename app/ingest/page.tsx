"use client";
import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataGrid } from '@/components/data-grid';
import { HeaderMapper } from '@/components/header-mapper';
import { ValidationPanel } from '@/components/validation-panel';
import { AdvancedValidators } from '@/components/advanced-validators';
import { AnomalyDetection } from '@/components/anomaly-detection';
import { CrossEntityValidator } from '@/components/cross-entity-validator';

export default function IngestPage() {
  const searchParams = useSearchParams();
  const entityType = searchParams?.get('entity') || 'clients';
  const useSample = searchParams?.get('sample') === 'true';
  
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [currentData, setCurrentData] = useState<any[]>([]);
  const [allEntityData, setAllEntityData] = useState<{
    clients: any[];
    workers: any[];
    tasks: any[];
  }>({ clients: [], workers: [], tasks: [] });
  const [mappedHeaders, setMappedHeaders] = useState<Record<string, string>>({});
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('upload');

  const entityConfig = {
    clients: {
      title: 'Client Data',
      description: 'Upload and validate client information with task requests',
      expectedColumns: ['ClientID', 'ClientName', 'PriorityLevel', 'RequestedTaskIDs', 'GroupTag', 'AttributesJSON'],
      relationships: ['Tasks: RequestedTaskIDs must reference valid TaskIDs', 'Priority: Higher values (4-5) get precedence in scheduling']
    },
    workers: {
      title: 'Worker Data', 
      description: 'Upload and validate worker profiles with skills and availability',
      expectedColumns: ['WorkerID', 'WorkerName', 'Skills', 'AvailableSlots', 'MaxLoadPerPhase', 'WorkerGroup', 'QualificationLevel'],
      relationships: ['Tasks: Skills must cover RequiredSkills in tasks', 'Phases: AvailableSlots define when workers can work', 'Load: MaxLoadPerPhase limits concurrent assignments']
    },
    tasks: {
      title: 'Task Data',
      description: 'Upload and validate task definitions with skill requirements',
      expectedColumns: ['TaskID', 'TaskName', 'Category', 'Duration', 'RequiredSkills', 'PreferredPhases', 'MaxConcurrent'],
      relationships: ['Clients: TaskIDs referenced in RequestedTaskIDs', 'Workers: RequiredSkills must be available in worker pool', 'Phases: PreferredPhases guide scheduling windows']
    }
  };

  const config = entityConfig[entityType as keyof typeof entityConfig] || entityConfig.clients;

  // Load sample data if specified
  useEffect(() => {
    if (useSample) {
      const sampleData = localStorage.getItem('sampleData');
      if (sampleData) {
        const data = JSON.parse(sampleData);
        const entityData = data[entityType] || [];
        setCurrentData(entityData);
        
        // Store all entity data for cross-validation
        setAllEntityData(data);
        
        setCurrentStep('mapping');
        localStorage.removeItem('sampleData'); // Clean up
      }
    }
  }, [useSample, entityType]);

  const handleFileUpload = useCallback(async (files: FileList) => {
    setIsProcessing(true);
    
    // Store uploaded files info
    const fileArray = Array.from(files);
    setUploadedFiles(fileArray.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    })));
    
    // Simulate file processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate realistic mock data based on entity type
    const mockData = generateMockData(entityType, 50);
    
    setCurrentData(mockData);
    
    // Update the specific entity data in allEntityData
    setAllEntityData(prev => ({
      ...prev,
      [entityType]: mockData
    }));
    
    setCurrentStep('mapping');
    setIsProcessing(false);
  }, [entityType]);

  const generateMockData = (entityType: string, count: number) => {
    const data = [];
    
    // Sample company names for more realistic data
    const companyNames = [
      'Acme Corp', 'Globex Inc', 'Initech', 'Umbrella Co', 'Stark Industries',
      'Wayne Enterprises', 'Soylent Corp', 'Hooli', 'Massive Dynamic', 'Cyberdyne Systems',
      'Tyrell Corp', 'Oceanic Airlines', 'Pied Piper', 'Buzzfeed', 'Nakatomi',
      'Wonka Industries', 'Sterling Cooper', 'Los Pollos Hermanos', 'Biffco', 'Monolith',
      'Dinoco', 'Springfield Nuclear', 'Duff Beer', 'Gotham LLC', 'LexCorp',
      'Zeitgeist LLC', 'Blue Ocean', 'Redwood Tech', 'Quantum Dynamics', 'Apex Innovations'
    ];

    const workerNames = [
      'Alice Thompson', 'Bob Anderson', 'Carol Williams', 'David Johnson', 'Eva Martinez',
      'Frank Davis', 'Grace Lee', 'Henry Brown', 'Iris Chen', 'Jack Wilson',
      'Karen Smith', 'Leo Garcia', 'Maya Patel', 'Nathan Wong', 'Olivia Taylor',
      'Paul Rodriguez', 'Quinn Murphy', 'Rachel Green', 'Sam Foster', 'Tina Kumar'
    ];

    const taskNames = [
      'Website Redesign', 'Database Migration', 'API Development', 'Mobile App UI', 'Android Development',
      'E-commerce Platform', 'Data Analytics Dashboard', 'Cloud Migration', 'Quality Assurance', 'User Experience Design',
      'Performance Optimization', 'Security Audit', 'CI/CD Pipeline', 'Machine Learning Model', 'Content Management System',
      'Payment Integration', 'Real-time Chat Feature', 'Data Visualization', 'Microservices Architecture', 'Progressive Web App'
    ];
    
    for (let i = 0; i < count; i++) {
      if (entityType === 'clients') {
        const taskCount = Math.floor(Math.random() * 8) + 2; // 2-9 tasks
        const taskIds = Array.from({ length: taskCount }, (_, j) => `T${Math.floor(Math.random() * 60) + 1}`);
        
        data.push({
          ClientID: `C${i + 1}`,
          ClientName: companyNames[i % companyNames.length] || `Client ${i + 1}`,
          PriorityLevel: Math.floor(Math.random() * 5) + 1, // 1-5
          RequestedTaskIDs: taskIds.join(','),
          GroupTag: ['GroupA', 'GroupB', 'GroupC'][Math.floor(Math.random() * 3)],
          AttributesJSON: JSON.stringify({
            location: ['New York', 'London', 'Tokyo', 'Paris', 'Berlin'][Math.floor(Math.random() * 5)],
            budget: (Math.floor(Math.random() * 150) + 50) * 1000,
            contact: `contact${i + 1}@example.com`
          })
        });
      } else if (entityType === 'workers') {
        const skills = ['JavaScript', 'Python', 'Java', 'C#', 'React', 'Node.js', 'Django', 'Spring', '.NET', 'MySQL', 'PostgreSQL'];
        const workerSkills = skills.slice(0, Math.floor(Math.random() * 5) + 2).join(',');
        const availableSlots = `[${Array.from({ length: Math.floor(Math.random() * 3) + 2 }, () => Math.floor(Math.random() * 5) + 1).join(',')}]`;
        
        data.push({
          WorkerID: `W${String(i + 1).padStart(3, '0')}`,
          WorkerName: workerNames[i % workerNames.length] || `Worker ${i + 1}`,
          Skills: workerSkills,
          AvailableSlots: availableSlots,
          MaxLoadPerPhase: Math.floor(Math.random() * 10) + 5, // 5-14
          WorkerGroup: ['frontend-team', 'backend-team', 'devops-team', 'mobile-team'][Math.floor(Math.random() * 4)],
          QualificationLevel: ['junior', 'intermediate', 'senior', 'expert'][Math.floor(Math.random() * 4)]
        });
      } else { // tasks
        const skills = ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'CSS', 'HTML'];
        const requiredSkills = skills.slice(0, Math.floor(Math.random() * 3) + 1).join(',');
        const duration = Math.floor(Math.random() * 6) + 1; // 1-6 phases
        const preferredPhases = Math.random() > 0.5 ? `1-${duration}` : `[${Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => Math.floor(Math.random() * 5) + 1).join(',')}]`;
        
        data.push({
          TaskID: `T${i + 1}`,
          TaskName: taskNames[i % taskNames.length] || `Task ${i + 1}`,
          Category: ['frontend', 'backend', 'mobile', 'devops', 'testing'][Math.floor(Math.random() * 5)],
          Duration: duration,
          RequiredSkills: requiredSkills,
          PreferredPhases: preferredPhases,
          MaxConcurrent: Math.floor(Math.random() * 3) + 1 // 1-3
        });
      }
    }
    
    return data;
  };

  const runValidation = useCallback(() => {
    setIsProcessing(true);
    
    // Clear any existing validation results
    setValidationResults([]);
    
    // Simulate validation processing time
    setTimeout(() => {
      setCurrentStep('validation');
      setIsProcessing(false);
    }, 1500);
  }, []);

  const handleAdvancedValidation = useCallback((results: any[]) => {
    setValidationResults(results);
  }, []);

  const handleAnomalyFound = useCallback((anomaly: any) => {
    // Apply the anomaly suggestion to the data
    if (anomaly.action === 'apply' && anomaly.rowIndex !== undefined && anomaly.fieldName && anomaly.newValue !== undefined) {
      setCurrentData(prevData => {
        const newData = [...prevData];
        if (newData[anomaly.rowIndex]) {
          newData[anomaly.rowIndex] = {
            ...newData[anomaly.rowIndex],
            [anomaly.fieldName]: anomaly.newValue
          };
        }
        return newData;
      });
      
      // Show success message or update validation results
      console.log(`Applied suggestion: ${anomaly.fieldName} in row ${anomaly.rowIndex + 1} changed to "${anomaly.newValue}"`);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleConfigure = () => {
    // Open configuration modal or navigate to settings
    alert('Configuration panel would open here. This could include:\n- Validation rules settings\n- Data mapping preferences\n- Export format options\n- Processing parameters');
  };

  const handleExportData = () => {
    if (currentData.length === 0) {
      alert('No data to export. Please upload and process data first.');
      return;
    }

    // Create CSV content
    const headers = Object.keys(currentData[0]);
    const csvContent = [
      headers.join(','),
      ...currentData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${entityType}_processed_data.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>
                ← Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
                <p className="text-sm text-gray-500">{config.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="capitalize">
                {entityType}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleConfigure}>
                Configure
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className={`flex items-center space-x-2 ${currentStep === 'upload' ? 'text-blue-600' : currentStep === 'mapping' || currentStep === 'validation' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'upload' ? 'bg-blue-100' : currentStep === 'mapping' || currentStep === 'validation' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {currentStep === 'mapping' || currentStep === 'validation' ? <span className="text-green-600">✅</span> : '1'}
                </div>
                <span className="font-medium">Upload</span>
              </div>
              <span className="text-gray-400">→</span>
              <div className={`flex items-center space-x-2 ${currentStep === 'mapping' ? 'text-blue-600' : currentStep === 'validation' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'mapping' ? 'bg-blue-100' : currentStep === 'validation' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {currentStep === 'validation' ? <span className="text-green-600">✅</span> : '2'}
                </div>
                <span className="font-medium">Map Headers</span>
              </div>
              <span className="text-gray-400">→</span>
              <div className={`flex items-center space-x-2 ${currentStep === 'validation' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'validation' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  3
                </div>
                <span className="font-medium">Validate</span>
              </div>
            </div>
            {isProcessing && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Processing...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'upload' && (
          <div className="space-y-6">
            {/* Upload Area */}
            <Card 
              className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <span className="mx-auto text-4xl text-gray-400 mb-4 block">📊</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload {config.title}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Drag and drop your CSV or XLSX files here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    multiple
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileUpload(e.target.files);
                      }
                    }}
                  />
                  <label htmlFor="file-upload">
                    <Button className="cursor-pointer" asChild>
                      <span>
                        <span className="mr-2">📤</span>
                        Choose Files
                      </span>
                    </Button>
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    Supports CSV and XLSX formats up to 10MB
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Expected Columns Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2 text-blue-500">✨</span>
                  Expected Columns & Relationships
                </CardTitle>
                <CardDescription>
                  Our AI will automatically map your columns to these expected fields and validate relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Required Columns:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {config.expectedColumns.map((column) => (
                        <Badge key={column} variant="outline" className="justify-center">
                          {column}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Data Relationships:</h4>
                    <div className="space-y-1">
                      {config.relationships.map((relationship, index) => (
                        <p key={index} className="text-sm text-gray-600">• {relationship}</p>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Data Format Information */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Data Format Requirements:</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    {entityType === 'clients' && (
                      <>
                        <p>• <strong>PriorityLevel:</strong> Integer (1–5) - Higher values get scheduling precedence</p>
                        <p>• <strong>RequestedTaskIDs:</strong> Comma-separated TaskIDs (e.g., "T1,T17,T33")</p>
                        <p>• <strong>AttributesJSON:</strong> Valid JSON metadata or plain text</p>
                        <p>• <strong>GroupTag:</strong> Links to slot-restriction and load-limit rules</p>
                      </>
                    )}
                    {entityType === 'workers' && (
                      <>
                        <p>• <strong>Skills:</strong> Comma-separated tags (e.g., "JavaScript,React,Node.js")</p>
                        <p>• <strong>AvailableSlots:</strong> Array of phase numbers (e.g., [1,3,5])</p>
                        <p>• <strong>MaxLoadPerPhase:</strong> Integer representing max concurrent tasks</p>
                        <p>• <strong>WorkerGroup:</strong> Links to grouped operations and restrictions</p>
                      </>
                    )}
                    {entityType === 'tasks' && (
                      <>
                        <p>• <strong>Duration:</strong> Number of phases (≥1) - Must fit within PreferredPhases</p>
                        <p>• <strong>RequiredSkills:</strong> Must match available worker skills</p>
                        <p>• <strong>PreferredPhases:</strong> Range syntax (e.g., "1-3") or array (e.g., [2,4,5])</p>
                        <p>• <strong>MaxConcurrent:</strong> Integer (max parallel assignments)</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'mapping' && (
          <div className="space-y-6">
            <Alert>
              <span className="mr-2">✨</span>
              <AlertDescription>
                AI has automatically mapped your columns. Review and adjust the mappings below.
              </AlertDescription>
            </Alert>
            
            <HeaderMapper 
              originalHeaders={Object.keys(currentData[0] || {})}
              expectedHeaders={config.expectedColumns}
              mappings={mappedHeaders}
              onMappingChange={setMappedHeaders}
            />

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('upload')}>
                Back to Upload
              </Button>
              <Button onClick={runValidation}>
                Continue to Validation
                <span className="ml-2">→</span>
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'validation' && (
          <div className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Validation</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Validators</TabsTrigger>
                <TabsTrigger value="relationships">Cross-Entity</TabsTrigger>
                <TabsTrigger value="anomaly">AI Anomaly Detection</TabsTrigger>
                <TabsTrigger value="data">Data Grid</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <DataGrid 
                      data={currentData}
                      validationResults={validationResults}
                      onDataChange={setCurrentData}
                    />
                  </div>
                  <div>
                    <ValidationPanel 
                      results={validationResults}
                      onFixError={(error) => console.log('Fix error:', error)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <AdvancedValidators
                  data={currentData}
                  entityType={entityType}
                  onValidationComplete={handleAdvancedValidation}
                />
              </TabsContent>

              <TabsContent value="relationships" className="space-y-6">
                <CrossEntityValidator
                  clientsData={allEntityData.clients}
                  workersData={allEntityData.workers}
                  tasksData={allEntityData.tasks}
                  onValidationComplete={(results) => {
                    // Merge cross-entity results with existing validation results
                    setValidationResults(prev => [...prev, ...results]);
                  }}
                />
              </TabsContent>

              <TabsContent value="anomaly" className="space-y-6">
                <AnomalyDetection
                  data={currentData}
                  onAnomalyFound={handleAnomalyFound}
                />
              </TabsContent>

              <TabsContent value="data" className="space-y-6">
                <DataGrid 
                  data={currentData}
                  validationResults={validationResults}
                  onDataChange={setCurrentData}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('mapping')}>
                Back to Mapping
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={handleExportData}>
                  <span className="mr-2">📥</span>
                  Export Data
                </Button>
                <Button onClick={() => window.location.href = '/rules'}>
                  Configure Rules
                  <span className="ml-2">→</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}