/**
 * Review Service
 * Handles content review and quality checking
 */

const reviewHelpers = require('../utils/reviewHelpers');

class ReviewService {
  /**
   * Review generated content against source
   * @param {Object} generatedContent - Content to review
   * @param {Object} sourceData - Source analysis data
   * @returns {Object} Review results
   */
  async reviewContent(generatedContent, sourceData) {
    // Simulate review processing time
    await this.simulateProcessing();
    
    const reviewResults = {
      reviewed_at: new Date().toISOString(),
      overall_status: 'PENDING',
      sections: {},
      criticalIssues: [],
      warnings: [],
      improvements: [],
      scores: {}
    };
    
    // Review each content type
    if (generatedContent.blog_post) {
      const blogReview = await this.reviewBlogPost(
        generatedContent.blog_post,
        sourceData
      );
      reviewResults.sections.blog = blogReview;
      reviewResults.criticalIssues.push(...blogReview.criticalIssues);
      reviewResults.warnings.push(...blogReview.warnings);
      reviewResults.improvements.push(...blogReview.improvements);
      reviewResults.scores.blog = blogReview.scores.overall;
    }
    
    if (generatedContent.social_media_thread) {
      const socialReview = await this.reviewSocialThread(
        generatedContent.social_media_thread,
        sourceData
      );
      reviewResults.sections.social = socialReview;
      reviewResults.criticalIssues.push(...socialReview.criticalIssues);
      reviewResults.warnings.push(...socialReview.warnings);
      reviewResults.improvements.push(...socialReview.improvements);
      reviewResults.scores.social = socialReview.scores.overall;
    }
    
    if (generatedContent.email_teaser) {
      const emailReview = await this.reviewEmailTeaser(
        generatedContent.email_teaser,
        sourceData
      );
      reviewResults.sections.email = emailReview;
      reviewResults.criticalIssues.push(...emailReview.criticalIssues);
      reviewResults.warnings.push(...emailReview.warnings);
      reviewResults.improvements.push(...emailReview.improvements);
      reviewResults.scores.email = emailReview.scores.overall;
    }
    
    // Calculate overall scores
    const allScores = Object.values(reviewResults.scores);
    if (allScores.length > 0) {
      reviewResults.scores.overall = Math.round(
        allScores.reduce((a, b) => a + b, 0) / allScores.length
      );
    }
    
    // Determine final status
    if (reviewResults.criticalIssues.length > 0) {
      reviewResults.overall_status = 'REJECTED';
    } else if (reviewResults.warnings.length > 0) {
      reviewResults.overall_status = 'APPROVED_WITH_WARNINGS';
    } else {
      reviewResults.overall_status = 'APPROVED';
    }
    
    // Generate summary
    reviewResults.summary = reviewHelpers.generateSummary(reviewResults);
    
    return reviewResults;
  }
  
