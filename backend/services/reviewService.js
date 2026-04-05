/**
 * Review Service
 * Handles content review and quality checking
 */

const reviewHelpers = require('../utils/reviewHelpers');

class ReviewService {
  async reviewContent(generatedContent, sourceData) {
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

    if (generatedContent.blog_post) {
      const blogReview = await this.reviewBlogPost(generatedContent.blog_post, sourceData);
      reviewResults.sections.blog = blogReview;
      reviewResults.criticalIssues.push(...blogReview.criticalIssues);
      reviewResults.warnings.push(...blogReview.warnings);
      reviewResults.improvements.push(...blogReview.improvements);
      reviewResults.scores.blog = blogReview.scores.overall;
    }

    if (generatedContent.social_media_thread) {
      const socialReview = await this.reviewSocialThread(generatedContent.social_media_thread, sourceData);
      reviewResults.sections.social = socialReview;
      reviewResults.criticalIssues.push(...socialReview.criticalIssues);
      reviewResults.warnings.push(...socialReview.warnings);
      reviewResults.improvements.push(...socialReview.improvements);
      reviewResults.scores.social = socialReview.scores.overall;
    }

    if (generatedContent.email_teaser) {
      const emailReview = await this.reviewEmailTeaser(generatedContent.email_teaser, sourceData);
      reviewResults.sections.email = emailReview;
      reviewResults.criticalIssues.push(...emailReview.criticalIssues);
      reviewResults.warnings.push(...emailReview.warnings);
      reviewResults.improvements.push(...emailReview.improvements);
      reviewResults.scores.email = emailReview.scores.overall;
    }

    const allScores = Object.values(reviewResults.scores);
    if (allScores.length > 0) {
      reviewResults.scores.overall = Math.round(
        allScores.reduce((a, b) => a + b, 0) / allScores.length
      );
    }

    if (reviewResults.criticalIssues.length > 0) {
      reviewResults.overall_status = 'REJECTED';
    } else if (reviewResults.warnings.length > 0) {
      reviewResults.overall_status = 'APPROVED_WITH_WARNINGS';
    } else {
      reviewResults.overall_status = 'APPROVED';
    }

    reviewResults.summary = reviewHelpers.generateSummary(reviewResults);
    return reviewResults;
  }

  /**
   * Strict hallucination check — compares content numbers
   * against ONLY what the source features/value prop actually say
   */
  checkInventedClaims(contentText, sourceData) {
    const issues = [];
    const contentLower = contentText.toLowerCase();

    // Build a trusted source string from only the key fields
    const trustedSource = [
      sourceData.product_name || '',
      (sourceData.features || []).join(' '),
      sourceData.value_proposition || '',
      (sourceData.target_audience || []).join(' ')
    ].join(' ').toLowerCase();

    // Find all numbers+units in generated content
    const numberPattern = /\b(\d+(?:\.\d+)?)\s*(%|percent|x|times|hours?|days?|weeks?|months?|\$|dollars?)\b/gi;
    let match;
    while ((match = numberPattern.exec(contentText)) !== null) {
      const fullMatch = match[0];
      const num = match[1];

      // Check if this number appears in the trusted source
      if (!trustedSource.includes(num)) {
        issues.push({
          type: 'invented_statistic',
          severity: 'high',
          message: `Invented statistic not in source: "${fullMatch}"`,
          suggestion: `Remove "${fullMatch}" or replace with a verified figure from the source document`
        });
      }
    }

    // Check for superlative claims not supported by source
    const superlatives = ['best', 'leading', 'number one', '#1', 'revolutionary', 'world-class', 'unmatched', 'guaranteed'];
    for (const word of superlatives) {
      if (contentLower.includes(word) && !trustedSource.includes(word)) {
        issues.push({
          type: 'unsubstantiated_superlative',
          severity: 'high',
          message: `Unsupported claim: "${word}" not in source`,
          suggestion: `Remove "${word}" unless it can be verified from the source`
        });
        break; // Only flag once
      }
    }

    return {
      hasIssues: issues.length > 0,
      issues
    };
  }

  async reviewBlogPost(blog, sourceData) {
    const text = blog.plain_text || (typeof blog.content === 'string'
      ? blog.content.replace(/<[^>]*>/g, ' ')
      : '');
    const criticalIssues = [];
    const warnings = [];
    const improvements = [];
    const scores = {};

    // 1. Feature accuracy
    const featureCheck = reviewHelpers.checkFeatureAccuracy(text, sourceData.features || []);
    if (!featureCheck.isAccurate) {
      featureCheck.issues.forEach(issue => {
        issue.severity === 'high' ? criticalIssues.push(issue) : warnings.push(issue);
      });
    }
    scores.accuracy = featureCheck.isAccurate ? 90 : 50;

    // 2. Strict hallucination / invented claims check
    const inventedCheck = this.checkInventedClaims(text, sourceData);
    if (inventedCheck.hasIssues) {
      inventedCheck.issues.forEach(issue => criticalIssues.push(issue));
      scores.hallucinations = Math.max(0, 100 - inventedCheck.issues.length * 25);
    } else {
      scores.hallucinations = 100;
    }

    // 3. Tone check
    const toneCheck = reviewHelpers.checkTone(text, 'professional');
    if (!toneCheck.isAppropriate) {
      toneCheck.issues.forEach(issue => warnings.push(issue));
    }
    scores.tone = toneCheck.toneScore;

    // 4. Grammar check
    const grammarCheck = reviewHelpers.checkGrammar(text);
    if (grammarCheck.hasIssues) {
      grammarCheck.issues.forEach(issue => improvements.push(issue));
    }
    scores.grammar = grammarCheck.grammarScore;

    // 5. Word count
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

    const overallScore = reviewHelpers.calculateOverallScore(scores);

    return {
      content_type: 'blog',
      status: criticalIssues.length > 0 ? 'REJECTED' : 'APPROVED',
      criticalIssues,
      warnings,
      improvements,
      scores: { accuracy: scores.accuracy, hallucinations: scores.hallucinations, tone: scores.tone, grammar: scores.grammar, length: scores.length, overall: overallScore },
      metadata: { word_count: wordCount, reviewed_at: new Date().toISOString() }
    };
  }

