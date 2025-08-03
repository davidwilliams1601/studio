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
  UserCircle,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { Badge } from '@/components/ui/badge';

type ProfileData = {
  name: string;
  headline: string;
  summary: string;
  skills: string[];
};

type AnalysisResult = {
  processedPath: string;
  connectionCount: number;
  messageCount: number;
  articleCount: number;
  profile: ProfileData | null;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isProcessing, startProcessingTransition] = useTransition();
  const { toast } = useToast();

  const handleFileUploadClientSide = useCallback(
    async (file: File) => {
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to upload files.',
          variant: 'destructive',
        });
        return;
      }

      startProcessingTransition(async () => {
        try {
          const JSZip = (await import('jszip')).default;

          const arrayBuffer = await file.arrayBuffer();
          const zip = await JSZip.loadAsync(arrayBuffer);

          let connectionCount = 0;
          let messageCount = 0;
          let articleCount = 0;
          let profileData: ProfileData | null = null;

          // Look for connections file
          const connectionFiles = ['Connections.csv', 'connections.csv'];
          for (const fileName of connectionFiles) {
            const connectionsFile = zip.file(fileName);
            if (connectionsFile) {
              const content = await connectionsFile.async('string');
              const lines = content.split('\n').filter((line) => line.trim());
              connectionCount = Math.max(0, lines.length - 1);
              break;
            }
          }

          // Look for messages
          const messagesFolder = zip.folder('messages') || zip.folder('Messages');
          if (messagesFolder) {
            messagesFolder.forEach((relativePath, file) => {
              if (file.name.endsWith('.csv') && !file.dir) {
                messageCount++;
              }
            });
          } else {
            const messageFiles = ['messages.csv', 'Messages.csv'];
            for (const fileName of messageFiles) {
              const messagesFile = zip.file(fileName);
              if (messagesFile) {
                const content = await messagesFile.async('string');
                const lines = content.split('\n').filter((line) => line.trim());
                messageCount = Math.max(0, lines.length - 1);
                break;
              }
            }
          }

          // Look for articles/posts
          const articleFiles = [
            'Posts.csv',
            'posts.csv',
            'articles.csv',
            'Articles.csv',
          ];
          for (const fileName of articleFiles) {
            const articlesFile = zip.file(fileName);
            if (articlesFile) {
              const content = await articlesFile.async('string');
              const lines = content.split('\n').filter((line) => line.trim());
              articleCount = Math.max(0, lines.length - 1);
              break;
            }
          }

          // Look for Profile.json
          const profileFile = zip.file('Profile.json');
          if (profileFile) {
            const content = await profileFile.async('string');
            const data = JSON.parse(content);
            profileData = {
              name: `${data['First Name']} ${data['Last Name']}`,
              headline: data.Headline,
              summary: data.Summary,
              skills: data.Skills?.map((s: any) => s.Name) || [],
            };
          }

          // Upload the file to storage for backup
          const storagePath = `backups/${user.uid}/${Date.now()}-${file.name}`;
          const storageRef = ref(storage, storagePath);
          await uploadBytes(storageRef, file);

          setAnalysisResult({
            processedPath: storagePath,
            connectionCount,
            messageCount,
            articleCount,
            profile: profileData,
          });

          toast({
            title: 'Analysis complete',
            description: 'Your LinkedIn data has been successfully analyzed.',
          });
        } catch (error: any) {
          console.error('Client-side processing error:', error);

          toast({
            title: 'Processing failed',
            description:
              error.message || 'An error occurred during processing',
            variant: 'destructive',
          });
          setAnalysisResult(null);
        }
      });
    },
    [user, toast]
  );

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.zip')) {
        toast({
          title: 'Invalid file type',
          description:
            'Please upload a ZIP file containing your LinkedIn data export.',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
      handleFileUploadClientSide(file);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="mb-8 text-center">
        <h1 className="font-headline text-3xl font-bold">
          LinkedIn Data Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload your LinkedIn data export to analyze your network and activity.
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl mx-auto w-full">
        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5" />
              Upload LinkedIn Data
            </CardTitle>
            <CardDescription>
              Select your LinkedIn data export ZIP file to begin analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!isProcessing && !analysisResult && (
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      Choose your LinkedIn data file
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Upload a ZIP file from your LinkedIn data export
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleFileSelect}
                    className="mt-4 block w-full text-sm text-muted-foreground
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-md file:border-0
                             file:text-sm file:font-medium
                             file:bg-primary/10 file:text-primary
                             hover:file:bg-primary/20
                             cursor-pointer"
                  />
                </div>
              )}

              {isProcessing && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="text-center">
                    <p className="font-medium">
                      Processing your LinkedIn data...
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Analyzing your data locally for faster processing.
                    </p>
                  </div>
                </div>
              )}

              {analysisResult && (
                <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg border border-accent">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium text-accent-foreground">
                        Analysis Complete
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedFile?.name} processed successfully
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetUpload}>
                    Upload New File
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {analysisResult && (
          <div className="grid gap-6">
            {/* Profile Card */}
            {analysisResult.profile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5" />
                    Profile Analysis
                  </CardTitle>
                  <CardDescription>
                    Your professional summary and skills.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{analysisResult.profile.name}</h3>
                    <p className="text-muted-foreground">{analysisResult.profile.headline}</p>
                  </div>
                  {analysisResult.profile.summary && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Summary</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {analysisResult.profile.summary}
                      </p>
                    </div>
                  )}
                  {analysisResult.profile.skills?.length > 0 && (
                     <div className="space-y-2">
                      <h4 className="font-semibold">Top Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.profile.skills.slice(0, 10).map((skill) => (
                           <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Activity Overview
                </CardTitle>
                <CardDescription>
                  Key metrics from your LinkedIn activity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-secondary rounded-lg">
                    <Users className="mx-auto h-10 w-10 text-primary mb-3" />
                    <p className="text-3xl font-bold">
                      {analysisResult.connectionCount.toLocaleString()}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                      Connections
                    </p>
                  </div>

                  <div className="text-center p-6 bg-secondary rounded-lg">
                    <MessageSquare className="mx-auto h-10 w-10 text-primary mb-3" />
                    <p className="text-3xl font-bold">
                      {analysisResult.messageCount.toLocaleString()}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                      Messages
                    </p>
                  </div>

                  <div className="text-center p-6 bg-secondary rounded-lg">
                    <FileText className="mx-auto h-10 w-10 text-primary mb-3" />
                    <p className="text-3xl font-bold">
                      {analysisResult.articleCount.toLocaleString()}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                      Posts
                    </p>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              How to Export Your LinkedIn Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>To get your LinkedIn data export:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Go to LinkedIn Settings & Privacy</li>
                <li>Click on "Data Privacy" in the left sidebar</li>
                <li>Select "Get a copy of your data"</li>
                <li>
                  Choose "Want something in particular? Select the data files
                  you're most interested in"
                </li>
                <li>
                  Select the data types you want (Connections, Messages, Posts,
                  etc.)
                </li>
                <li>
                  Click "Request archive" and wait for the email with your
                  download link
                </li>
              </ol>
              <p className="text-xs text-muted-foreground mt-4">
                Note: LinkedIn may take up to 24 hours to prepare your data
                export.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