  /**
   * Review blog post
   */
  async reviewBlogPost(blog, sourceData) {
    const text = blog.plain_text || blog.content;
    const criticalIssues = [];
    const warnings = [];
    const improvements = [];
    const scores = {};
    
    // 1. Check feature accuracy
    const featureCheck = reviewHelpers.checkFeatureAccuracy(
      text,
      sourceData.features || []
    );
    if (!featureCheck.isAccurate) {
      featureCheck.issues.forEach(issue => {
        if (issue.severity === 'high') {
          criticalIssues.push(issue);
        } else {
          warnings.push(issue);
        }
      });
    }
    scores.accuracy = featureCheck.isAccurate ? 90 : 50;
    
    // 2. Check for hallucinations
    const hallucinationCheck = reviewHelpers.checkHallucinations(
      text,
      JSON.stringify(sourceData),
      sourceData.features || []
    );
    if (hallucinationCheck.hasHallucinations) {
      hallucinationCheck.hallucinations.forEach(hallucination => {
        if (hallucination.severity === 'high') {
          criticalIssues.push(hallucination);
        } else {
          warnings.push(hallucination);
        }
      });
      scores.hallucinations = Math.max(0, 100 - hallucinationCheck.hallucinationCount * 20);
    } else {
      scores.hallucinations = 100;
    }
    
    // 3. Check tone
    const toneCheck = reviewHelpers.checkTone(text, 'professional');
    if (!toneCheck.isAppropriate) {
      toneCheck.issues.forEach(issue => {
        warnings.push(issue);
      });
    }
    scores.tone = toneCheck.toneScore;
    
    // 4. Check grammar
    const grammarCheck = reviewHelpers.checkGrammar(text);
    if (grammarCheck.hasIssues) {
      grammarCheck.issues.forEach(issue => {
        improvements.push(issue);
      });
    }
    scores.grammar = grammarCheck.grammarScore;
    
    // 5. Check word count
    const wordCount = blog.word_count || reviewHelpers.countWords(text);
    if (wordCount < 400) {
      warnings.push({
        type: 'word_count_low',
        severity: 'medium',
        message: `Blog post is too short (${wordCount} words)`,
        suggestion: 'Expand content to at least 500 words'
      });
      scores.length = 60;
    } else if (wordCount > 600) {
      improvements.push({
        type: 'word_count_high',
        severity: 'low',
        message: `Blog post is long (${wordCount} words)`,
        suggestion: 'Consider condensing for better engagement'
      });
      scores.length = 80;
    } else {
      scores.length = 100;
    }
    
    // Calculate overall score
    const overallScore = reviewHelpers.calculateOverallScore(scores);
    
    return {
      content_type: 'blog',
      status: criticalIssues.length > 0 ? 'REJECTED' : 'APPROVED',
      criticalIssues,
      warnings,
      improvements,
      scores: {
        accuracy: scores.accuracy,
        hallucinations: scores.hallucinations,
        tone: scores.tone,
        grammar: scores.grammar,
        length: scores.length,
        overall: overallScore
      },
      metadata: {
        word_count: wordCount,
        reviewed_at: new Date().toISOString()
      }
    };
  }
  
  /**
   * Review social media thread
   */
  async reviewSocialThread(social, sourceData) {
    const text = social.formatted_thread || social.thread.join(' ');
    const criticalIssues = [];
    const warnings = [];
    const improvements = [];
    const scores = {};
    
    // 1. Check feature mentions
    const featureCheck = reviewHelpers.checkFeatureAccuracy(
      text,
      sourceData.features || []
    );
    if (!featureCheck.isAccurate && featureCheck.missingFeatures.length > 2) {
      warnings.push({
        type: 'missing_features',
        severity: 'medium',
        message: `Missing ${featureCheck.missingFeatures.length} key features`,
        suggestion: 'Ensure key features are highlighted in the thread'
      });
      scores.accuracy = 70;
    } else {
      scores.accuracy = 90;
    }
    
    // 2. Check for hallucinations
    const hallucinationCheck = reviewHelpers.checkHallucinations(
      text,
      JSON.stringify(sourceData),
      sourceData.features || []
    );
    if (hallucinationCheck.hasHallucinations) {
      hallucinationCheck.hallucinations.forEach(hallucination => {
        if (hallucination.severity === 'high') {
          criticalIssues.push(hallucination);
        } else {
          warnings.push(hallucination);
        }
      });
      scores.hallucinations = Math.max(0, 100 - hallucinationCheck.hallucinationCount * 15);
    } else {
      scores.hallucinations = 100;
    }
    
    // 3. Check tone (social should be engaging)
    const toneCheck = reviewHelpers.checkTone(text, 'engaging');
    if (!toneCheck.isAppropriate) {
      toneCheck.issues.forEach(issue => {
        improvements.push(issue);
      });
    }
    scores.tone = toneCheck.toneScore;
    
    // 4. Check thread structure
    const tweetCount = social.thread ? social.thread.length : 0;
    if (tweetCount !== 5) {
      warnings.push({
        type: 'incorrect_tweet_count',
        severity: 'low',
        message: `Thread has ${tweetCount} tweets, expected 5`,
        suggestion: 'Adjust to 5 tweets for optimal engagement'
      });
      scores.structure = 70;
    } else {
      scores.structure = 100;
    }
    
    // 5. Check for emojis and engagement
    const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;
    if (emojiCount < 3) {
      improvements.push({
        type: 'low_emoji_usage',
        severity: 'low',
        message: `Only ${emojiCount} emojis found`,
        suggestion: 'Add more emojis to increase engagement'
      });
      scores.engagement = 70;
    } else {
      scores.engagement = 95;
    }
    
    // Calculate overall score
    const overallScore = Math.round(
      (scores.accuracy + scores.hallucinations + scores.tone + scores.structure + scores.engagement) / 5
    );
    
    return {
      content_type: 'social',
      status: criticalIssues.length > 0 ? 'REJECTED' : 'APPROVED',
      criticalIssues,
      warnings,
      improvements,
      scores: {
        accuracy: scores.accuracy,
        hallucinations: scores.hallucinations,
        tone: scores.tone,
        structure: scores.structure,
        engagement: scores.engagement,
        overall: overallScore
      },
      metadata: {
        tweet_count: tweetCount,
        emoji_count: emojiCount,
        reviewed_at: new Date().toISOString()
      }
    };
  }
  
