/**
 * Generate From Analysis Controller
 * Takes analysis data and generates marketing content
 * Supports correction notes from Editor agent for feedback loop
 */

const blogGenerator = require('../services/blogGeneratorService');
const socialGenerator = require('../services/socialGeneratorService');
const emailGenerator = require('../services/emailGeneratorService');
const contentHelpers = require('../utils/contentHelpers');

exports.generateFromAnalysis = async (req, res) => {
  try {
    const analysisData = req.body;
    const correctionNotes = analysisData.correction_notes || null;

    if (!analysisData) {
      return res.status(400).json({
        error: 'Missing data',
        message: 'Please provide analysis data in the request body'
      });
    }

    const requiredFields = ['product_name', 'features', 'target_audience', 'value_proposition'];
    const missingFields = requiredFields.filter(field => !analysisData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Invalid data structure',
        message: 'Missing required fields',
        missing_fields: missingFields
      });
    }

    if (typeof analysisData.product_name !== 'string') {
      return res.status(400).json({
        error: 'Invalid product_name',
        message: 'product_name must be a string'
      });
    }

    if (!Array.isArray(analysisData.features)) {
      return res.status(400).json({
        error: 'Invalid features',
        message: 'features must be an array'
      });
    }

    if (!Array.isArray(analysisData.target_audience)) {
      return res.status(400).json({
        error: 'Invalid target_audience',
        message: 'target_audience must be an array'
      });
    }

    // Log whether this is a revision
    if (correctionNotes) {
      console.log(`Revising content for: ${analysisData.product_name}`);
      console.log(`Correction notes: ${correctionNotes.summary}`);
    } else {
      console.log(`Generating content for: ${analysisData.product_name}`);
    }

    // Pass correction notes to generators so they can adjust
    const enrichedData = {
      ...analysisData,
      correction_notes: correctionNotes
    };

    // Generate all content types in parallel
    const [blog, social, email] = await Promise.all([
      blogGenerator.generateBlogPost(enrichedData),
      socialGenerator.generateSocialThread(enrichedData),
      emailGenerator.generateEmailTeaser(enrichedData)
    ]);

    const blogValidation = contentHelpers.validateContent(blog.plain_text, 'blog', 400);
    const socialValidation = contentHelpers.validateContent(social.formatted_thread, 'social', 200);
    const emailValidation = contentHelpers.validateContent(email.body, 'email', 100);

    const response = {
      success: true,
      generated_at: new Date().toISOString(),
      campaign_id: generateCampaignId(),
      is_revision: !!correctionNotes,
      correction_notes_applied: correctionNotes ? correctionNotes.summary : null,
      source_analysis: {
        product_name: analysisData.product_name,
        feature_count: analysisData.features.length,
        audience_count: analysisData.target_audience.length
      },
      content: {
        blog_post: {
          ...blog,
          validation: blogValidation
        },
        social_media_thread: {
          ...social,
          validation: socialValidation
        },
        email_teaser: {
          ...email,
          validation: emailValidation
        }
      },
      summary: {
        total_words: blog.word_count + email.word_count + social.tweet_count * 30,
        content_types_generated: 3,
        estimated_reading_time: Math.ceil(blog.word_count / 200)
      }
    };

    const warnings = [];
    if (!blogValidation.valid) warnings.push({ type: 'blog', issues: blogValidation.issues });
    if (!socialValidation.valid) warnings.push({ type: 'social', issues: socialValidation.issues });
    if (!emailValidation.valid) warnings.push({ type: 'email', issues: emailValidation.issues });

    if (warnings.length > 0) response.warnings = warnings;

    res.status(200).json(response);

  } catch (error) {
    console.error('Error in generateFromAnalysis:', error);
    res.status(500).json({
      error: 'Generation failed',
      message: 'An error occurred while generating content',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

exports.generateBatch = async (req, res) => {
  try {
    const { analyses } = req.body;

    if (!analyses || !Array.isArray(analyses)) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Please provide "analyses" array in the request body'
      });
    }

    if (analyses.length > 5) {
      return res.status(400).json({
        error: 'Too many requests',
        message: 'Maximum 5 analyses per batch request',
        current_count: analyses.length,
        max_count: 5
      });
    }

    const results = await Promise.all(
      analyses.map(async (analysis, index) => {
        try {
          if (!analysis.product_name || !analysis.features) {
            return {
              index,
              success: false,
              error: 'Missing required fields (product_name or features)'
            };
          }

          const [blog, social, email] = await Promise.all([
            blogGenerator.generateBlogPost(analysis),
            socialGenerator.generateSocialThread(analysis),
            emailGenerator.generateEmailTeaser(analysis)
          ]);

          return {
            index,
            success: true,
            product_name: analysis.product_name,
            content: {
              blog_post: blog,
              social_media_thread: social,
              email_teaser: email
            }
          };
        } catch (error) {
          return { index, success: false, error: error.message };
        }
      })
    );

    res.status(200).json({
      success: true,
      batch_id: generateCampaignId(),
      total_processed: results.filter(r => r.success).length,
      total_failed: results.filter(r => !r.success).length,
      results: results
    });

  } catch (error) {
    console.error('Error in generateBatch:', error);
    res.status(500).json({
      error: 'Batch generation failed',
      message: error.message
    });
  }
};

function generateCampaignId() {
  return `camp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}