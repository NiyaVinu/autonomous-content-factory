import axios from 'axios';

const API_BASE_URL = 'https://autonomous-content-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      throw new Error(error.response.data.message || 'Server error occurred');
    } else if (error.request) {
      console.error('Network Error:', error.request);
      throw new Error('Network error. Please check if the backend server is running.');
    } else {
      console.error('Error:', error.message);
      throw error;
    }
  }
);

export const analyzeText = async (text) => {
  if (text.startsWith('__URL__')) {
    const url = text.replace('__URL__', '');
    const response = await api.post('/analyze/url', { url });
    return response.data;
  }
  const response = await api.post('/analyze', { text });
  return response.data;
};

export const generateFromAnalysis = async (analysisData, correctionNotes = null) => {
  const payload = { ...analysisData };
  if (correctionNotes) {
    payload.correction_notes = correctionNotes;
  }
  const response = await api.post('/generate-from-analysis', payload);
  return response.data;
};

export const reviewContent = async (generatedContent, sourceData) => {
  const response = await api.post('/review', {
    generated_content: generatedContent,
    source_data: sourceData
  });
  return response.data;
};

export const runFullPipeline = async (text, onProgress) => {
  const MAX_RETRIES = 2;

  try {
    // Step 1: Analyze
    if (onProgress) onProgress('Analyzing text...', 'analysis');
    const analysisResponse = await analyzeText(text);

    if (!analysisResponse.success) {
      throw new Error('Analysis failed: ' + JSON.stringify(analysisResponse));
    }

    const analysisData = analysisResponse.data;
    let generatedContent = null;
    let reviewResponse = null;
    let correctionNotes = null;
    let attempt = 0;

    // Step 2: Generate → Review loop (up to MAX_RETRIES)
    while (attempt <= MAX_RETRIES) {
      attempt++;

      // Generate content (with correction notes if retrying)
      if (onProgress) onProgress('Generating content...', 'generation');
      const generationResponse = await generateFromAnalysis(analysisData, correctionNotes);

      if (!generationResponse.success) {
        throw new Error('Generation failed: ' + JSON.stringify(generationResponse));
      }

      generatedContent = generationResponse.content;

      // Step 3: Review content
      if (onProgress) onProgress('Reviewing content quality...', 'review');
      reviewResponse = await reviewContent(generatedContent, analysisData);

      const status = reviewResponse?.status;

      // If approved or max retries reached, break
      if (status !== 'REJECTED' || attempt > MAX_RETRIES) {
        if (attempt > 1 && status === 'REJECTED') {
          if (onProgress) onProgress('Max revisions reached. Using best version.', 'review');
        }
        break;
      }

      // If rejected, prepare correction notes for next attempt
      correctionNotes = reviewResponse.correction_notes;
      if (onProgress) onProgress(
        `Content rejected. Sending correction notes to Copywriter (attempt ${attempt}/${MAX_RETRIES})...`,
        'feedback'
      );
    }

    return {
      success: true,
      analysis: analysisData,
      content: generatedContent,
      review: reviewResponse,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Pipeline error:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

export default api;