  /**
   * Review email teaser
   */
  async reviewEmailTeaser(email, sourceData) {
    const text = email.body || email.formatted_email;
    const criticalIssues = [];
    const warnings = [];
    const improvements = [];
    const scores = {};
    
    // 1. Check value proposition mention
    if (sourceData.value_proposition) {
      const vpSimilarity = reviewHelpers.calculateSimilarity(
        text,
        sourceData.value_proposition
      );
      if (vpSimilarity < 0.3) {
        warnings.push({
          type: 'value_proposition_missing',
          severity: 'medium',
          message: 'Value proposition not clearly communicated',
          suggestion: `Highlight: "${sourceData.value_proposition}"`
        });
        scores.value_proposition = 50;
      } else {
        scores.value_proposition = 90;
      }
    } else {
      scores.value_proposition = 70;
    }
    
    // 2. Check for hallucinations
    const hallucinationCheck = reviewHelpers.checkHallucinations(
      text,
      JSON.stringify(sourceData),
      sourceData.features || []
    );
    if (hallucinationCheck.hasHallucinations) {
      hallucinationCheck.hallucinations.forEach(hallucination => {
        if (hallucination.severity === 'high') {
          criticalIssues.push(hallucination);
        } else {
          warnings.push(hallucination);
        }
      });
      scores.hallucinations = Math.max(0, 100 - hallucinationCheck.hallucinationCount * 20);
    } else {
      scores.hallucinations = 100;
    }
    
    // 3. Check tone (friendly but professional)
    const toneCheck = reviewHelpers.checkTone(text, 'friendly');
    if (!toneCheck.isAppropriate) {
      toneCheck.issues.forEach(issue => {
        improvements.push(issue);
      });
    }
    scores.tone = toneCheck.toneScore;
    
    // 4. Check email structure
    if (!text.includes('Hi') && !text.includes('Hello')) {
      improvements.push({
        type: 'missing_greeting',
        severity: 'low',
        message: 'Email missing greeting',
        suggestion: 'Add a friendly greeting like "Hi there,"'
      });
      scores.structure = 80;
    } else {
      scores.structure = 100;
    }
    
    if (!text.includes('Best regards') && !text.includes('Thanks')) {
      improvements.push({
        type: 'missing_closing',
        severity: 'low',
        message: 'Email missing closing',
        suggestion: 'Add a closing like "Best regards,"'
      });
      scores.structure -= 10;
    }
    
    // 5. Check call to action
    if (!text.includes('click') && !text.includes('visit') && !text.includes('start')) {
      warnings.push({
        type: 'missing_cta',
        severity: 'medium',
        message: 'No clear call to action found',
        suggestion: 'Add a clear CTA like "Click here to get started"'
      });
      scores.cta = 50;
    } else {
      scores.cta = 95;
    }
    
    // Calculate overall score
    const overallScore = Math.round(
      (scores.value_proposition + scores.hallucinations + scores.tone + scores.structure + scores.cta) / 5
    );
    
    return {
      content_type: 'email',
      status: criticalIssues.length > 0 ? 'REJECTED' : 'APPROVED',
      criticalIssues,
      warnings,
      improvements,
      scores: {
        value_proposition: scores.value_proposition,
        hallucinations: scores.hallucinations,
        tone: scores.tone,
        structure: scores.structure,
        call_to_action: scores.cta,
        overall: overallScore
      },
      metadata: {
        word_count: email.word_count || reviewHelpers.countWords(text),
        reviewed_at: new Date().toISOString()
      }
    };
  }
  
  /**
   * Count words in text (helper)
   */
  countWords(text) {
    return text.trim().split(/\s+/).length;
  }
  
  /**
   * Simulate processing time
   */
  async simulateProcessing() {
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
}

module.exports = new ReviewService();