  async reviewSocialThread(social, sourceData) {
    const text = social.formatted_thread || (social.thread || []).join(' ');
    const criticalIssues = [];
    const warnings = [];
    const improvements = [];
    const scores = {};

    const featureCheck = reviewHelpers.checkFeatureAccuracy(text, sourceData.features || []);
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

    const inventedCheck = this.checkInventedClaims(text, sourceData);
    if (inventedCheck.hasIssues) {
      inventedCheck.issues.forEach(issue => criticalIssues.push(issue));
      scores.hallucinations = Math.max(0, 100 - inventedCheck.issues.length * 20);
    } else {
      scores.hallucinations = 100;
    }

    const toneCheck = reviewHelpers.checkTone(text, 'engaging');
    if (!toneCheck.isAppropriate) {
      toneCheck.issues.forEach(issue => improvements.push(issue));
    }
    scores.tone = toneCheck.toneScore;

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

    const overallScore = Math.round(
      (scores.accuracy + scores.hallucinations + scores.tone + scores.structure + scores.engagement) / 5
    );

    return {
      content_type: 'social',
      status: criticalIssues.length > 0 ? 'REJECTED' : 'APPROVED',
      criticalIssues,
      warnings,
      improvements,
      scores: { accuracy: scores.accuracy, hallucinations: scores.hallucinations, tone: scores.tone, structure: scores.structure, engagement: scores.engagement, overall: overallScore },
      metadata: { tweet_count: tweetCount, emoji_count: emojiCount, reviewed_at: new Date().toISOString() }
    };
  }

  async reviewEmailTeaser(email, sourceData) {
    const text = email.body || email.formatted_email;
    const criticalIssues = [];
    const warnings = [];
    const improvements = [];
    const scores = {};

    if (sourceData.value_proposition) {
      const vpSimilarity = reviewHelpers.calculateSimilarity(text, sourceData.value_proposition);
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

    const inventedCheck = this.checkInventedClaims(text, sourceData);
    if (inventedCheck.hasIssues) {
      inventedCheck.issues.forEach(issue => criticalIssues.push(issue));
      scores.hallucinations = Math.max(0, 100 - inventedCheck.issues.length * 25);
    } else {
      scores.hallucinations = 100;
    }

    const toneCheck = reviewHelpers.checkTone(text, 'friendly');
    if (!toneCheck.isAppropriate) {
      toneCheck.issues.forEach(issue => improvements.push(issue));
    }
    scores.tone = toneCheck.toneScore;

    if (!text.includes('Hi') && !text.includes('Hello')) {
      improvements.push({ type: 'missing_greeting', severity: 'low', message: 'Email missing greeting', suggestion: 'Add a friendly greeting like "Hi there,"' });
      scores.structure = 80;
    } else {
      scores.structure = 100;
    }

    if (!text.includes('Best regards') && !text.includes('Thanks')) {
      improvements.push({ type: 'missing_closing', severity: 'low', message: 'Email missing closing', suggestion: 'Add a closing like "Best regards,"' });
      scores.structure = (scores.structure || 100) - 10;
    }

    if (!text.includes('click') && !text.includes('visit') && !text.includes('start')) {
      warnings.push({ type: 'missing_cta', severity: 'medium', message: 'No clear call to action found', suggestion: 'Add a clear CTA like "Click here to get started"' });
      scores.cta = 50;
    } else {
      scores.cta = 95;
    }

    const overallScore = Math.round(
      (scores.value_proposition + scores.hallucinations + scores.tone + scores.structure + scores.cta) / 5
    );

    return {
      content_type: 'email',
      status: criticalIssues.length > 0 ? 'REJECTED' : 'APPROVED',
      criticalIssues,
      warnings,
      improvements,
      scores: { value_proposition: scores.value_proposition, hallucinations: scores.hallucinations, tone: scores.tone, structure: scores.structure, call_to_action: scores.cta, overall: overallScore },
      metadata: { word_count: email.word_count || reviewHelpers.countWords(text), reviewed_at: new Date().toISOString() }
    };
  }

  countWords(text) {
    return text.trim().split(/\s+/).length;
  }

  async simulateProcessing() {
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
}

module.exports = new ReviewService();