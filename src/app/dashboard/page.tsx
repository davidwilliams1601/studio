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
  UploadCloud,
  File,
  Loader2,
  HelpCircle,
  Users,
  MessageSquare,
  FileText,
  Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Upload Your Data</CardTitle>
            <CardDescription>
              Drag and drop your LinkedIn data export ZIP file here.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/guide">
              <HelpCircle className="mr-2 h-4 w-4" />
              How to Export
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
            isDragging ? 'border-primary bg-accent' : ''
          }`}
        >
          <UploadCloud className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="font-semibold">
            Drag & drop your file here or click to browse
          </p>
          <p className="text-sm text-muted-foreground">
            (Your .zip file from LinkedIn)
          </p>
          <input
            type="file"
            className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
            accept=".zip"
            onChange={handleFileChange}
          />
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
              Uploading & Processing...
            </>
          ) : (
            'Process My Data'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

type AnalysisResult = {
  processedPath: string;
  connectionCount: number;
  messageCount: number;
  articleCount: number;
};

const DashboardStats = ({ stats }: { stats: AnalysisResult }) => {
    const handleDownload = async () => {
        try {
            const url = await getDownloadURL(ref(storage, stats.processedPath));
            // This opens the download URL in a new tab.
            // For force-download, a more complex setup with backend headers is needed.
            window.open(url, '_blank');
        } catch (error) {
            console.error("Error getting download URL:", error);
            alert("Could not get download link.");
        }
    };
    
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Complete</CardTitle>
        <CardDescription>
          Here's a summary of your LinkedIn data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connections</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.connectionCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.messageCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.articleCount}</div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download Extracted Data
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isProcessing, startProcessingTransition] = useTransition();
  const { toast } = useToast();

  const handleFileUpload = useCallback(
    (file: File) => {
      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Not authenticated',
          description: 'You must be logged in to upload a file.',
        });
        return;
      }

      setAnalysisResult(null); // Reset previous results

      startProcessingTransition(async () => {
        try {
          // Step 1: Upload file to Firebase Storage
          const storagePath = `backups/${user.uid}/${Date.now()}-${file.name}`;
          const storageRef = ref(storage, storagePath);
          await uploadBytes(storageRef, file);
          toast({
            title: 'File Uploaded!',
            description: 'Now processing your backup...',
          });

          // Step 2: Call the API route to process the file
          const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storagePath }),
          });

          const result = await res.json();

          if (result.error) {
            throw new Error(result.error);
          }

          if (result.data) {
            setAnalysisResult(result.data);
            toast({
              title: 'Processing Complete!',
              description: 'Your dashboard has been updated.',
            });
          }
        } catch (e: any) {
          console.error('An error occurred during processing:', e);
          const errorMessage = e.message || 'An unknown error occurred.';
          toast({
            variant: 'destructive',
            title: 'An Unexpected Error Occurred',
            description: errorMessage,
          });
        }
      });
    },
    [user, toast]
  );

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">
          Dashboard
        </h1>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="lg:col-span-1">
          {analysisResult ? (
            <DashboardStats stats={analysisResult} />
          ) : (
            <DataUpload
              onFileUpload={handleFileUpload}
              isPending={isProcessing}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
            />
          )}
        </div>
      </div>
    </main>
  );
}