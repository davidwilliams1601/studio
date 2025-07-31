'use client';

import { useState, useTransition, useCallback, ChangeEvent } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  FileText,
  MessageSquare,
  UploadCloud,
  File,
  Loader2,
  BrainCircuit,
  Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { summarizeActivityAction } from '@/lib/actions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Stat Card Component
const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  description: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

// Data Upload Component
const DataUpload = ({
  onFileUpload,
  isPending,
  selectedFile,
  setSelectedFile,
}: {
  onFileUpload: (file: File) => void;
  isPending: boolean;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow drop
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/zip') {
        setSelectedFile(file);
      } else {
        alert('Please upload a ZIP file.');
      }
      e.dataTransfer.clearData();
    }
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
       setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Your Data</CardTitle>
        <CardDescription>
          Drag and drop your LinkedIn data export ZIP file here.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors ${isDragging ? 'border-primary bg-accent' : ''}`}
        >
          <UploadCloud className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="font-semibold">
            Drag & drop your file here or click to browse
          </p>
          <p className="text-sm text-muted-foreground">
            (LinkedInData.zip)
          </p>
          <input type="file" className="absolute inset-0 h-full w-full opacity-0 cursor-pointer" accept=".zip" onChange={handleFileChange} />
        </div>
        {selectedFile && (
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
              <File className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedFile(null)}
            >
              <span className="sr-only">Remove file</span>
              &times;
            </Button>
          </div>
        )}
        <Button
          onClick={() => selectedFile && onFileUpload(selectedFile)}
          disabled={!selectedFile || isPending}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
            </>
          ) : (
            'Analyze My Data'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFileUpload = useCallback(
    (file: File) => {
      setError('');
      setSummary('');
      startTransition(async () => {
        // In a real app, you would read the ZIP file and extract the content.
        // For this demo, we'll send placeholder data to the AI action.
        const dummyData = {
          connections: 'firstName,lastName,company,connectedOn\nJohn,Doe,Google,2023-01-01',
          messages: 'from,to,date,content\nJane,Doe,2023-02-01,Hi there',
          articles: 'title,date,url\nMy First Post,2023-03-01,http://example.com',
          profile: '{ "name": "Demo User", "headline": "AI Enthusiast" }',
        };

        const result = await summarizeActivityAction(dummyData);

        if (result.error) {
          setError(result.error);
          toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: result.error,
          });
        } else if (result.summary) {
          setSummary(result.summary);
          toast({
            title: 'Analysis Complete!',
            description: 'Your LinkedIn activity summary is ready.',
          });
        }
      });
    },
    [toast]
  );

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">
          Dashboard
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Connections"
          value="1,204"
          icon={Users}
          description="+23 since last upload"
        />
        <StatCard
          title="Recent Posts"
          value="5"
          icon={FileText}
          description="in the last 30 days"
        />
        <StatCard
          title="Recent Messages"
          value="Mar 15, 2024"
          icon={MessageSquare}
          description="Date of most recent message"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-3">
          <DataUpload
            onFileUpload={handleFileUpload}
            isPending={isPending}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
          />
        </div>
        <div className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BrainCircuit className="mr-2 h-5 w-5 text-primary" />
                AI-Powered Summary
              </CardTitle>
              <CardDescription>
                Key trends and insights from your LinkedIn activity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPending && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {summary && !isPending && (
                <div className="prose prose-sm max-w-none text-foreground">
                  {summary.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              )}
              {!isPending && !summary && !error && (
                <div className="text-center text-sm text-muted-foreground p-8">
                  Your activity summary will appear here after you upload and
                  analyze your data.
                </div>
              )}
            </CardContent>
            {summary && (
              <CardContent>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Raw Data
                </Button>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}
