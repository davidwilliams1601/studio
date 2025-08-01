
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeLinkedInDataAction } from './actions';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes } from 'firebase/storage';

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

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

      startProcessingTransition(async () => {
        try {
          const storagePath = `backups/${user.uid}/${Date.now()}-${file.name}`;
          const storageRef = ref(storage, storagePath);
          await uploadBytes(storageRef, file);
          toast({
            title: 'File Uploaded!',
            description: 'Now processing your backup...',
          });

          const result = await analyzeLinkedInDataAction({ storagePath });

          if (result.error) {
            throw new Error(result.error);
          }
          
          if (result.data) {
              toast({
                title: 'Processing Complete!',
                description: `Extracted data saved to: ${result.data.processedPath}`,
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
           <DataUpload
              onFileUpload={handleFileUpload}
              isPending={isProcessing}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
            />
        </div>
      </div>
    </main>
  );
}
