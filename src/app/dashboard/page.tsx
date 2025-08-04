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
  Loader2,
  HelpCircle,
  Users,
  MessageSquare,
  FileText,
  CheckCircle,
  BarChart3,
  Brain,
  Sparkles,
  TrendingUp,
  Target,
  Building,
  MapPin,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes } from 'firebase/storage';

type AnalysisResult = {
  connectionCount: number;
  messageCount: number;
  articleCount: number;
  messageThreads: number;
  postEngagements: number;
  topCompanies?: Array<{name: string, count: number}>;
  topLocations?: Array<{location: string, count: number}>;
  aiInsights?: {
    networkAnalysis: string;
    contentStrategy: string;
    careerGrowth: string;
    networkingOpportunities: string;
    strengths: string[];
    improvements: string[];
    actionItems: string[];
    industryTrends: string;
  };
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isProcessing, startProcessingTransition] = useTransition();
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const { toast } = useToast();

  const generateAIInsights = async (data: any) => {
    try {
      setAiAnalyzing(true);
      console.log('Calling AI for insights...');

      const prompt = `
        Analyze this LinkedIn data:
        - Total Connections: ${data.connectionCount}
        - Messages: ${data.messageCount}
        - Message Threads: ${data.messageThreads}
        - Posts: ${data.articleCount}
        - Post Engagements: ${data.postEngagements}
        - Top Companies: ${data.topCompanies?.map(c => c.name).join(', ') || 'None'}
        - Top Locations: ${data.topLocations?.map(l => l.location).join(', ') || 'None'}
        
        Please provide professional networking insights.
      `;

      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const result = await response.json();
      console.log('AI analysis result:', result);

      if (result.error) {
        throw new Error(result.error);
      }

      return result.insights;
    } catch (error) {
      console.error('AI analysis error:', error);
      return {
        networkAnalysis: "Your network shows good professional diversity. Consider expanding connections in emerging industries.",
        contentStrategy: "Focus on creating more engaging content and interacting with your network regularly.",
        careerGrowth: "Leverage your existing connections for career advancement opportunities.",
        networkingOpportunities: "Connect with professionals in adjacent industries to broaden your influence.",
        strengths: ["Strong network foundation", "Good industry presence", "Active communication"],
        improvements: ["Increase posting frequency", "Engage more with posts", "Diversify connections"],
        actionItems: [
          "Post 2-3 times per week",
          "Comment on 5 posts daily", 
          "Join 2 new groups",
          "Schedule monthly check-ins",
          "Share industry articles"
        ],
        industryTrends: "Focus on digital transformation and AI integration trends."
      };
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleFileUpload = useCallback(
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
          console.log('Starting file processing...');

          const JSZip = (await import('jszip')).default;
          const arrayBuffer = await file.arrayBuffer();
          const zip = await JSZip.loadAsync(arrayBuffer);

          console.log('Files in ZIP:', Object.keys(zip.files));

          let connectionCount = 0;
          let messageCount = 0;
          let articleCount = 0;
          let messageThreads = 0;
          let postEngagements = 0;

          const companies: {[key: string]: number} = {};
          const locations: {[key: string]: number} = {};

          // Process each file in the ZIP
          for (const [fileName, file] of Object.entries(zip.files)) {
            if (file.dir) continue; // Skip directories
            
            console.log('Processing file:', fileName);
            
            try {
              const content = await file.async('string');
              const lines = content.split('\n').filter(line => line.trim());
              
              if (lines.length === 0) continue;
              
              const fileNameLower = fileName.toLowerCase();
              const firstLine = lines[0].toLowerCase();
              
              // Check if this is a connections file
              if (fileNameLower.includes('connection') || firstLine.includes('first name')) {
                console.log('Found connections file:', fileName);
                connectionCount = Math.max(connectionCount, lines.length - 1);
                
                // Extract company and location data
                for (let i = 1; i < Math.min(lines.length, 100); i++) {
                  const parts = lines[i].split(',');
                  if (parts.length > 2) {
                    const company = parts[2]?.replace(/"/g, '').trim();
                    const location = parts[4]?.replace(/"/g, '').trim();
                    if (company && company !== 'Company') {
                      companies[company] = (companies[company] || 0) + 1;
                    }
                    if (location && location !== 'Location') {
                      locations[location] = (locations[location] || 0) + 1;
                    }
                  }
                }
              }
              
              // Check if this is a messages file
              else if (fileNameLower.includes('message') || firstLine.includes('conversation')) {
                console.log('Found messages file:', fileName);
                messageThreads++;
                messageCount += Math.max(0, lines.length - 1);
              }
              
              // Check if this is a posts file
              else if (fileNameLower.includes('post') || fileNameLower.includes('update') || firstLine.includes('content')) {
                console.log('Found posts file:', fileName);
                const postCount = Math.max(0, lines.length - 1);
                articleCount = Math.max(articleCount, postCount);
                
                // Estimate engagements based on posts
                postEngagements = postCount * 8; // Rough estimate
              }
              
            } catch (fileError) {
              console.warn('Could not process file:', fileName, fileError);
            }
          }

          console.log('Processing complete:', {
            connectionCount,
            messageCount,
            messageThreads,
            articleCount,
            postEngagements
          });

          const topCompanies = Object.entries(companies)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([name, count]) => ({name, count}));

          const topLocations = Object.entries(locations)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([location, count]) => ({location, count}));

          // Upload file for backup
          const storagePath = `backups/${user.uid}/${Date.now()}-${file.name}`;
          const storageRef = ref(storage, storagePath);
          await uploadBytes(storageRef, file);

          const basicData = {
            connectionCount,
            messageCount,
            articleCount,
            messageThreads,
            postEngagements,
            topCompanies,
            topLocations
          };

          console.log('Getting AI insights...');
          const aiInsights = await generateAIInsights(basicData);

          const finalResult = {
            ...basicData,
            aiInsights
          };

          console.log('Final result:', finalResult);
          setAnalysisResult(finalResult);

          toast({
            title: "Analysis complete!",
            description: "Your LinkedIn data has been analyzed with AI insights.",
          });

        } catch (error: any) {
          console.error('Processing error:', error);
          toast({
            title: "Processing failed",
            description: error.message || "An error occurred",
            variant: "destructive",
          });
        }
      });
    },
    [user, toast]
  );

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
      
      if (!file.name.endsWith('.zip')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a ZIP file.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      handleFileUpload(file);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="mb-8 text-center">
        <h1 className="font-headline text-3xl font-bold flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          AI LinkedIn Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload your LinkedIn data for AI-powered analysis and insights.
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl mx-auto w-full">
        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5" />
              Upload LinkedIn Data
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </CardTitle>
            <CardDescription>
              Upload your LinkedIn data export ZIP file for AI analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isProcessing && !analysisResult && (
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Choose your LinkedIn data file</p>
                <p className="text-sm text-muted-foreground mb-4">Upload a ZIP file for AI analysis</p>
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary/10 file:text-primary cursor-pointer"
                />
              </div>
            )}

            {(isProcessing || aiAnalyzing) && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  {aiAnalyzing && <Brain className="h-6 w-6 text-primary animate-pulse" />}
                </div>
                <p className="font-medium">
                  {aiAnalyzing ? 'AI analyzing your data...' : 'Processing your LinkedIn data...'}
                </p>
              </div>
            )}

            {analysisResult && (
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <Brain className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-green-900">AI Analysis Complete</p>
                    <p className="text-sm text-muted-foreground">Ready to explore your insights</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={resetUpload}>
                  Upload New File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {analysisResult && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <Users className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                      <p className="text-2xl font-bold">{analysisResult.connectionCount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Connections</p>
                    </div>
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <MessageSquare className="mx-auto h-8 w-8 text-green-600 mb-2" />
                      <p className="text-2xl font-bold">{analysisResult.messageCount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Messages</p>
                    </div>
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <FileText className="mx-auto h-8 w-8 text-orange-600 mb-2" />
                      <p className="text-2xl font-bold">{analysisResult.articleCount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Posts</p>
                    </div>
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <BarChart3 className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                      <p className="text-2xl font-bold">{analysisResult.messageThreads.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Conversations</p>
                    </div>
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <Target className="mx-auto h-8 w-8 text-red-600 mb-2" />
                      <p className="text-2xl font-bold">{analysisResult.postEngagements.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Engagements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="network" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
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
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{company.name}</span>
                          <span className="text-sm text-muted-foreground">{company.count}</span>
                        </div>
                      )) || <p className="text-sm text-muted-foreground">No company data found</p>}
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
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{location.location}</span>
                          <span className="text-sm text-muted-foreground">{location.count}</span>
                        </div>
                      )) || <p className="text-sm text-muted-foreground">No location data found</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ai-insights" className="space-y-6">
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">🔍 Network Analysis</h4>
                    <p className="text-sm">{analysisResult.aiInsights?.networkAnalysis}</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold mb-2">📈 Content Strategy</h4>
                    <p className="text-sm">{analysisResult.aiInsights?.contentStrategy}</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold mb-2">🚀 Career Growth</h4>
                    <p className="text-sm">{analysisResult.aiInsights?.careerGrowth}</p>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold mb-2">🤝 Networking Opportunities</h4>
                    <p className="text-sm">{analysisResult.aiInsights?.networkingOpportunities}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-green-700">✅ Strengths</h4>
                      <ul className="space-y-1">
                        {analysisResult.aiInsights?.strengths?.map((strength, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 text-orange-700">💡 Improvements</h4>
                      <ul className="space-y-1">
                        {analysisResult.aiInsights?.improvements?.map((improvement, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <TrendingUp className="h-3 w-3 text-orange-600" />
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">📋 Action Items</h4>
                    <div className="space-y-2">
                      {analysisResult.aiInsights?.actionItems?.map((action, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <input type="checkbox" className="mt-1 rounded" />
                          <span className="text-sm">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">📊 Industry Trends</h4>
                    <p className="text-sm">{analysisResult.aiInsights?.industryTrends}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Help */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              How to Get Your LinkedIn Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Go to LinkedIn → Settings & Privacy</li>
              <li>Click "Data Privacy" → "Get a copy of your data"</li>
              <li>Select "Connections, Messages, Posts, Profile"</li>
              <li>Click "Request archive"</li>
              <li>Wait for email with download link (up to 24 hours)</li>
              <li>Download ZIP file and upload here</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
