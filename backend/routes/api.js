const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Import all controllers
const contentController = require('../controllers/contentController');
const analyzeController = require('../controllers/analyzeController');
const generateFromAnalysisController = require('../controllers/generateFromAnalysisController');
const reviewController = require('../controllers/reviewController'); // NEW: Review controller

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ============================================
// EXISTING CONTENT GENERATION ROUTES
// ============================================

/**
 * POST /api/generate
 * Upload a document and generate content campaign
 * @body {file} document - The source document file
 */
router.post('/generate', upload.single('document'), contentController.generateContent);

/**
 * GET /api/status/:jobId
 * Check the status of a content generation job
 * @param {string} jobId - The job ID
 */
router.get('/status/:jobId', contentController.getJobStatus);

/**
 * GET /api/campaign/:campaignId
 * Get a completed campaign
 * @param {string} campaignId - The campaign ID
 */
router.get('/campaign/:campaignId', contentController.getCampaign);

// ============================================
// ANALYSIS ROUTES
// ============================================

/**
 * POST /api/analyze
 * Analyze raw text and extract structured data
 * @body {string} text - The text to analyze
 */
router.post('/analyze', analyzeController.analyzeText);

/**
 * POST /api/analyze/batch
 * Analyze multiple texts in batch
 * @body {array} texts - Array of texts to analyze
 */
router.post('/analyze/batch', analyzeController.analyzeBatch);

/**
 * POST /api/analyze/url
 * Analyze content from a URL
 * @body {string} url - The URL to fetch and analyze
 */
router.post('/analyze/url', analyzeController.analyzeUrl);

// ============================================
// GENERATE FROM ANALYSIS ROUTES
// ============================================

/**
 * POST /api/generate-from-analysis
 * Generate marketing content from analysis data
 * @body {object} analysisData - The data from /analyze endpoint
 */
router.post('/generate-from-analysis', generateFromAnalysisController.generateFromAnalysis);

/**
 * POST /api/generate-from-analysis/batch
 * Generate content for multiple analyses in batch
 * @body {array} analyses - Array of analysis data objects
 */
router.post('/generate-from-analysis/batch', generateFromAnalysisController.generateBatch);

// ============================================
// REVIEW ROUTES
// ============================================

/**
 * POST /api/review
 * Review generated content against source data
 * @body {object} generated_content - The generated content to review
 * @body {object} source_data - The source analysis data
 */
router.post('/review', reviewController.reviewContent);

/**
 * POST /api/review/single
 * Review a single content piece
 * @body {object} content - The content to review
 * @body {string} content_type - Type of content (blog, social, email)
 * @body {object} source_data - The source analysis data
 */
router.post('/review/single', reviewController.reviewSingle);

// ============================================
// HELPER ROUTE (Optional)
// ============================================

/**
 * GET /api/routes
 * List all available API routes (helpful for debugging)
 */
router.get('/routes', (req, res) => {
  const routes = [
    {
      category: 'Content Generation',
      endpoints: [
        {
          method: 'POST',
          endpoint: '/api/generate',
          description: 'Upload a document and generate content campaign',
          body: { file: 'multipart/form-data' }
        },
        {
          method: 'GET',
          endpoint: '/api/status/:jobId',
          description: 'Check the status of a content generation job'
        },
        {
          method: 'GET',
          endpoint: '/api/campaign/:campaignId',
          description: 'Get a completed campaign'
        }
      ]
    },
    {
      category: 'Analysis',
      endpoints: [
        {
          method: 'POST',
          endpoint: '/api/analyze',
          description: 'Analyze raw text and extract structured data',
          body: { text: 'string' }
        },
        {
          method: 'POST',
          endpoint: '/api/analyze/batch',
          description: 'Analyze multiple texts in batch',
          body: { texts: ['string1', 'string2'] }
        },
        {
          method: 'POST',
          endpoint: '/api/analyze/url',
          description: 'Analyze content from a URL',
          body: { url: 'string' }
        }
      ]
    },
    {
      category: 'Content Generation from Analysis',
      endpoints: [
        {
          method: 'POST',
          endpoint: '/api/generate-from-analysis',
          description: 'Generate marketing content from analysis data',
          body: {
            product_name: 'string',
            features: ['array'],
            target_audience: ['array'],
            value_proposition: 'string',
            ambiguous_points: ['array (optional)']
          }
        },
        {
          method: 'POST',
          endpoint: '/api/generate-from-analysis/batch',
          description: 'Generate content for multiple analyses in batch',
          body: { analyses: ['array of analysis objects'] }
        }
      ]
    },
    {
      category: 'Review',
      endpoints: [
        {
          method: 'POST',
          endpoint: '/api/review',
          description: 'Review generated content against source data',
          body: {
            generated_content: {
              blog_post: 'object',
              social_media_thread: 'object',
              email_teaser: 'object'
            },
            source_data: {
              product_name: 'string',
              features: ['array'],
              target_audience: ['array'],
              value_proposition: 'string'
            }
          }
        },
        {
          method: 'POST',
          endpoint: '/api/review/single',
          description: 'Review a single content piece',
          body: {
            content: 'object',
            content_type: 'string (blog, social, email)',
            source_data: 'object'
          }
        }
      ]
    }
  ];
  
  res.json({
    success: true,
    total_categories: routes.length,
    total_endpoints: routes.reduce((sum, cat) => sum + cat.endpoints.length, 0),
    routes: routes,
    base_url: '/api',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;