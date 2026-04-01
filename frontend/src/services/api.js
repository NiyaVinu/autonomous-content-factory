import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      throw new Error(error.response.data.message || 'Server error occurred');
    } else if (error.request) {
      // Request was made but no response
      console.error('Network Error:', error.request);
      throw new Error('Network error. Please check if the backend server is running.');
    } else {
      // Something else happened
      console.error('Error:', error.message);
      throw error;
    }
  }
);

/**
 * Analyze text to extract structured data
 * @param {string} text - Raw text to analyze
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeText = async (text) => {
  const response = await api.post('/analyze', { text });
  return response.data;
};

/**
 * Generate content from analysis data
 * @param {Object} analysisData - Data from analyze endpoint
 * @returns {Promise<Object>} Generated content
 */
export const generateFromAnalysis = async (analysisData) => {
  const response = await api.post('/generate-from-analysis', analysisData);
  return response.data;
};

/**
 * Review generated content against source
 * @param {Object} generatedContent - Generated content to review
 * @param {Object} sourceData - Source analysis data
 * @returns {Promise<Object>} Review results
 */
export const reviewContent = async (generatedContent, sourceData) => {
  const response = await api.post('/review', {
    generated_content: generatedContent,
    source_data: sourceData
  });
  return response.data;
};

/**
 * Complete pipeline: Analyze → Generate → Review
 * @param {string} text - Input text
 * @returns {Promise<Object>} Final results with review
 */
export const runFullPipeline = async (text, onProgress) => {
  try {
    // Step 1: Analyze
    if (onProgress) onProgress('Analyzing text...', 'analysis');
    const analysisResponse = await analyzeText(text);
    
    if (!analysisResponse.success) {
      throw new Error('Analysis failed: ' + JSON.stringify(analysisResponse));
    }
    
    const analysisData = analysisResponse.data;
    
    // Step 2: Generate content
    if (onProgress) onProgress('Generating content...', 'generation');
    const generationResponse = await generateFromAnalysis(analysisData);
    
    if (!generationResponse.success) {
      throw new Error('Generation failed: ' + JSON.stringify(generationResponse));
    }
    
    const generatedContent = generationResponse.content;
    
    // Step 3: Review content
    if (onProgress) onProgress('Reviewing content quality...', 'review');
    const reviewResponse = await reviewContent(generatedContent, analysisData);
    
    if (!reviewResponse.success) {
      throw new Error('Review failed: ' + JSON.stringify(reviewResponse));
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