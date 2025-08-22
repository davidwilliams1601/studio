// Add this import at the top
import { AnalysisStorageService } from "@/lib/analysis-storage";
import { auth } from "@/lib/firebase";

// Replace the generateAiInsights function with this:
const generateAiInsights = async (data) => {
  console.log("Starting AI insights generation...");
  setAiLoading(true);
  setAiError(null);
  
  try {
    // Get user auth token
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Authentication required');
    }
    
    const token = await user.getIdToken();
    
    const response = await fetch('/api/ai-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        stats: data.stats,
        analytics: data.analytics,
        fileName: data.fileName,
        userPlan: data.userPlan || 'pro' // Pass the user's plan
      }),
    });

    const aiData = await response.json();
    
    if (aiData.success) {
      setAiInsights(aiData.insights);
      console.log('✅ AI insights generated successfully');
      
      // Save insights to database if we have analysisId
      if (data.analysisId) {
        try {
          await AnalysisStorageService.updateWithInsights(data.analysisId, aiData.insights);
          console.log('✅ Insights saved to database');
        } catch (error) {
          console.error('❌ Failed to save insights:', error);
        }
      }
    } else {
      console.error('❌ AI insights generation failed:', aiData.error);
      setAiError(aiData.error);
    }
  } catch (error) {
    console.error('❌ Error generating AI insights:', error);
    setAiError(error.message);
  } finally {
    setAiLoading(false);
  }
};
