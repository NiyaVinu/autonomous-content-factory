/**
 * Analyze Controller
 * Handles HTTP requests for text analysis
 */

const aiAnalysisService = require('../services/aiAnalysisService');
const textAnalyzer = require('../utils/textAnalyzer');

/**
 * POST /analyze
 * Analyzes raw text and returns structured insights
 */
exports.analyzeText = async (req, res) => {
  try {
    // Extract text from request body
    const { text } = req.body;
    
    // Validate input
    if (!text) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'Please provide "text" field in the request body',
        example: {
          text: "Your product description here..."
        }
      });
    }
    
    // Validate text length
    if (typeof text !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Text must be a string'
      });
    }
    
    if (text.trim().length === 0) {
      return res.status(400).json({
        error: 'Empty text',
        message: 'Please provide non-empty text for analysis'
      });
    }
    
    if (text.length > 10000) {
      return res.status(400).json({
        error: 'Text too long',
        message: 'Text exceeds maximum length of 10000 characters',
        current_length: text.length,
        max_length: 10000
      });
    }
    
    // Basic text preprocessing
    const cleanedText = textAnalyzer.cleanText(text);
    
    // Call AI analysis service
    const analysisResult = await aiAnalysisService.analyzeText(cleanedText);
    
    // Add request metadata
    const response = {
      success: true,
      data: analysisResult,
      request_id: this.generateRequestId(),
      analyzed_at: new Date().toISOString(),
      summary: {
        total_features: analysisResult.features.length,
        total_ambiguous_points: analysisResult.ambiguous_points.length,
        confidence_score: this.calculateOverallConfidence(analysisResult.metadata.confidence_scores)
      }
    };
    
    // Send successful response
    res.status(200).json(response);
    
  } catch (error) {
    console.error('Error in analyzeText:', error);
    
    // Handle different error types
    if (error.message.includes('timeout')) {
      return res.status(504).json({
        error: 'Analysis timeout',
        message: 'Analysis took too long to complete. Please try again.',
        code: 'TIMEOUT_ERROR'
      });
    }
    
    res.status(500).json({
      error: 'Analysis failed',
      message: 'An error occurred while analyzing the text',
      code: 'ANALYSIS_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /analyze/batch
 * Analyzes multiple texts in batch mode
 */
exports.analyzeBatch = async (req, res) => {
  try {
    const { texts } = req.body;
    
    if (!texts || !Array.isArray(texts)) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Please provide "texts" array in the request body'
      });
    }
    
    if (texts.length > 10) {
      return res.status(400).json({
        error: 'Too many texts',
        message: 'Maximum 10 texts per batch request',
        current_count: texts.length,
        max_count: 10
      });
    }
    
    // Analyze each text in parallel
    const analyses = await Promise.all(
      texts.map(async (text, index) => {
        try {
          if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return {
              index,
              error: 'Invalid or empty text',
              success: false
            };
          }
          
          const cleanedText = textAnalyzer.cleanText(text);
          const result = await aiAnalysisService.analyzeText(cleanedText);
          
          return {
            index,
            success: true,
            data: result
          };
        } catch (error) {
          return {
            index,
            error: error.message,
            success: false
          };
        }
      })
    );
    
    res.status(200).json({
      success: true,
      batch_id: this.generateRequestId(),
      total_processed: analyses.filter(a => a.success).length,
      total_failed: analyses.filter(a => !a.success).length,
      results: analyses
    });
    
  } catch (error) {
    console.error('Error in analyzeBatch:', error);
    res.status(500).json({
      error: 'Batch analysis failed',
      message: error.message
    });
  }
};

/**
 * POST /analyze/url
 * Analyzes content from a URL
 */
exports.analyzeUrl = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        error: 'Missing URL',
        message: 'Please provide "url" field in the request body'
      });
    }
    
    // Validate URL format
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'Please provide a valid URL'
      });
    }
    
    // Here you would fetch the URL content
    // For now, simulate URL fetching
    const fetchedText = await textAnalyzer.fetchUrlContent(url);
    
    // Analyze the fetched content
    const analysisResult = await aiAnalysisService.analyzeText(fetchedText);
    
    res.status(200).json({
      success: true,
      source_url: url,
      data: analysisResult,
      request_id: this.generateRequestId()
    });
    
  } catch (error) {
    console.error('Error in analyzeUrl:', error);
    res.status(500).json({
      error: 'URL analysis failed',
      message: error.message
    });
  }
};

/**
 * Helper: Generate unique request ID
 */
exports.generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Helper: Calculate overall confidence score
 */
exports.calculateOverallConfidence = (scores) => {
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 100) / 100;
};