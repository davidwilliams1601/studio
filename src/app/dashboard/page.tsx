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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  UploadCloud,
  File,
  Loader2,
  HelpCircle,
  Users,
  MessageSquare,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Building,
  MapPin,
  Hash,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Target,
  Globe,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

type AnalysisResult = {
  processedPath: string;
  connectionCount: number;
  messageCount: number;
  articleCount: number;
  messageThreads?: number;
  postEngagements?: number;
  // Enhanced analysis data
  topCompanies?: Array<{name: string, count: number}>;
  topPositions?: Array<{title: string, count: number}>;
  topLocations?: Array<{location: string, count: number}>;
  connectionGrowth?: Array<{date: string, count: number}>;
  messageAnalysis?: {
    totalConversations: number;
    avgMessagesPerConversation: number;
    mostActiveContacts: Array<{name: string, messageCount: number}>;
  };
  postAnalysis?: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    avgEngagementPerPost: number;
    topPerformingPosts: Array<{content: string, likes: number, comments: number}>;
    postingFrequency: Array<{month: string, count: number}>;
  };
  industryBreakdown?: Array<{industry: string, count: number, percentage: number}>;
  seniorityLevels?: Array<{level: string, count: number, percentage: number}>;
  networkInsights?: {
    networkDensity: number;
    diversityScore: number;
    influencerConnections: number;
  };
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isProcessing, startProcessingTransition] = useTransition();
  const { toast } = useToast();

  // Enhanced client-side processing with deep analysis
  const handleFileUploadClientSide = useCallback(
    async (file: File) => {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to upload files.",
          variant: "destructive",
        });
        return;
      }

      startProcessingTransition(async () => {
        try {
          console.log('Starting enhanced client-side processing...');

          // Import JSZip dynamically
          const JSZip = (await import('jszip')).default;

          // Read the file
          const arrayBuffer = await file.arrayBuffer();
          const zip = await JSZip.loadAsync(arrayBuffer);

          console.log('ZIP loaded, analyzing contents...');
          console.log('Files in ZIP:', Object.keys(zip.files));

          let connectionCount = 0;
          let messageCount = 0;
          let articleCount = 0;
          let messageThreads = 0;
          let postEngagements = 0;

          // Enhanced analysis data
          const companies: {[key: string]: number} = {};
          const positions: {[key: string]: number} = {};
          const locations: {[key: string]: number} = {};
          const industries: {[key: string]: number} = {};
          const connectionDates: string[] = [];
          const messageAnalysis = {
            totalConversations: 0,
            conversations: [] as any[],
            contacts: {} as {[key: string]: number}
          };
          const postAnalysis = {
            totalPosts: 0,
            totalLikes: 0,
            totalComments: 0,
            posts: [] as any[],
            postingDates: [] as string[]
          };

          // Enhanced CSV parser that handles quotes and commas properly
          const parseCSV = (csvContent: string) => {
            if (!csvContent || csvContent.trim().length === 0) return [];
            
            const lines = csvContent.split('\n').filter(line => line.trim());
            if (lines.length === 0) return [];
            
            console.log('Parsing CSV with', lines.length, 'lines');
            console.log('First few lines:', lines.slice(0, 3));
            
            // Better CSV parsing that handles quoted fields
            const parseLine = (line: string) => {
              const result = [];
              let current = '';
              let inQuotes = false;
              
              for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"') {
                  inQuotes = !inQuotes;
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
            
            const headers = parseLine(lines[0]);
            console.log('CSV Headers:', headers);
            
            const data = [];
            for (let i = 1; i < lines.length; i++) {
              const values = parseLine(lines[i]);
              const row: {[key: string]: string} = {};
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              data.push(row);
            }
            
            console.log('Parsed', data.length, 'rows');
            return data;
          };

          // Analyze connections with detailed breakdown
          const connectionFiles = ['Connections.csv', 'connections.csv'];
          for (const fileName of connectionFiles) {
            const connectionsFile = zip.file(fileName);
            if (connectionsFile) {
              const content = await connectionsFile.async('string');
              const connections = parseCSV(content);
              connectionCount = connections.length;
              
              console.log('Analyzing', connectionCount, 'connections...');
              
              // Analyze company, position, location data
              connections.forEach(conn => {
                if (conn.Company) {
                  companies[conn.Company] = (companies[conn.Company] || 0) + 1;
                }
                if (conn.Position) {
                  positions[conn.Position] = (positions[conn.Position] || 0) + 1;
                }
                if (conn.Location) {
                  locations[conn.Location] = (locations[conn.Location] || 0) + 1;
                }
                if (conn['Connected On']) {
                  connectionDates.push(conn['Connected On']);
                }
              });
              
              break;
            }
          }

          // Analyze messages with thread counting and contact analysis
          const messagesFolder = zip.folder('messages') || zip.folder('Messages');
          if (messagesFolder) {
            console.log('Analyzing message threads...');
            let totalMessages = 0;
            const conversations: any[] = [];
            
            messagesFolder.forEach((relativePath, file) => {
              if (file.name.endsWith('.csv') && !file.dir) {
                messageThreads++;
                conversations.push(file.name);
              }
            });
            
            // Sample a few conversations for detailed analysis
            const sampleSize = Math.min(5, messageThreads);
            let sampledConversations = 0;
            
            for (const [relativePath, file] of Object.entries(messagesFolder.files)) {
              if (file.name.endsWith('.csv') && !file.dir && sampledConversations < sampleSize) {
                try {
                  const content = await file.async('string');
                  const messages = parseCSV(content);
                  totalMessages += messages.length;
                  
                  // Extract contact name from filename or content
                  const contactName = file.name.replace('.csv', '').replace(/.*\//, '');
                  messageAnalysis.contacts[contactName] = messages.length;
                  
                  sampledConversations++;
                } catch (e) {
                  console.warn('Could not parse conversation:', file.name);
                }
              }
            }
            
            messageCount = messageThreads > 0 && sampleSize > 0 ? Math.round((totalMessages / sampleSize) * messageThreads) : 0;
            messageAnalysis.totalConversations = messageThreads;
          } else {
            // Look for direct messages file
            const messageFiles = ['messages.csv', 'Messages.csv'];
            for (const fileName of messageFiles) {
              const messagesFile = zip.file(fileName);
              if (messagesFile) {
                const content = await messagesFile.async('string');
                const messages = parseCSV(content);
                messageCount = messages.length;
                messageThreads = 1;
                break;
              }
            }
          }

          // Analyze posts with engagement metrics
          const postFiles = ['Posts.csv', 'posts.csv', 'Share Updates.csv'];
          for (const fileName of postFiles) {
            const postsFile = zip.file(fileName);
            if (postsFile) {
              const content = await postsFile.async('string');
              const posts = parseCSV(content);
              articleCount = posts.length;
              
              console.log('Analyzing', articleCount, 'posts...');
              
              posts.forEach(post => {
                const likes = parseInt(post.Likes || post['Number of Likes'] || '0');
                const comments = parseInt(post.Comments || post['Number of Comments'] || '0');
                const shares = parseInt(post.Shares || post['Number of Shares'] || '0');
                
                postAnalysis.totalLikes += likes;
                postAnalysis.totalComments += comments;
                postEngagements += likes + comments + shares;
                
                if (post.Date || post['Created Date']) {
                  postAnalysis.postingDates.push(post.Date || post['Created Date']);
                }
                
                postAnalysis.posts.push({
                  content: (post.Content || post.Text || '').substring(0, 100) + '...',
                  likes,
                  comments,
                  shares,
                  engagement: likes + comments + shares
                });
              });
              
              postAnalysis.totalPosts = articleCount;
              break;
            }
          }

          // Create insights from the data
          const topCompanies = Object.entries(companies)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([name, count]) => ({name, count}));

          const topPositions = Object.entries(positions)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([title, count]) => ({title, count}));

          const topLocations = Object.entries(locations)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([location, count]) => ({location, count}));

          const mostActiveContacts = Object.entries(messageAnalysis.contacts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, messageCount]) => ({name, messageCount}));

          const topPerformingPosts = postAnalysis.posts
            .sort((a, b) => b.engagement - a.engagement)
            .slice(0, 5);

          // Calculate network insights
          const networkInsights = {
            networkDensity: connectionCount > 0 ? (messageThreads / connectionCount) * 100 : 0,
            diversityScore: Object.keys(companies).length > 0 ? (Object.keys(companies).length / connectionCount) * 100 : 0,
            influencerConnections: topCompanies.slice(0, 3).reduce((sum, comp) => sum + comp.count, 0)
          };

          console.log('Enhanced analysis complete:', {
            connectionCount,
            messageCount,
            messageThreads,
            articleCount,
            postEngagements,
            companiesFound: Object.keys(companies).length,
            topCompanies: topCompanies.slice(0, 3)
          });

          // Upload the file to storage for backup
          const storagePath = `backups/${user.uid}/${Date.now()}-${file.name}`;
          const storageRef = ref(storage, storagePath);
          await uploadBytes(storageRef, file);

          setAnalysisResult({
            processedPath: storagePath,
            connectionCount,
            messageCount,
            articleCount,
            messageThreads,
            postEngagements,
            topCompanies,
            topPositions,
            topLocations,
            messageAnalysis: {
              totalConversations: messageAnalysis.totalConversations,
              avgMessagesPerConversation: messageCount > 0 && messageThreads > 0 ? Math.round(messageCount / messageThreads) : 0,
              mostActiveContacts
            },
            postAnalysis: {
              totalPosts: postAnalysis.totalPosts,
              totalLikes: postAnalysis.totalLikes,
              totalComments: postAnalysis.totalComments,
              avgEngagementPerPost: articleCount > 0 ? Math.round(postEngagements / articleCount) : 0,
              topPerformingPosts,
              postingFrequency: [] // Could be calculated from postingDates
            },
            networkInsights
          });

          toast({
            title: "Enhanced analysis complete",
            description: "Your LinkedIn data has been thoroughly analyzed with insights.",
          });

        } catch (error: any) {
          console.error('Enhanced processing error:', error);
          
          toast({
            title: "Processing failed",
            description: error.message || "An error occurred during processing",
            variant: "destructive",
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
      console.log('File selected:', file.name, 'Size:', file.size);
      
      if (!file.name.endsWith('.zip')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a ZIP file containing your LinkedIn data export.",
          variant: "destructive",
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
        <h1 className="font-headline text-3xl font-bold">LinkedIn Data Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Upload your LinkedIn data export to get deep insights into your professional network.
        </p>
      </div>

      <div className="grid gap-6 max-w-6xl mx-auto w-full">
        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5" />
              Upload LinkedIn Data
            </CardTitle>
            <CardDescription>
              Select your LinkedIn data export ZIP file to begin comprehensive analysis.
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
                    <p className="font-medium">Analyzing your LinkedIn data...</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Processing connections, messages, posts, and generating insights.
                    </p>
                  </div>
                </div>
              )}

              {analysisResult && (
                <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg border border-accent">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium text-accent-foreground">Analysis Complete</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedFile?.name} processed with deep insights
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

        {/* Results with Tabs */}
        {analysisResult && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Key Metrics
                  </CardTitle>
                  <CardDescription>
                    High-level overview of your LinkedIn data and activity.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <Users className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                      <p className="text-2xl font-bold">
                        {analysisResult.connectionCount.toLocaleString()}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">Connections</p>
                    </div>

                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <MessageSquare className="mx-auto h-8 w-8 text-green-600 mb-2" />
                      <p className="text-2xl font-bold">
                        {analysisResult.messageCount.toLocaleString()}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">Messages</p>
                    </div>

                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <Hash className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                      <p className="text-2xl font-bold">
                        {analysisResult.messageThreads?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">Conversations</p>
                    </div>

                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <FileText className="mx-auto h-8 w-8 text-orange-600 mb-2" />
                      <p className="text-2xl font-bold">
                        {analysisResult.articleCount.toLocaleString()}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">Posts</p>
                    </div>

                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <Activity className="mx-auto h-8 w-8 text-red-600 mb-2" />
                      <p className="text-2xl font-bold">
                        {analysisResult.postEngagements?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">Engagements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Network Tab */}
            <TabsContent value="network" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Top Companies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisResult.topCompanies?.slice(0, 8).map((company, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{company.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{width: `${(company.count / (analysisResult.topCompanies?.[0]?.count || 1)) * 100}%`}}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{company.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Top Locations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisResult.topLocations?.slice(0, 8).map((location, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{location.location}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{width: `${(location.count / (analysisResult.topLocations?.[0]?.count || 1)) * 100}%`}}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{location.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Top Positions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisResult.topPositions?.slice(0, 6).map((position, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate mr-2">{position.title}</span>
                          <span className="text-sm text-muted-foreground">{position.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Network Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Network Density</span>
                          <span className="text-sm text-muted-foreground">
                            {analysisResult.networkInsights?.networkDensity.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{width: `${Math.min(analysisResult.networkInsights?.networkDensity || 0, 100)}%`}}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Ratio of your conversations to connections.</p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Diversity Score</span>
                          <span className="text-sm text-muted-foreground">
                            {analysisResult.networkInsights?.diversityScore.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{width: `${Math.min(analysisResult.networkInsights?.diversityScore || 0, 100)}%`}}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Based on the number of unique companies in your network.</p>
                      </div>

                       <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Influencer Index</span>
                           <span className="text-sm text-muted-foreground">
                            {analysisResult.networkInsights?.influencerConnections.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{width: `${Math.min(((analysisResult.networkInsights?.influencerConnections || 0) / analysisResult.connectionCount) * 100, 100)}%`}}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Connections at your top 3 companies.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Message Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-secondary rounded">
                          <p className="text-xl font-bold">
                            {analysisResult.messageAnalysis?.totalConversations || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Conversations</p>
                        </div>
                        <div className="text-center p-3 bg-secondary rounded">
                          <p className="text-xl font-bold">
                            {analysisResult.messageAnalysis?.avgMessagesPerConversation || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Avg per Chat</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Most Active Contacts</h4>
                        <div className="space-y-2">
                          {analysisResult.messageAnalysis?.mostActiveContacts?.map((contact, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm">{contact.name}</span>
                              <span className="text-sm text-muted-foreground">{contact.messageCount} messages</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Post Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-secondary rounded">
                          <p className="text-lg font-bold text-blue-600">
                            {analysisResult.postAnalysis?.totalLikes || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Likes</p>
                        </div>
                        <div className="text-center p-2 bg-secondary rounded">
                          <p className="text-lg font-bold text-green-600">
                            {analysisResult.postAnalysis?.totalComments || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Comments</p>
                        </div>
                        <div className="text-center p-2 bg-secondary rounded">
                          <p className="text-lg font-bold text-purple-600">
                            {analysisResult.postAnalysis?.avgEngagementPerPost || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Avg/Post</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Top Performing Posts</h4>
                        <div className="space-y-3">
                          {analysisResult.postAnalysis?.topPerformingPosts?.slice(0, 3).map((post, index) => (
                            <div key={index} className="p-3 bg-secondary rounded">
                              <p className="text-sm mb-2">{post.content}</p>
                              <div className="flex gap-4 text-xs text-muted-foreground">
                                <span>{post.likes} likes</span>
                                <span>{post.comments} comments</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Network Analysis & Recommendations
                    </CardTitle>
                    <CardDescription>
                      AI-powered insights to help you optimize your LinkedIn strategy.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-green-700">✅ Strengths</h4>
                        <div className="space-y-2">
                          {analysisResult.connectionCount > 500 && (
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Strong Network Size</p>
                                <p className="text-xs text-muted-foreground">
                                  You have {analysisResult.connectionCount} connections, above the average of 500+
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {(analysisResult.networkInsights?.diversityScore || 0) > 20 && (
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Diverse Network</p>
                                <p className="text-xs text-muted-foreground">
                                  Good company diversity with {analysisResult.topCompanies?.length || 0} different organizations
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {(analysisResult.messageAnalysis?.totalConversations || 0) > 10 && (
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Active Communicator</p>
                                <p className="text-xs text-muted-foreground">
                                  You maintain {analysisResult.messageAnalysis?.totalConversations} active conversations
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {(analysisResult.postAnalysis?.totalPosts || 0) > 5 && (
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Content Creator</p>
                                <p className="text-xs text-muted-foreground">
                                  You've shared {analysisResult.postAnalysis?.totalPosts} posts with good engagement
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-semibold text-orange-700">💡 Recommendations</h4>
                        <div className="space-y-2">
                          {analysisResult.connectionCount < 500 && (
                            <div className="flex items-start gap-2">
                              <TrendingUp className="h-4 w-4 text-orange-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Grow Your Network</p>
                                <p className="text-xs text-muted-foreground">
                                  Consider connecting with professionals in your field to reach 500+ connections
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {(analysisResult.networkInsights?.diversityScore || 0) < 15 && (
                            <div className="flex items-start gap-2">
                              <Globe className="h-4 w-4 text-orange-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Diversify Your Network</p>
                                <p className="text-xs text-muted-foreground">
                                  Connect with professionals from different industries and companies
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {(analysisResult.postAnalysis?.avgEngagementPerPost || 0) < 5 && (
                            <div className="flex items-start gap-2">
                              <Activity className="h-4 w-4 text-orange-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Boost Post Engagement</p>
                                <p className="text-xs text-muted-foreground">
                                  Try posting more engaging content or at peak times to increase likes and comments
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {(analysisResult.messageAnalysis?.avgMessagesPerConversation || 0) < 3 && (
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-orange-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Deepen Conversations</p>
                                <p className="text-xs text-muted-foreground">
                                  Follow up more frequently with your connections to build stronger relationships
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Action Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium mb-3">This Week</h5>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Connect with 5 new professionals in your industry</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Comment on 3 posts from your network</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Share an industry article with your insights</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Send follow-up messages to 2 recent connections</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-3">This Month</h5>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Write and publish an original thought leadership post</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Join 2 industry-relevant LinkedIn groups</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Optimize your profile with keywords from top positions</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Schedule 15-min coffee chats with 3 key connections</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Data Export Card */}
        {analysisResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Your Analysis
              </CardTitle>
              <CardDescription>
                Download your analysis results for further use or record keeping.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (!analysisResult) return;
                    const dataStr = JSON.stringify(analysisResult, null, 2);
                    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                    const exportFileDefaultName = `linkedin-analysis-${new Date().toISOString().split('T')[0]}.json`;
                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download JSON
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (!analysisResult) return;
                    // Create a CSV export of key metrics
                    const csvData = [
                      ['Metric', 'Value'],
                      ['Total Connections', analysisResult.connectionCount],
                      ['Total Messages', analysisResult.messageCount],
                      ['Message Threads', analysisResult.messageThreads || 0],
                      ['Total Posts', analysisResult.articleCount],
                      ['Post Engagements', analysisResult.postEngagements || 0],
                      ['Network Density', `${analysisResult.networkInsights?.networkDensity.toFixed(1)}%`],
                      ['Diversity Score', `${analysisResult.networkInsights?.diversityScore.toFixed(1)}%`],
                      ['Top Company', analysisResult.topCompanies?.[0]?.name || 'N/A'],
                      ['Top Location', analysisResult.topLocations?.[0]?.location || 'N/A'],
                      ['Avg Messages per Conversation', analysisResult.messageAnalysis?.avgMessagesPerConversation || 0],
                      ['Avg Engagement per Post', analysisResult.postAnalysis?.avgEngagementPerPost || 0]
                    ];
                    
                    const csvContent = csvData.map(row => row.join(',')).join('\n');
                    const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);
                    const exportFileDefaultName = `linkedin-metrics-${new Date().toISOString().split('T')[0]}.csv`;
                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </div>
            </CardContent>
          </Card>
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
                <li>Choose "Want something in particular? Select the data files you're most interested in"</li>
                <li>Select: <strong>Connections, Messages, Posts, Profile</strong> for best analysis</li>
                <li>Click "Request archive" and wait for the email with your download link</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-4">
                Note: LinkedIn may take up to 24 hours to prepare your data export. Make sure to select all relevant data types for comprehensive analysis.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}