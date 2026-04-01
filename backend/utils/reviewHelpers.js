/**
 * Review Helpers
 * Utility functions for content review and validation
 */

class ReviewHelpers {
  /**
   * Calculate similarity between two strings (simplified)
   */
  calculateSimilarity(str1, str2) {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    // Check for exact matches
    if (s1 === s2) return 1.0;
    
    // Check for containment
    if (s1.includes(s2) || s2.includes(s1)) {
      const shorter = Math.min(s1.length, s2.length);
      const longer = Math.max(s1.length, s2.length);
      return shorter / longer;
    }
    
    // Count common words
    const words1 = new Set(s1.split(/\s+/));
    const words2 = new Set(s2.split(/\s+/));
    
    let commonWords = 0;
    for (const word of words1) {
      if (words2.has(word) && word.length > 3) {
        commonWords++;
      }
    }
    
    const totalUniqueWords = words1.size + words2.size;
    return (commonWords * 2) / totalUniqueWords;
  }
  
  /**
   * Extract key claims from text
   */
  extractClaims(text) {
    const claims = [];
    const sentences = text.split(/[.!?]+/);
    
    // Look for factual statements
    const factIndicators = [
      'save', 'reduce', 'increase', 'improve', 'deliver', 'provide',
      'offer', 'feature', 'capability', 'support', 'integrate',
      'price', 'cost', '$', 'percent', '%', 'times faster'
    ];
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      for (const indicator of factIndicators) {
        if (lowerSentence.includes(indicator)) {
          claims.push({
            text: sentence.trim(),
            type: this.classifyClaim(lowerSentence, indicator)
          });
          break;
        }
      }
    }
    
