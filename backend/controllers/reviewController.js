/**
 * Review Controller
 * Handles content review requests
 */

const reviewService = require('../services/reviewService');

/**
 * POST /review
 * Review generated content against source data
 */
exports.reviewContent = async (req, res) => {
  try {
    const { generated_content, source_data } = req.body;
    
    // Validate input
    if (!generated_content) {
      return res.status(400).json({
        error: 'Missing generated_content',
        message: 'Please provide generated_content in the request body',
        example: {
  generated_content: {
    blog_post: "Your blog content here",
    social_media_thread: ["Post 1", "Post 2"],
    email_teaser: "Your email content here"
  },
  source_data: {
    product_name: "Example Product",
    features: ["Feature 1", "Feature 2"],
    target_audience: ["Developers"],
    value_proposition: "Makes work easier"
  }
}
      });
    }
    
    if (!source_data) {
      return res.status(400).json({
        error: 'Missing source_data',
        message: 'Please provide source_data in the request body'
      });
    }
    
    // Validate generated_content structure
    const hasContent = generated_content.blog_post || 
                       generated_content.social_media_thread || 
                       generated_content.email_teaser;
    
    if (!hasContent) {
      return res.status(400).json({
        error: 'Invalid generated_content',
        message: 'generated_content must contain at least one of: blog_post, social_media_thread, email_teaser'
      });
    }
    
    // Validate source_data structure
    const requiredFields = ['product_name', 'features', 'target_audience'];
    const missingFields = requiredFields.filter(field => !source_data[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Invalid source_data',
        message: 'Missing required fields',
        missing_fields: missingFields
      });
    }
    
    // Perform review
    const reviewResults = await reviewService.reviewContent(
      generated_content,
      source_data
    );
    
    // Prepare response based on status
    const response = {
      success: true,
      review_id: generateReviewId(),
      reviewed_at: reviewResults.reviewed_at,
      status: reviewResults.overall_status,
      summary: reviewResults.summary,
      scores: reviewResults.scores,
      sections: reviewResults.sections,
      critical_issues: reviewResults.criticalIssues,
      warnings: reviewResults.warnings,
      improvements: reviewResults.improvements,
      recommendation: getRecommendation(reviewResults.overall_status)
    };
    
    // If rejected, add correction notes
    if (reviewResults.overall_status === 'REJECTED') {
      response.correction_notes = generateCorrectionNotes(reviewResults);
    }
    
    // Send response with appropriate status code
    if (reviewResults.overall_status === 'REJECTED') {
      res.status(200).json(response); // Still 200 OK, but status indicates rejection
    } else {
      res.status(200).json(response);
    }
    
  } catch (error) {
    console.error('Error in reviewContent:', error);
    res.status(500).json({
      error: 'Review failed',
      message: 'An error occurred while reviewing the content',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * POST /review/single
 * Review a single content piece
 */
exports.reviewSingle = async (req, res) => {
  try {
    const { content, content_type, source_data } = req.body;
    
    // Validate input
    if (!content) {
      return res.status(400).json({
        error: 'Missing content',
        message: 'Please provide content to review'
      });
    }
    
    if (!content_type) {
      return res.status(400).json({
        error: 'Missing content_type',
        message: 'Please specify content_type (blog, social, email)'
      });
    }
    
    if (!['blog', 'social', 'email'].includes(content_type)) {
      return res.status(400).json({
        error: 'Invalid content_type',
        message: 'content_type must be one of: blog, social, email'
      });
    }
    
    if (!source_data) {
      return res.status(400).json({
        error: 'Missing source_data',
        message: 'Please provide source_data for comparison'
      });
    }
    
    // Wrap single content in expected format
    const wrappedContent = {};
    if (content_type === 'blog') {
      wrappedContent.blog_post = content;
    } else if (content_type === 'social') {
      wrappedContent.social_media_thread = content;
    } else if (content_type === 'email') {
      wrappedContent.email_teaser = content;
    }
    
    // Perform review
    const reviewResults = await reviewService.reviewContent(
      wrappedContent,
      source_data
    );
    
    // Extract the specific section review
    const sectionReview = reviewResults.sections[content_type];
    
    res.status(200).json({
      success: true,
      review_id: generateReviewId(),
      content_type: content_type,
      reviewed_at: reviewResults.reviewed_at,
      status: sectionReview.status,
      scores: sectionReview.scores,
      critical_issues: sectionReview.criticalIssues,
      warnings: sectionReview.warnings,
      improvements: sectionReview.improvements,
      metadata: sectionReview.metadata,
      recommendation: getRecommendation(sectionReview.status)
    });
    
  } catch (error) {
    console.error('Error in reviewSingle:', error);
    res.status(500).json({
      error: 'Review failed',
      message: error.message
    });
  }
};

/**
 * Generate unique review ID
 */
function generateReviewId() {
  return `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get recommendation based on status
 */
function getRecommendation(status) {
  switch (status) {
    case 'APPROVED':
      return 'Content is ready for publishing. No changes needed.';
    case 'APPROVED_WITH_WARNINGS':
      return 'Content approved but consider addressing the warnings for better quality.';
    case 'REJECTED':
      return 'Content requires revision. Please address the critical issues before resubmitting.';
    default:
      return 'Please review the feedback and make necessary improvements.';
  }
}

/**
 * Generate correction notes for rejected content
 */
function generateCorrectionNotes(reviewResults) {
  const notes = [];
  
  for (const issue of reviewResults.criticalIssues) {
    notes.push({
      issue: issue.message,
      suggestion: issue.suggestion,
      severity: 'critical'
    });
  }
  
  for (const warning of reviewResults.warnings.slice(0, 3)) {
    notes.push({
      issue: warning.message,
      suggestion: warning.suggestion,
      severity: 'warning'
    });
  }
  
  return {
    summary: `Please address ${reviewResults.criticalIssues.length} critical issue(s) and ${reviewResults.warnings.length} warning(s).`,
    notes: notes
  };
}