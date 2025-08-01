
'use client';

import { useState, useTransition, useCallback, ChangeEvent } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
  HelpCircle,
  Lightbulb,
  Calendar,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  extractLinkedInDataAction,
  generatePostSuggestionsAction,
  summarizeExtractedDataAction,
} from '@/lib/actions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes } from 'firebase/storage';

type AnalysisProgress =
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'analyzing'
  | 'done'
  | 'error';

const progressMessages: Record<AnalysisProgress, string> = {
  idle: 'Analyze My Data',
  uploading: 'Uploading file...',
  extracting: 'Extracting data...',
  analyzing: 'Analyzing with AI...',
  done: 'Analysis Complete!',
  error: 'Analysis Failed',
};

// Stat Card Component
const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  children,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  description: string;
  children?: React.ReactNode;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
      {children}
    </CardContent>
  </Card>
);

// Data Upload Component
const DataUpload = ({
  onFileUpload,
  isPending,
  selectedFile,
  setSelectedFile,
  progress,
}: {
  onFileUpload: (file: File) => void;
  isPending: boolean;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  progress: AnalysisProgress;
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
              {progressMessages[progress]}
            </>
          ) : (
            'Analyze My Data'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

// Post Suggestion Component
const PostSuggestionGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!prompt) return;
    setError('');
    setSuggestions([]);
    startTransition(async () => {
      const result = await generatePostSuggestionsAction({ prompt });
      if (result.error) {
        setError(result.error);
        toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description: result.error,
        });
      } else if (result.suggestions) {
        setSuggestions(result.suggestions);
        toast({
          title: 'Suggestions Ready!',
          description: 'We have generated some post ideas for you.',
        });
      }
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="mr-2 h-5 w-5 text-primary" />
          Post Idea Generator
        </CardTitle>
        <CardDescription>
          Enter a topic and let AI generate engaging post ideas for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="e.g., 'the future of artificial intelligence in marketing'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isPending}
        />
        <Button
          onClick={handleGenerate}
          disabled={!prompt || isPending}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            'Generate Ideas'
          )}
        </Button>
      </CardContent>
      {(suggestions.length > 0 || error) && (
        <CardFooter className="flex flex-col items-start space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {suggestions.length > 0 && (
            <div className="space-y-4 w-full">
              <h4 className="font-semibold">Here are your suggestions:</h4>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="prose prose-sm max-w-none text-foreground border rounded-md p-3 relative"
                >
                  <p>{suggestion}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(suggestion)}
                  >
                    Copy
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  // In a real app, this would come from your auth/user state
  const [userPlan, setUserPlan] = useState('Pro');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<AnalysisProgress>('idle');
  const [isAnalyzePending, startAnalyzeTransition] = useTransition();
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

      setError('');
      setSummary('');
      setProgress('idle');

      startAnalyzeTransition(async () => {
        try {
          // 1. Upload to Firebase Storage
          setProgress('uploading');
          const storagePath = `backups/${user.uid}/${file.name}`;
          const storageRef = ref(storage, storagePath);
          await uploadBytes(storageRef, file);
          toast({
            title: 'File Uploaded!',
            description: 'Your backup is now being processed.',
          });

          // 2. Call AI action to extract data
          setProgress('extracting');
          const extractResult = await extractLinkedInDataAction({ storagePath });

          if (extractResult.error || !extractResult.data) {
             throw new Error(extractResult.error || 'Failed to extract data.');
          }

          // 3. Call AI action to summarize the extracted data
          setProgress('analyzing');
          const summaryResult = await summarizeExtractedDataAction(extractResult.data);
          
          if (summaryResult.error) {
             throw new Error(summaryResult.error);
          } else if (summaryResult.summary) {
            setSummary(summaryResult.summary);
            setProgress('done');
            toast({
              title: 'Analysis Complete!',
              description: 'Your LinkedIn activity summary is ready.',
            });
          }
        } catch (e: any) {
          setError(e.message);
          setProgress('error');
          toast({
            variant: 'destructive',
            title: 'An Unexpected Error Occurred',
            description: e.message,
          });
        }
      });
    },
    [user, toast]
  );

  const handleAddToCalendar = () => {
    const nextBackupDate = new Date();
    const backupInterval = userPlan === 'Pro' ? 7 : 30; // Weekly for Pro, Monthly for Free
    nextBackupDate.setDate(nextBackupDate.getDate() + backupInterval);

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const event = {
      title: 'LinkStream Data Backup Reminder',
      description: `Reminder to perform your ${
        userPlan === 'Pro' ? 'weekly' : 'monthly'
      } LinkedIn data backup on LinkStream.`,
      startTime: formatDate(nextBackupDate),
      endTime: formatDate(new Date(nextBackupDate.getTime() + 30 * 60000)), // 30 minute duration
    };

    const calendarUrl = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `URL:${document.URL}`,
      `DTSTART:${event.startTime}`,
      `DTEND:${event.endTime}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const blob = new Blob([calendarUrl], {
      type: 'text/calendar;charset=utf-8',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'linkstream-backup-reminder.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: 'Reminder Added!',
      description: 'The backup reminder has been downloaded.',
    });
  };

  const getNextBackupDate = () => {
    const date = new Date();
    if (userPlan === 'Pro') date.setDate(date.getDate() + 7);
    else if (userPlan === 'Free') date.setDate(date.getDate() + 30);
    else return null; // Business has unlimited, so no 'next' date
    return date;
  };

  const nextBackupDate = getNextBackupDate();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">
          Dashboard
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        {nextBackupDate && (
          <StatCard
            title="Next Backup"
            value={nextBackupDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
            })}
            icon={Calendar}
            description={`Based on your ${userPlan} plan`}
          >
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={handleAddToCalendar}
            >
              Add to calendar
            </Button>
          </StatCard>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7 lg:gap-8">
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
              {isAnalyzePending && progress !== 'idle' && progress !== 'done' && (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-4 font-semibold">{progressMessages[progress]}</p>
                  <p className="text-sm text-muted-foreground">This may take a few moments...</p>
                </div>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {summary && !isAnalyzePending && (
                <div className="prose prose-sm max-w-none text-foreground">
                  {summary.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              )}
              {!isAnalyzePending && !summary && !error && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Your activity summary will appear here after you upload and
                  analyze your data.
                </div>
              )}
            </CardContent>
            {summary && (userPlan === 'Pro' || userPlan === 'Business') && (
              <CardFooter>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Raw Data
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
        <div className="lg:col-span-3">
          <div className="space-y-4">
            <DataUpload
              onFileUpload={handleFileUpload}
              isPending={isAnalyzePending}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              progress={progress}
            />
            <PostSuggestionGenerator />
          </div>
        </div>
      </div>
    </main>
  );
}

    