    return claims;
  }
  
  /**
   * Classify the type of claim
   */
  classifyClaim(sentence, indicator) {
    if (sentence.includes('%') || sentence.includes('percent')) {
      return 'statistical';
    }
    if (sentence.includes('$') || sentence.includes('price') || sentence.includes('cost')) {
      return 'pricing';
    }
    if (indicator === 'feature' || indicator === 'capability') {
      return 'feature';
    }
    if (indicator === 'save' || indicator === 'reduce') {
      return 'efficiency';
    }
    return 'general';
  }
  
  /**
   * Check if content matches source features
   */
  checkFeatureAccuracy(content, sourceFeatures) {
    const issues = [];
    const contentLower = content.toLowerCase();
    const missingFeatures = [];
    const extraFeatures = [];
    
    // Check each source feature
    for (const feature of sourceFeatures) {
      const featureLower = feature.toLowerCase();
      const featureKeywords = featureLower.split(/\s+/).filter(w => w.length > 4);
      
      let found = false;
      for (const keyword of featureKeywords) {
        if (contentLower.includes(keyword)) {
          found = true;
          break;
        }
      }
      
      if (!found) {
        missingFeatures.push(feature);
        issues.push({
          type: 'missing_feature',
          severity: 'medium',
          message: `Feature not found in content: "${feature}"`,
          suggestion: `Ensure "${feature}" is mentioned in the content`
        });
      }
    }
    
    return {
      isAccurate: issues.length === 0,
      issues,
      missingFeatures,
      extraFeatures
    };
  }
  
  /**
   * Check for hallucinated content (content not in source)
   */
  checkHallucinations(content, sourceText, sourceFeatures) {
    const hallucinations = [];
    const contentLower = content.toLowerCase();
    const sourceLower = sourceText.toLowerCase();
    
    // Check for numbers and statistics
    const numberPattern = /\b\d+(?:\.\d+)?\s*(?:%|percent|dollars?|\$|times?)\b/gi;
    const contentNumbers = content.match(numberPattern) || [];
    const sourceNumbers = sourceText.match(numberPattern) || [];
    
    for (const num of contentNumbers) {
      if (!sourceNumbers.includes(num)) {
        hallucinations.push({
          type: 'unverified_claim',
          text: num,
          message: `Unverified statistic: "${num}" not found in source`,
          severity: 'high',
          suggestion: 'Remove or verify this statistic with source data'
        });
      }
    }
    
    // Check for specific claims not in source
    const claimPatterns = [
      /\b(?:save|reduce|increase|improve)\s+\w+\s+(?:\d+%|\d+\s*(?:times|hours|days?))\b/gi,
      /\b(?:costs?|priced?|only)\s+\$\d+(?:\.\d{2})?\b/gi,
      /\b(?:best|leading|top|number one|revolutionary)\b/gi
    ];
    
    for (const pattern of claimPatterns) {
      const matches = content.match(pattern) || [];
      for (const match of matches) {
        if (!sourceLower.includes(match.toLowerCase())) {
          hallucinations.push({
            type: 'unsubstantiated_claim',
            text: match,
            message: `Claim not supported by source: "${match}"`,
            severity: 'medium',
            suggestion: 'Add evidence or remove this claim'
          });
        }
      }
    }
    
    return {
      hasHallucinations: hallucinations.length > 0,
      hallucinations,
      hallucinationCount: hallucinations.length
    };
  }
  
  /**
   * Check tone appropriateness
   */
  checkTone(content, expectedTone = 'professional') {
    const issues = [];
    const contentLower = content.toLowerCase();
    
    // Define tone markers
    const toneMarkers = {
      professional: {
        positive: ['professional', 'expert', 'solution', 'platform', 'efficient', 'robust'],
        negative: ['amazing', 'incredible', 'awesome', 'cool', 'guys', 'hey']
      },
      engaging: {
        positive: ['exciting', 'amazing', 'great', 'awesome', 'hey', 'check out'],
        negative: ['therefore', 'hereby', 'pursuant', 'whereas']
      },
      friendly: {
        positive: ['hi', 'hello', 'thanks', 'appreciate', 'glad', 'happy'],
        negative: ['must', 'required', 'mandatory', 'urgent']
      }
    };
    
    const markers = toneMarkers[expectedTone] || toneMarkers.professional;
    
    // Check for inappropriate tone
    for (const negative of markers.negative) {
      if (contentLower.includes(negative)) {
        issues.push({
          type: 'tone_mismatch',
          severity: 'low',
          message: `Tone issue: "${negative}" doesn't match ${expectedTone} tone`,
          suggestion: `Replace "${negative}" with more ${expectedTone} language`
        });
      }
    }
    
    // Check for overuse of exclamation
    const exclamationCount = (content.match(/!/g) || []).length;
    if (exclamationCount > 3 && expectedTone === 'professional') {
      issues.push({
        type: 'excessive_enthusiasm',
        severity: 'low',
        message: `Too many exclamation marks (${exclamationCount}) for professional tone`,
        suggestion: 'Reduce exclamation marks to 1-2 maximum'
      });
    }
    
    // Check for ALL CAPS (shouting)
    const capsWords = content.match(/\b[A-Z]{3,}\b/g) || [];
    if (capsWords.length > 0) {
      issues.push({
        type: 'shouting',
        severity: 'medium',
        message: `Using ALL CAPS: ${capsWords.join(', ')}`,
        suggestion: 'Avoid using all caps as it appears as shouting'
      });
    }
    
    return {
      isAppropriate: issues.length === 0,
      issues,
      toneScore: this.calculateToneScore(content, expectedTone)
    };
  }
  
  /**
   * Calculate tone score (0-100)
   */
  calculateToneScore(content, expectedTone) {
    let score = 70; // Start with baseline
    
    const contentLower = content.toLowerCase();
    const markers = {
      professional: {
        good: ['professional', 'expert', 'solution', 'platform', 'efficient'],
        bad: ['amazing', 'incredible', 'awesome']
      },
      engaging: {
        good: ['exciting', 'great', 'awesome', 'check'],
        bad: ['must', 'required', 'therefore']
      }
    };
    
    const currentMarkers = markers[expectedTone] || markers.professional;
    
    // Add points for good markers
    for (const marker of currentMarkers.good) {
      if (contentLower.includes(marker)) {
        score += 5;
      }
    }
    
    // Subtract points for bad markers
    for (const marker of currentMarkers.bad) {
      if (contentLower.includes(marker)) {
        score -= 5;
      }
    }
    
    // Adjust for length
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 50) score -= 10;
    if (wordCount > 1000) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Check brand voice consistency
   */
  checkBrandConsistency(content, brandKeywords = []) {
    if (brandKeywords.length === 0) {
      return { isConsistent: true, issues: [] };
    }
    
    const issues = [];
    const contentLower = content.toLowerCase();
    
    for (const keyword of brandKeywords) {
      if (!contentLower.includes(keyword.toLowerCase())) {
        issues.push({
          type: 'brand_inconsistency',
          severity: 'medium',
          message: `Missing brand keyword: "${keyword}"`,
          suggestion: `Consider incorporating "${keyword}" to maintain brand voice`
        });
      }
    }
    
    return {
      isConsistent: issues.length === 0,
      issues,
      missingKeywords: issues.map(i => i.message)
    };
  }
  
  /**
   * Check grammar and readability
   */
  checkGrammar(text) {
    const issues = [];
    
    // Check for run-on sentences
    const sentences = text.split(/[.!?]+/);
    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/);
      if (words.length > 30) {
        issues.push({
          type: 'run_on_sentence',
          severity: 'low',
          message: `Sentence too long (${words.length} words)`,
          suggestion: 'Break into shorter sentences for better readability'
        });
        break;
      }
    }
    
    // Check for repeated words
    const words = text.toLowerCase().split(/\s+/);
    const wordCount = {};
    for (const word of words) {
      if (word.length > 3) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    }
    
    for (const [word, count] of Object.entries(wordCount)) {
      if (count > 5 && words.length > 100) {
        issues.push({
          type: 'repetitive_word',
          severity: 'low',
          message: `Word "${word}" repeated ${count} times`,
          suggestion: `Use synonyms to avoid repeating "${word}"`
        });
        break;
      }
    }
    
    // Check for passive voice (simplified)
    const passivePattern = /\b(?:is|are|was|were|be|been|being)\s+\w+ed\b/gi;
    const passiveMatches = text.match(passivePattern) || [];
    if (passiveMatches.length > 3) {
      issues.push({
        type: 'passive_voice',
        severity: 'low',
        message: `Passive voice used ${passiveMatches.length} times`,
        suggestion: 'Use active voice for more engaging content'
      });
    }
    
    return {
      hasIssues: issues.length > 0,
      issues,
      grammarScore: Math.max(0, 100 - issues.length * 10)
    };
  }
  
  /**
   * Generate overall review summary
   */
  generateSummary(reviewResults) {
    const criticalIssues = reviewResults.criticalIssues || [];
    const warnings = reviewResults.warnings || [];
    const improvements = reviewResults.improvements || [];
    
    let status = 'APPROVED';
    let summary = '';
    
    if (criticalIssues.length > 0) {
      status = 'REJECTED';
      summary = `Content rejected due to ${criticalIssues.length} critical issue(s). ${criticalIssues[0].message}`;
    } else if (warnings.length > 0) {
      status = 'APPROVED_WITH_WARNINGS';
      summary = `Content approved with ${warnings.length} warning(s). Review suggested improvements.`;
    } else {
      summary = 'Content approved with no issues found.';
    }
    
    return {
      status,
      summary,
      criticalIssuesCount: criticalIssues.length,
      warningsCount: warnings.length,
      improvementsCount: improvements.length
    };
  }
  
  /**
   * Calculate overall score (0-100)
   */
  calculateOverallScore(scores) {
    const weights = {
      accuracy: 0.35,
      hallucinations: 0.35,
      tone: 0.15,
      grammar: 0.15
    };
    
    let total = 0;
    for (const [key, weight] of Object.entries(weights)) {
      if (scores[key] !== undefined) {
        total += scores[key] * weight;
      }
    }
    
    return Math.round(total);
  }
}

module.exports = new ReviewHelpers();