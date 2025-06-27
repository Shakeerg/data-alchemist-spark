
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import FileUpload from './FileUpload';
import DataGrid from './DataGrid';
import RuleBuilder from './RuleBuilder';
import { useDataStore } from '@/hooks/useDataStore';
import { Client, Worker, Task, ValidationError } from '@/types/data';
import { Upload, Eye, Package, Bug, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const DataAlchemistApp: React.FC = () => {
  const {
    data,
    updateClients,
    updateWorkers,
    updateTasks,
    addRule,
    updateRule,
    deleteRule,
    setValidationErrors
  } = useDataStore();

  const [activeTab, setActiveTab] = useState('upload');
  const [debugMode, setDebugMode] = useState(false);

  const parseCSV = (content: string): any[] => {
    // Clean up any BOM or encoding issues
    const cleanContent = content.replace(/^\uFEFF/, '').replace(/\0/g, '');
    
    const lines = cleanContent.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) return [];
    
    // Parse CSV with proper quote handling
    const parseCSVLine = (line: string): string[] => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++; // Skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    };
    
    const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = parseCSVLine(line).map(v => v.replace(/"/g, ''));
      const row: any = {};
      
      headers.forEach((header, index) => {
        let value = values[index] || '';
        
        // Smart parsing for different data types
        if (header.includes('IDs') || header.includes('Skills') || header.includes('Phases')) {
          row[header] = value ? value.split(';').map(v => v.trim()).filter(v => v) : [];
        } else if (header.includes('Slots')) {
          try {
            row[header] = JSON.parse(value);
          } catch {
            row[header] = value ? value.split(';').map(v => {
              const num = parseInt(v.trim());
              return isNaN(num) ? 0 : num;
            }).filter(v => v !== 0) : [];
          }
        } else if (header.includes('Level') || header.includes('Duration') || header.includes('Load') || header.includes('Concurrent')) {
          const num = parseInt(value);
          row[header] = isNaN(num) ? 0 : num;
        } else {
          row[header] = value;
        }
      });
      
      return row;
    });
    
    return rows;
  };

  const handleFileUpload = useCallback(async (file: File, type: 'clients' | 'workers' | 'tasks') => {
    try {
      // Read file with proper encoding detection
      const arrayBuffer = await file.arrayBuffer();
      const decoder = new TextDecoder('utf-8');
      let content = decoder.decode(arrayBuffer);
      
      // If content looks garbled, try with different encoding
      if (content.includes('�') || /[^\x00-\x7F\u00A0-\uFFFF]/.test(content)) {
        const decoder2 = new TextDecoder('windows-1252');
        content = decoder2.decode(arrayBuffer);
      }
      
      const parsedData = parseCSV(content);
      
      if (parsedData.length === 0) {
        throw new Error('No data found in file');
      }
      
      switch (type) {
        case 'clients':
          updateClients(parsedData as Client[]);
          break;
        case 'workers':
          updateWorkers(parsedData as Worker[]);
          break;
        case 'tasks':
          updateTasks(parsedData as Task[]);
          break;
      }
      
      // Trigger validation after upload
      validateData();
      
      toast({
        title: "✨ Success!",
        description: `${parsedData.length} ${type} records loaded successfully`,
      });
      
      setActiveTab('data');
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Error",
        description: `Failed to parse ${file.name}. Please check the file format and encoding.`,
        variant: "destructive"
      });
    }
  }, [updateClients, updateWorkers, updateTasks]);

  const validateData = () => {
    const errors: ValidationError[] = [];
    
    // Validate clients
    data.clients.forEach((client, index) => {
      if (!client.ClientID) {
        errors.push({
          id: `client-${index}-id`,
          type: 'error',
          message: 'Client ID is required',
          field: 'ClientID',
          rowIndex: index
        });
      }
      
      if (client.PriorityLevel < 1 || client.PriorityLevel > 5) {
        errors.push({
          id: `client-${index}-priority`,
          type: 'error',
          message: 'Priority level must be between 1 and 5',
          field: 'PriorityLevel',
          rowIndex: index
        });
      }
      
      // Check if requested tasks exist
      client.RequestedTaskIDs?.forEach(taskId => {
        if (!data.tasks.find(task => task.TaskID === taskId)) {
          errors.push({
            id: `client-${index}-task-${taskId}`,
            type: 'error',
            message: `Task ${taskId} does not exist`,
            field: 'RequestedTaskIDs',
            rowIndex: index,
            suggestion: 'Remove invalid task ID or add the task to tasks data'
          });
        }
      });
    });
    
    // Validate tasks
    data.tasks.forEach((task, index) => {
      if (task.Duration < 1) {
        errors.push({
          id: `task-${index}-duration`,
          type: 'error',
          message: 'Duration must be at least 1',
          field: 'Duration',
          rowIndex: index
        });
      }
      
      // Check if required skills are available
      task.RequiredSkills?.forEach(skill => {
        const hasSkill = data.workers.some(worker => 
          worker.Skills?.includes(skill)
        );
        if (!hasSkill) {
          errors.push({
            id: `task-${index}-skill-${skill}`,
            type: 'warning',
            message: `No worker has skill: ${skill}`,
            field: 'RequiredSkills',
            rowIndex: index
          });
        }
      });
    });
    
    setValidationErrors(errors);
  };

  const handleNaturalLanguageQuery = (query: string) => {
    // Simple natural language processing for demo
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('duration') && lowerQuery.includes('>')) {
      const match = lowerQuery.match(/duration\s*>\s*(\d+)/);
      if (match) {
        const minDuration = parseInt(match[1]);
        const filteredTasks = data.tasks.filter(task => task.Duration > minDuration);
        toast({
          title: "Search Results",
          description: `Found ${filteredTasks.length} tasks with duration > ${minDuration}`,
        });
      }
    }
    
    toast({
      title: "Natural Language Query",
      description: `Processed: "${query}"`,
    });
  };

  const exportData = () => {
    const exportData = {
      clients: data.clients,
      workers: data.workers,
      tasks: data.tasks,
      rules: data.rules.filter(rule => rule.enabled),
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-alchemist-export.json';
    a.click();
    
    toast({
      title: "Export Complete",
      description: "Your golden data has been downloaded!",
    });
  };

  const loadSampleData = () => {
    // Load sample data for demonstration
    const sampleClients: Client[] = [
      {
        ClientID: 'C001',
        ClientName: 'Acme Corp',
        PriorityLevel: 5,
        RequestedTaskIDs: ['T001', 'T002'],
        GroupTag: 'Enterprise',
        AttributesJSON: '{"budget": 10000, "deadline": "2024-12-31"}'
      },
      {
        ClientID: 'C002',
        ClientName: 'Tech Solutions',
        PriorityLevel: 3,
        RequestedTaskIDs: ['T003'],
        GroupTag: 'SMB',
        AttributesJSON: '{"budget": 5000}'
      }
    ];
    
    const sampleWorkers: Worker[] = [
      {
        WorkerID: 'W001',
        WorkerName: 'John Doe',
        Skills: ['JavaScript', 'React', 'Node.js'],
        AvailableSlots: [1, 2, 3],
        MaxLoadPerPhase: 2,
        WorkerGroup: 'Frontend',
        QualificationLevel: 4
      },
      {
        WorkerID: 'W002',
        WorkerName: 'Jane Smith',
        Skills: ['Python', 'Django', 'PostgreSQL'],
        AvailableSlots: [2, 3, 4],
        MaxLoadPerPhase: 3,
        WorkerGroup: 'Backend',
        QualificationLevel: 5
      }
    ];
    
    const sampleTasks: Task[] = [
      {
        TaskID: 'T001',
        TaskName: 'Frontend Development',
        Category: 'Development',
        Duration: 2,
        RequiredSkills: ['JavaScript', 'React'],
        PreferredPhases: [1, 2],
        MaxConcurrent: 1
      },
      {
        TaskID: 'T002',
        TaskName: 'API Development',
        Category: 'Backend',
        Duration: 3,
        RequiredSkills: ['Node.js'],
        PreferredPhases: [2, 3],
        MaxConcurrent: 2
      },
      {
        TaskID: 'T003',
        TaskName: 'Database Design',
        Category: 'Database',
        Duration: 1,
        RequiredSkills: ['PostgreSQL'],
        PreferredPhases: [1],
        MaxConcurrent: 1
      }
    ];
    
    updateClients(sampleClients);
    updateWorkers(sampleWorkers);
    updateTasks(sampleTasks);
    
    setTimeout(() => {
      validateData();
    }, 100);
    
    toast({
      title: "✨ Sample Data Loaded",
      description: "Drop your file. We'll do the rest.",
    });
    
    setActiveTab('data');
  };

  const totalRecords = data.clients.length + data.workers.length + data.tasks.length;
  const errorCount = data.validationErrors.filter(e => e.type === 'error').length;
  const warningCount = data.validationErrors.filter(e => e.type === 'warning').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-yellow-200 bg-clip-text text-transparent">
            🧙‍♂️ Data Alchemist Workshop
          </h1>
          <p className="text-purple-200 mb-4">This grid's smarter than it looks.</p>
          <div className="flex justify-center gap-4 mb-4">
            <Badge variant="outline" className="text-white">
              {totalRecords} Records Loaded
            </Badge>
            {errorCount > 0 && (
              <Badge variant="destructive">
                {errorCount} Errors
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge className="bg-orange-500">
                {warningCount} Warnings
              </Badge>
            )}
          </div>
          <div className="flex justify-center gap-2">
            <Button
              onClick={() => setDebugMode(!debugMode)}
              variant="outline"
              size="sm"
            >
              <Bug className="mr-2 h-4 w-4" />
              🐞 Debug Mode {debugMode ? 'ON' : 'OFF'}
            </Button>
            <Button
              onClick={exportData}
              className="magic-button"
              size="sm"
              disabled={totalRecords === 0}
            >
              <Package className="mr-2 h-4 w-4" />
              💛 Export Golden Data
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              📤 Upload
            </TabsTrigger>
            <TabsTrigger value="data">
              <Eye className="mr-2 h-4 w-4" />
              👁️ Data Grids
            </TabsTrigger>
            <TabsTrigger value="rules">
              <Zap className="mr-2 h-4 w-4" />
              ⚡ Rules
            </TabsTrigger>
            <TabsTrigger value="export">
              <Package className="mr-2 h-4 w-4" />
              📦 Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="magic-card">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4 glow-text">Step 1 – Upload</h2>
                <p className="text-gray-300 mb-6">Drop your file. We'll do the rest.</p>
                <FileUpload onFileUpload={handleFileUpload} />
              </CardContent>
            </Card>
            <div className="text-center">
              <Button
                onClick={loadSampleData}
                variant="outline"
                className="magic-button"
              >
                📁 Load Sample Data
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            {totalRecords > 0 && (
              <Card className="magic-card mb-4">
                <CardContent className="p-4 text-center">
                  <p className="text-purple-200 text-sm">Step 2 – Preview: Peek into the grid and spot the magic.</p>
                </CardContent>
              </Card>
            )}
            {data.clients.length > 0 && (
              <DataGrid
                data={data.clients}
                type="clients"
                validationErrors={data.validationErrors}
                onUpdateData={updateClients}
                onNaturalLanguageQuery={handleNaturalLanguageQuery}
              />
            )}
            {data.workers.length > 0 && (
              <DataGrid
                data={data.workers}
                type="workers"
                validationErrors={data.validationErrors}
                onUpdateData={updateWorkers}
                onNaturalLanguageQuery={handleNaturalLanguageQuery}
              />
            )}
            {data.tasks.length > 0 && (
              <DataGrid
                data={data.tasks}
                type="tasks"
                validationErrors={data.validationErrors}
                onUpdateData={updateTasks}
                onNaturalLanguageQuery={handleNaturalLanguageQuery}
              />
            )}
            {totalRecords === 0 && (
              <Card className="magic-card">
                <CardContent className="text-center p-12">
                  <p className="text-gray-400 text-lg mb-4">
                    No data uploaded yet. Drop your chaos here—we'll conjure structure.
                  </p>
                  <p className="text-sm text-purple-200">
                    You're not lost. You're exploring.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <Card className="magic-card mb-4">
              <CardContent className="p-4 text-center">
                <p className="text-purple-200 text-sm">Step 3 – Rule Writing: Write simple rules. Get structured logic.</p>
              </CardContent>
            </Card>
            <RuleBuilder
              rules={data.rules}
              onAddRule={addRule}
              onUpdateRule={updateRule}
              onDeleteRule={deleteRule}
            />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card className="magic-card mb-4">
              <CardContent className="p-4 text-center">
                <p className="text-purple-200 text-sm">Step 4 – Export: Grab your golden output and rule the realm.</p>
              </CardContent>
            </Card>
            <Card className="magic-card">
              <CardHeader>
                <CardTitle className="glow-text">📤 Export Your Golden Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Data Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Clients:</span>
                        <Badge>{data.clients.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Workers:</span>
                        <Badge>{data.workers.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Tasks:</span>
                        <Badge>{data.tasks.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Rules:</span>
                        <Badge>{data.rules.filter(r => r.enabled).length}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Validation Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Errors:</span>
                        <Badge variant={errorCount > 0 ? "destructive" : "default"}>
                          {errorCount}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Warnings:</span>
                        <Badge className={warningCount > 0 ? "bg-orange-500" : ""}>
                          {warningCount}
                        </Badge>
                      </div>
                      {errorCount === 0 && warningCount === 0 && (
                        <p className="text-green-400 text-sm">✨ Auto-fixes suggested. You still have the final say.</p>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={exportData}
                  className="magic-button w-full"
                  disabled={totalRecords === 0}
                >
                  <Package className="mr-2 h-4 w-4" />
                  💛 Download Complete Export
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {debugMode && (
          <Card className="magic-card mt-8">
            <CardHeader>
              <CardTitle className="text-orange-400">🧪 Debug Information</CardTitle>
              <p className="text-sm text-gray-300">Show me AI thoughts (for power users only 💥)</p>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-gray-300 bg-black/30 p-4 rounded overflow-auto">
                {JSON.stringify({
                  totalRecords,
                  validationErrors: data.validationErrors,
                  rulesCount: data.rules.length,
                  activeTab
                }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DataAlchemistApp;
