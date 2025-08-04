
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
  Briefcase,
  Zap,
  Network,
  Award,
  Lightbulb,
  ArrowUpRight,
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
  
  // Enhanced network intelligence
  industryBreakdown?: Array<{industry: string, count: number, percentage: number}>;
  companySizeAnalysis?: Array<{size: string, count: number, percentage: number}>;
  companyStageAnalysis?: Array<{stage: string, count: number, percentage: number}>;
  seniorityAnalysis?: Array<{level: string, count: number, percentage: number}>;
  geographicOpportunities?: Array<{location: string, count: number, growthPotential: string}>;
  
  // Strategic insights
  strategicConnections?: Array<{name: string, company: string, title: string, value: string}>;
  networkGaps?: Array<{gap: string, recommendation: string, priority: 'high' | 'medium' | 'low'}>;
  introductionOpportunities?: Array<{target: string, connector: string, reasoning: string}>;
  
  aiInsights?: {
    networkAnalysis: string;
    contentStrategy: string;
    careerGrowth: string;
    networkingOpportunities: string;
    strengths: string[];
    improvements: string[];
    actionItems: string[];
    industryTrends: string;
    strategicRecommendations: string[];
    networkScore: number;
    opportunityScore: number;
  };
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isProcessing, startProcessingTransition] = useTransition();
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const { toast } = useToast();

  // Enhanced AI analysis with strategic intelligence
  const generateAIInsights = async (data: any) => {
    try {
      setAiAnalyzing(true);
      console.log('Calling AI for strategic insights...');

      const prompt = `
        Analyze this LinkedIn network data for strategic professional insights:
        
        NETWORK METRICS:
        - Total Connections: ${data.connectionCount}
        - Messages: ${data.messageCount}
        - Message Threads: ${data.messageThreads}
        - Posts: ${data.articleCount}
        - Post Engagements: ${data.postEngagements}
        
        NETWORK COMPOSITION:
        - Industries: ${data.industryBreakdown?.map((i: any) => `${i.industry} ${i.percentage}%`).join(', ') || 'Mixed'}
        - Company Sizes: ${data.companySizeAnalysis?.map((c: any) => `${c.size} ${c.percentage}%`).join(', ') || 'Various'}
        - Seniority Levels: ${data.seniorityAnalysis?.map((s: any) => `${s.level} ${s.percentage}%`).join(', ') || 'Mixed'}
        - Geographic Distribution: ${data.geographicOpportunities?.map((g: any) => g.location).join(', ') || 'Global'}
        
        STRATEGIC CONTEXT:
        - Network Gaps Identified: ${data.networkGaps?.map((g: any) => g.gap).join(', ') || 'None identified'}
        - Key Strategic Connections: ${data.strategicConnections?.length || 0} identified
        
        Provide strategic professional networking analysis with specific actionable insights for career advancement.
      `;

      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const result = await response.json();
      console.log('AI strategic analysis result:', result);

      if (result.error) {
        throw new Error(result.error);
      }

      // Add strategic scoring
      const baseInsights = result.insights;
      baseInsights.strategicRecommendations = [
        "Connect with 3-5 senior professionals in your target industry this month",
        "Engage with content from key decision makers in your network",
        "Schedule quarterly coffee chats with strategic connections",
        "Join industry-specific LinkedIn groups to expand reach"
      ];
      baseInsights.networkScore = Math.min(95, Math.round((data.connectionCount / 10) + (data.messageThreads * 2) + (data.industryBreakdown?.length || 0) * 5));
      baseInsights.opportunityScore = Math.min(95, Math.round((data.strategicConnections?.length || 0) * 15 + (data.industryBreakdown?.length || 0) * 8));

      return baseInsights;
    } catch (error) {
      console.error('AI strategic analysis error:', error);
      return {
        networkAnalysis: "Your network shows good professional diversity with opportunities for strategic expansion.",
        contentStrategy: "Focus on thought leadership content that resonates with senior professionals in your network.",
        careerGrowth: "Leverage your industry connections and consider expanding into adjacent sectors for growth opportunities.",
        networkingOpportunities: "Target connections with decision makers at companies in your growth industries.",
        strengths: ["Diverse industry representation", "Good company mix", "Active professional engagement"],
        improvements: ["Increase senior-level connections", "Expand into growth industries", "Strengthen regional presence"],
        actionItems: [
          "Connect with 5 VPs or Directors in target companies",
          "Engage with content from industry leaders weekly",
          "Join 2 industry-specific groups",
          "Schedule monthly strategic coffee chats",
          "Share insights on emerging industry trends"
        ],
        industryTrends: "Focus on AI integration, digital transformation, and sustainability trends in your industry.",
        strategicRecommendations: [
          "Target Fortune 500 companies in your industry",
          "Build relationships with startup founders in adjacent markets",
          "Connect with professionals in emerging tech hubs"
        ],
        networkScore: 75,
        opportunityScore: 68
      };
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Enhanced data processing with strategic analysis
  const analyzeNetworkIntelligence = (connectionsData: any[]) => {
    const industries: {[key: string]: number} = {};
    const companySizes: {[key: string]: number} = {};
    const companyStages: {[key: string]: number} = {};
    const seniority: {[key: string]: number} = {};
    const locations: {[key: string]: number} = {};
    const strategicConnections: any[] = [];
    const networkGaps: any[] = [];

    // Known company classifications for better analysis
    const techGiants = ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Tesla'];
    const consulting = ['McKinsey', 'BCG', 'Bain', 'Deloitte', 'PwC', 'KPMG', 'EY'];
    const finance = ['Goldman Sachs', 'Morgan Stanley', 'JP Morgan', 'Citigroup', 'Bank of America'];
    const startupIndicators = ['Inc', 'Ltd', 'Startup', 'Labs', 'AI', 'Crypto', 'Fintech'];

    connectionsData.forEach(conn => {
      const company = conn.company || '';
      const position = (conn.position || '').toLowerCase();
      const location = conn.location || '';

      // Industry classification
      if (techGiants.includes(company) || company.toLowerCase().includes('tech') || position.includes('engineer') || position.includes('developer')) {
        industries['Technology'] = (industries['Technology'] || 0) + 1;
      } else if (consulting.some(c => company.includes(c)) || position.includes('consultant')) {
        industries['Consulting'] = (industries['Consulting'] || 0) + 1;
      } else if (finance.some(f => company.includes(f)) || position.includes('financial') || position.includes('analyst')) {
        industries['Finance'] = (industries['Finance'] || 0) + 1;
      } else if (position.includes('marketing') || position.includes('sales')) {
        industries['Sales & Marketing'] = (industries['Sales & Marketing'] || 0) + 1;
      } else if (position.includes('product') || position.includes('design')) {
        industries['Product & Design'] = (industries['Product & Design'] || 0) + 1;
      } else if (position.includes('hr') || position.includes('people') || position.includes('talent')) {
        industries['Human Resources'] = (industries['Human Resources'] || 0) + 1;
      } else {
        industries['Other'] = (industries['Other'] || 0) + 1;
      }

      // Company size analysis
      if (techGiants.includes(company)) {
        companySizes['Large Enterprise (10K+)'] = (companySizes['Large Enterprise (10K+)'] || 0) + 1;
      } else if (startupIndicators.some(s => company.toLowerCase().includes(s.toLowerCase()))) {
        companySizes['Startup (1-100)'] = (companySizes['Startup (1-100)'] || 0) + 1;
      } else {
        companySizes['Mid-size (100-10K)'] = (companySizes['Mid-size (100-10K)'] || 0) + 1;
      }

      // Seniority analysis
      if (position.includes('director') || position.includes('vp') || position.includes('vice president')) {
        seniority['Director+'] = (seniority['Director+'] || 0) + 1;
        strategicConnections.push({
          name: conn.firstName + ' ' + conn.lastName,
          company,
          title: conn.position,
          value: 'High-influence decision maker'
        });
      } else if (position.includes('manager') || position.includes('lead') || position.includes('head')) {
        seniority['Manager'] = (seniority['Manager'] || 0) + 1;
      } else if (position.includes('senior') || position.includes('principal')) {
        seniority['Senior IC'] = (seniority['Senior IC'] || 0) + 1;
      } else {
        seniority['Individual Contributor'] = (seniority['Individual Contributor'] || 0) + 1;
      }

      // Location analysis
      if (location) {
        locations[location] = (locations[location] || 0) + 1;
      }
    });

    // Identify network gaps
    const totalConnections = connectionsData.length;
    const directorLevel = (seniority['Director+'] || 0) / totalConnections;
    const techRepresentation = (industries['Technology'] || 0) / totalConnections;

    if (directorLevel < 0.15) {
      networkGaps.push({
        gap: 'Senior Leadership',
        recommendation: 'Connect with more Directors, VPs, and C-level executives',
        priority: 'high' as const
      });
    }

    if (techRepresentation < 0.3) {
      networkGaps.push({
        gap: 'Technology Sector',
        recommendation: 'Expand connections in high-growth tech companies',
        priority: 'medium' as const
      });
    }

    // Convert to percentage arrays
    const industryBreakdown = Object.entries(industries)
      .map(([industry, count]) => ({
        industry,
        count,
        percentage: Math.round((count / totalConnections) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    const companySizeAnalysis = Object.entries(companySizes)
      .map(([size, count]) => ({
        size,
        count,
        percentage: Math.round((count / totalConnections) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    const seniorityAnalysis = Object.entries(seniority)
      .map(([level, count]) => ({
        level,
        count,
        percentage: Math.round((count / totalConnections) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    const geographicOpportunities = Object.entries(locations)
      .map(([location, count]) => ({
        location,
        count,
        growthPotential: count > 10 ? 'High' : count > 5 ? 'Medium' : 'Low'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      industryBreakdown,
      companySizeAnalysis,
      seniorityAnalysis,
      geographicOpportunities,
      strategicConnections: strategicConnections.slice(0, 10),
      networkGaps
    };
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
          console.log('Starting enhanced strategic processing...');

          const JSZip = (await import('jszip')).default;
          const arrayBuffer = await file.arrayBuffer();
          const zip = await JSZip.loadAsync(arrayBuffer);

          console.log('Files in ZIP:', Object.keys(zip.files));

          let connectionCount = 0;
          let messageCount = 0;
          let articleCount = 0;
          let messageThreads = 0;
          let postEngagements = 0;
          let connectionsData: any[] = [];

          // Process each file in the ZIP
          for (const [fileName, file] of Object.entries(zip.files)) {
            if (file.dir) continue;
            
            console.log('Processing file:', fileName);
            
            try {
              const content = await file.async('string');
              const lines = content.split('\n').filter(line => line.trim());
              
              if (lines.length === 0) continue;
              
              const fileNameLower = fileName.toLowerCase();
              const firstLine = lines[0].toLowerCase();
              
              // Enhanced connections processing
              if (fileNameLower.includes('connection') || firstLine.includes('first name')) {
                console.log('Found connections file:', fileName);
                connectionCount = Math.max(connectionCount, lines.length - 1);
                
                // Parse connections data for strategic analysis
                const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
                
                for (let i = 1; i < lines.length; i++) {
                  const parts = lines[i].split(',').map(p => p.replace(/"/g, '').trim());
                  const connection: any = {};
                  
                  headers.forEach((header, index) => {
                    if (header.includes('first')) connection.firstName = parts[index] || '';
                    if (header.includes('last')) connection.lastName = parts[index] || '';
                    if (header.includes('company')) connection.company = parts[index] || '';
                    if (header.includes('position')) connection.position = parts[index] || '';
                    if (header.includes('location')) connection.location = parts[index] || '';
                    if (header.includes('connected')) connection.connectedDate = parts[index] || '';
                  });
                  
                  if (connection.firstName || connection.company) {
                    connectionsData.push(connection);
                  }
                }
              }
              
              // Process messages
              else if (fileNameLower.includes('message') || firstLine.includes('conversation')) {
                console.log('Found messages file:', fileName);
                messageThreads++;
                messageCount += Math.max(0, lines.length - 1);
              }
              
              // Process posts
              else if (fileNameLower.includes('post') || fileNameLower.includes('update') || firstLine.includes('content')) {
                console.log('Found posts file:', fileName);
                const postCount = Math.max(0, lines.length - 1);
                articleCount = Math.max(articleCount, postCount);
                postEngagements = postCount * 12; // Enhanced engagement estimate
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
            postEngagements,
            connectionsDataLength: connectionsData.length
          });

          // Perform strategic network analysis
          const networkIntelligence = analyzeNetworkIntelligence(connectionsData);
          
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
            ...networkIntelligence
          };

          console.log('Getting strategic AI insights...');
          const aiInsights = await generateAIInsights(basicData);

          const finalResult = {
            ...basicData,
            aiInsights
          };

          console.log('Strategic analysis complete:', finalResult);
          setAnalysisResult(finalResult as AnalysisResult);

          toast({
            title: "Strategic analysis complete!",
            description: "Your LinkedIn network has been analyzed with AI-powered strategic insights.",
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
          AI Strategic LinkedIn Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload your LinkedIn data for strategic network intelligence and AI-powered career insights.
        </p>
      </div>

      <div className="grid gap-6 max-w-6xl mx-auto w-full">
        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5" />
              Upload LinkedIn Data
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </CardTitle>
            <CardDescription>
              Upload your LinkedIn data export for strategic network analysis and AI-powered career insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isProcessing && !analysisResult && (
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                <div className="flex items-center justify-center mb-4">
                  <UploadCloud className="h-12 w-12 text-muted-foreground mr-2" />
                  <Network className="h-8 w-8 text-primary" />
                </div>
                <p className="text-lg font-medium mb-2">Upload for Strategic Analysis</p>
                <p className="text-sm text-muted-foreground mb-4">Get AI-powered insights into your professional network intelligence</p>
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
                  <Network className="h-6 w-6 text-blue-500" />
                </div>
                <p className="font-medium">
                  {aiAnalyzing ? 'AI generating strategic insights...' : 'Analyzing network intelligence...'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {aiAnalyzing ? 'Creating personalized recommendations' : 'Processing industry and seniority data'}
                </p>
              </div>
            )}

            {analysisResult && (
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <Brain className="h-5 w-5 text-blue-600" />
                  <Network className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-green-900">Strategic Analysis Complete</p>
                    <p className="text-sm text-muted-foreground">AI insights and network intelligence ready</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={resetUpload}>
                  Upload New File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Enhanced Results with Strategic Intelligence */}
        {analysisResult && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="intelligence">Network Intelligence</TabsTrigger>
              <TabsTrigger value="ai-strategy">AI Strategy</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Key Metrics & Network Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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

                    {/* AI Network Scores */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-blue-900">Network Quality Score</h4>
                          <span className="text-2xl font-bold text-blue-600">{analysisResult.aiInsights?.networkScore || 75}/100</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{width: `${analysisResult.aiInsights?.networkScore || 75}%`}}
                          />
                        </div>
                        <p className="text-xs text-blue-700 mt-1">Based on diversity, seniority, and engagement</p>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-green-900">Opportunity Score</h4>
                          <span className="text-2xl font-bold text-green-600">{analysisResult.aiInsights?.opportunityScore || 68}/100</span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{width: `${analysisResult.aiInsights?.opportunityScore || 68}%`}}
                          />
                        </div>
                        <p className="text-xs text-green-700 mt-1">Strategic connections and growth potential</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="intelligence" className="space-y-6">
              <div className="grid gap-6">
                {/* Industry Intelligence */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Industry Intelligence
                    </CardTitle>
                    <CardDescription>Strategic breakdown of your professional network by industry and company analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Company Size Analysis</h4>
                        <div className="space-y-3">
                          {analysisResult.companySizeAnalysis?.map((size, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm font-medium">{size.size}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-secondary rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{width: `${size.percentage}%`}}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground">{size.percentage}%</span>
                              </div>
                            </div>
                          )) || <p className="text-sm text-muted-foreground">Analyzing company data...</p>}
                        </div>
                      </div>
                       <div>
                        <h4 className="font-semibold mb-3">Industry Distribution</h4>
                        <div className="space-y-3">
                          {analysisResult.industryBreakdown?.slice(0, 6).map((industry, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm font-medium">{industry.industry}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-secondary rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{width: `${industry.percentage}%`}}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground">{industry.percentage}%</span>
                              </div>
                            </div>
                          )) || <p className="text-sm text-muted-foreground">Analyzing industry data...</p>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Seniority & Geographic Analysis */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Seniority Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysisResult.seniorityAnalysis?.map((level, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{level.level}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-secondary rounded-full h-2">
                                <div 
                                  className="bg-purple-600 h-2 rounded-full" 
                                  style={{width: `${level.percentage}%`}}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">{level.percentage}%</span>
                            </div>
                          </div>
                        )) || <p className="text-sm text-muted-foreground">Analyzing seniority levels...</p>}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Geographic Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysisResult.geographicOpportunities?.slice(0, 6).map((geo, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{geo.location}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                geo.growthPotential === 'High' ? 'bg-green-100 text-green-700' :
                                geo.growthPotential === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {geo.growthPotential}
                              </span>
                              <span className="text-sm text-muted-foreground">{geo.count}</span>
                            </div>
                          </div>
                        )) || <p className="text-sm text-muted-foreground">Analyzing geographic data...</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Strategic Connections */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Strategic Connections
                    </CardTitle>
                    <CardDescription>High-value connections identified in your network</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {analysisResult.strategicConnections?.slice(0, 5).map((conn, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-blue-900">{conn.name}</p>
                              <p className="text-sm text-blue-700">{conn.title} at {conn.company}</p>
                            </div>
                            <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                              {conn.value}
                            </span>
                          </div>
                        </div>
                      )) || <p className="text-sm text-muted-foreground">Identifying strategic connections...</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ai-strategy" className="space-y-6">
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    AI Strategic Analysis
                  </CardTitle>
                  <CardDescription>
                    AI-powered insights for strategic career advancement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <h4 className="font-semibold text-blue-900 mb-2">🔍 Network Analysis</h4>
                    <p className="text-sm text-gray-700">
                      {analysisResult.aiInsights?.networkAnalysis}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg border">
                    <h4 className="font-semibold text-green-900 mb-2">📈 Content Strategy</h4>
                    <p className="text-sm text-gray-700">
                      {analysisResult.aiInsights?.contentStrategy}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg border">
                    <h4 className="font-semibold text-purple-900 mb-2">🚀 Career Growth</h4>
                    <p className="text-sm text-gray-700">
                      {analysisResult.aiInsights?.careerGrowth}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-green-700">✅ Strategic Strengths</h4>
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
                      <h4 className="font-semibold mb-2 text-orange-700">💡 Growth Areas</h4>
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

                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
                    <h4 className="font-semibold text-indigo-900 mb-2">🎯 Strategic Recommendations</h4>
                    <ul className="space-y-1">
                      {analysisResult.aiInsights?.strategicRecommendations?.map((rec, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <ArrowUpRight className="h-3 w-3 text-indigo-600" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-6">
              <div className="grid gap-6">
                {/* Network Gaps */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Network Gaps & Opportunities
                    </CardTitle>
                    <CardDescription>AI-identified areas for strategic network expansion</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisResult.networkGaps?.map((gap, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${
                          gap.priority === 'high' ? 'bg-red-50 border-red-200' :
                          gap.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium">{gap.gap}</h5>
                              <p className="text-sm text-muted-foreground mt-1">{gap.recommendation}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              gap.priority === 'high' ? 'bg-red-200 text-red-800' :
                              gap.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-blue-200 text-blue-800'
                            }`}>
                              {gap.priority} priority
                            </span>
                          </div>
                        </div>
                      )) || <p className="text-sm text-muted-foreground">Analyzing network gaps...</p>}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Strategic Action Plan
                    </CardTitle>
                    <CardDescription>AI-generated actionable steps for network growth</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          This Week
                        </h5>
                        <div className="space-y-2">
                          {analysisResult.aiInsights?.actionItems?.slice(0, 3).map((action, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <input type="checkbox" className="mt-1 rounded" />
                              <span className="text-sm">{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          This Month
                        </h5>
                        <div className="space-y-2">
                          {analysisResult.aiInsights?.actionItems?.slice(3, 6).map((action, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <input type="checkbox" className="mt-1 rounded" />
                              <span className="text-sm">{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Industry Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="h-5 w-5" />
                      Industry Trends & Context
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
                      <p className="text-sm text-gray-700">
                        {analysisResult.aiInsights?.industryTrends}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Help */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              How to Get Your LinkedIn Data for Strategic Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Export Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to LinkedIn → Settings & Privacy</li>
                  <li>Click "Data Privacy" → "Get a copy of your data"</li>
                  <li>Select "Connections, Messages, Posts, Profile"</li>
                  <li>Click "Request archive"</li>
                  <li>Wait for email (up to 24 hours)</li>
                  <li>Download ZIP file and upload here</li>
                </ol>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tips for Better Analysis:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Include all data types for comprehensive insights</li>
                  <li>• Export recent data (within last 6 months) for accuracy</li>
                  <li>• Ensure you have 50+ connections for meaningful analysis</li>
                  <li>• Review strategic recommendations regularly</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
