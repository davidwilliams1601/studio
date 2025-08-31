import { NextRequest, NextResponse } from 'next/server';
import { AnalysisStorageService } from '@/lib/analysis-storage';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const analysisId = searchParams.get('id');
  const format = searchParams.get('format') || 'json';
  const userId = searchParams.get('userId');
  
  if (!analysisId || !userId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    // Get user analyses and verify ownership
    const userAnalyses = await AnalysisStorageService.getUserAnalyses(userId);
    const analysis = userAnalyses.find(a => a.id === analysisId);
    
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    if (format === 'json') {
      const fileName = `linkedin-analysis-${analysis.fileName}-${analysis.processedAt.split('T')[0]}.json`;
      
      return new NextResponse(JSON.stringify(analysis, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    }
    
    if (format === 'csv') {
      const csvData = generateCSV(analysis);
      const fileName = `linkedin-analysis-${analysis.fileName}-${analysis.processedAt.split('T')[0]}.csv`;
      
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    }
    
    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}

function generateCSV(analysis: any): string {
  const headers = ['Metric', 'Value', 'Description'];
  const rows = [
    ['Total Connections', analysis.stats.connections, 'Number of LinkedIn connections'],
    ['Companies', analysis.stats.companies, 'Number of different companies in network'],
    ['Messages', analysis.stats.messages, 'Total message conversations'],
    ['Posts', analysis.stats.posts, 'Content pieces published'],
    ['Skills', analysis.analytics?.skillsCount || 0, 'Endorsed skills count'],
    ['Industries', Object.keys(analysis.analytics?.industries || {}).length, 'Industry diversity'],
    ['Diversity Score', analysis.analytics?.networkQuality?.diversityScore || 0, 'Network diversity rating'],
  ];
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}
