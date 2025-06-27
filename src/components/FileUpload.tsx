
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileUpload: (file: File, type: 'clients' | 'workers' | 'tasks') => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const fileName = file.name.toLowerCase();
      let type: 'clients' | 'workers' | 'tasks';
      
      if (fileName.includes('client')) {
        type = 'clients';
      } else if (fileName.includes('worker')) {
        type = 'workers';
      } else if (fileName.includes('task')) {
        type = 'tasks';
      } else {
        toast({
          title: "File type detection",
          description: `Could not auto-detect type for ${file.name}. Please rename your file to include 'client', 'worker', or 'task'.`,
          variant: "destructive"
        });
        return;
      }
      
      onFileUpload(file, type);
      toast({
        title: "File uploaded",
        description: `${file.name} detected as ${type} data`,
      });
    });
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: true
  });

  return (
    <Card className="magic-card">
      <CardContent className="p-8">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-magic-purple bg-magic-purple/10' : 'border-gray-300 hover:border-magic-purple'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-magic-purple mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-white">
            {isDragActive ? 'Drop the files here...' : 'Smart File Upload'}
          </h3>
          <p className="text-gray-300 mb-4">
            Drop your CSV or Excel files here, or click to select files
          </p>
          <p className="text-sm text-gray-400 mb-4">
            We'll auto-detect clients, workers, and tasks files
          </p>
          <Button className="magic-button">
            <FileText className="mr-2 h-4 w-4" />
            Choose Files
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
