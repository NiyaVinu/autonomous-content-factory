/**
 * AI Analysis Service
 * Simulates AI-powered text analysis for content extraction
 * In production, this would integrate with actual AI services like OpenAI, Anthropic, etc.
 */

class AIAnalysisService {
  /**
   * Analyze raw text and extract structured information
   * @param {string} text - Raw input text to analyze
   * @returns {Object} Structured analysis results
   */
  async analyzeText(text) {
    // Simulate AI processing time (like calling an external API)
    await this.simulateProcessingTime();
    
    // Extract information using various analysis methods
    const productName = this.extractProductName(text);
    const features = this.extractFeatures(text);
    const targetAudience = this.extractTargetAudience(text);
    const valueProposition = this.extractValueProposition(text);
    const ambiguousPoints = this.findAmbiguousPoints(text);
    
    // Calculate confidence scores for each extraction
    const confidenceScores = this.calculateConfidenceScores({
      productName,
      features,
      targetAudience,
      valueProposition
    });
    
    return {
      product_name: productName,
      features: features,
      target_audience: targetAudience,
      value_proposition: valueProposition,
      ambiguous_points: ambiguousPoints,
      metadata: {
        word_count: this.getWordCount(text),
        sentence_count: this.getSentenceCount(text),
        confidence_scores: confidenceScores,
        analyzed_at: new Date().toISOString()
      }
    };
  }
  
  /**
   * Extract product name from text
   * Uses pattern matching and common naming conventions
   */
  extractProductName(text) {
    // Common product name indicators
    const patterns = [
      /(?:product|solution|platform|software|called)\s+["']?([A-Z][a-z0-9\s]+?)(?:["']|\s+is|\s+was|\s+helps)/i,
      /introducing\s+["']?([A-Z][a-z0-9\s]+?)["']?/i,
      /announcing\s+["']?([A-Z][a-z0-9\s]+?)["']?/i,
      /meet\s+["']?([A-Z][a-z0-9\s]+?)["']?/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // If no product name found, extract the first proper noun phrase
    const words = text.split(/\s+/);
    for (let i = 0; i < Math.min(words.length, 10); i++) {
      if (words[i].charAt(0) === words[i].charAt(0).toUpperCase() && 
          words[i].length > 2 &&
          !['The', 'This', 'That', 'These', 'Those'].includes(words[i])) {
        // Check if it's a proper noun (product name candidate)
        let productName = words[i];
        let j = i + 1;
        while (j < words.length && words[j].charAt(0) === words[j].charAt(0).toUpperCase()) {
          productName += ' ' + words[j];
          j++;
        }
        if (productName.split(' ').length >= 2) {
          return productName;
        }
      }
    }
    
    return "Unnamed Product";
  }
  
  /**
   * Extract key features from the text
   * Identifies features based on common keywords and patterns
   */
  extractFeatures(text) {
    const features = new Set();
    
    // Feature indicator keywords
    const featureKeywords = [
      'feature', 'capability', 'ability to', 'can', 'allows', 
      'enables', 'supports', 'includes', 'offers', 'provides'
    ];
    
    // Split into sentences
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      
      // Check if sentence contains feature indicators
      for (const keyword of featureKeywords) {
        if (lowerSentence.includes(keyword)) {
          // Extract the feature phrase
          let feature = this.extractFeaturePhrase(sentence, keyword);
          if (feature && feature.length > 10 && feature.length < 200) {
            features.add(feature);
          }
          break;
        }
      }
    }
    
    // Convert Set to Array and limit to top 5 features
    const featureList = Array.from(features).slice(0, 5);
    
    // If no features found, generate some based on context
    if (featureList.length === 0) {
      return this.generateDefaultFeatures(text);
    }
    
    return featureList;
  }
  
  /**
   * Extract a clean feature phrase from a sentence
   */
  extractFeaturePhrase(sentence, keyword) {
    // Clean and trim the sentence
    let phrase = sentence.trim();
    
    // Remove common prefixes
    const prefixes = ['the ', 'this ', 'that ', 'our '];
    for (const prefix of prefixes) {
      if (phrase.toLowerCase().startsWith(prefix)) {
        phrase = phrase.substring(prefix.length);
      }
    }
    
    // Capitalize first letter
    phrase = phrase.charAt(0).toUpperCase() + phrase.slice(1);
    
    return phrase;
  }
  
  /**
   * Generate default features based on text context
   */
  generateDefaultFeatures(text) {
    const defaultFeatures = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('automate') || lowerText.includes('automation')) {
      defaultFeatures.push("Automated workflow processing");
    }
    if (lowerText.includes('content')) {
      defaultFeatures.push("Content generation and management");
    }
    if (lowerText.includes('analytics') || lowerText.includes('insights')) {
      defaultFeatures.push("Data analytics and insights");
    }
    if (lowerText.includes('integrate') || lowerText.includes('api')) {
      defaultFeatures.push("Third-party integrations");
    }
    if (lowerText.includes('collaborate') || lowerText.includes('team')) {
      defaultFeatures.push("Team collaboration tools");
    }
    
    if (defaultFeatures.length === 0) {
      defaultFeatures.push("Intelligent processing");
      defaultFeatures.push("User-friendly interface");
      defaultFeatures.push("Scalable architecture");
    }
    
    return defaultFeatures.slice(0, 5);
  }
  
  /**
   * Identify target audience from text
   */
  extractTargetAudience(text) {
    const lowerText = text.toLowerCase();
    
    // Audience categories with their keywords
    const audienceCategories = {
      "Enterprise Businesses": ['enterprise', 'corporation', 'large business', 'company', 'organization'],
      "Marketing Teams": ['marketing', 'marketer', 'campaign', 'content team', 'social media'],
      "Developers": ['developer', 'engineer', 'technical', 'programmer', 'coding', 'api'],
      "Small Business Owners": ['small business', 'startup', 'entrepreneur', 'founder', 'sme'],
      "Content Creators": ['creator', 'writer', 'blogger', 'influencer', 'content creator'],
      "Product Managers": ['product manager', 'product team', 'pm', 'product owner'],
      "Sales Teams": ['sales', 'salesperson', 'sales team', 'business development'],
      "Customer Support": ['support', 'customer service', 'help desk']
    };
    
    // Find matches
    const matches = [];
    for (const [audience, keywords] of Object.entries(audienceCategories)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          matches.push(audience);
          break;
        }
      }
    }
    
    // Remove duplicates and return
    const uniqueAudiences = [...new Set(matches)];
    
    if (uniqueAudiences.length > 0) {
      return uniqueAudiences;
    }
    
    // Default audience based on text tone
    if (lowerText.includes('technical') || lowerText.includes('code')) {
      return ["Technical Professionals"];
    } else if (lowerText.includes('business') || lowerText.includes('roi')) {
      return ["Business Decision Makers"];
    } else {
      return ["General Users"];
    }
  }
  
  /**
   * Extract the main value proposition
   */
  extractValueProposition(text) {
    const lowerText = text.toLowerCase();
    
    // Common value proposition indicators
    const indicators = [
      'helps', 'allows', 'enables', 'saves', 'improves', 
      'increases', 'reduces', 'eliminates', 'provides',
      'value', 'benefit', 'advantage', 'solution'
    ];
    
    // Look for sentences containing these indicators
    const sentences = text.split(/[.!?]+/);
    let bestProposition = "";
    let bestScore = 0;
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      let score = 0;
      
      for (const indicator of indicators) {
        if (lowerSentence.includes(indicator)) {
          score++;
        }
      }
      
      // Also check for explicit value statements
      if (lowerSentence.includes('value') || lowerSentence.includes('benefit')) {
        score += 2;
      }
      
      if (score > bestScore && sentence.length > 20 && sentence.length < 200) {
        bestScore = score;
        bestProposition = sentence.trim();
      }
    }
    
    if (bestProposition) {
      return this.capitalizeFirstLetter(bestProposition);
    }
    
    // Generate a default value proposition
    const features = this.extractFeatures(text);
    const audience = this.extractTargetAudience(text);
    
    if (features.length > 0) {
      return `${features[0]}, helping ${audience[0].toLowerCase()} achieve better results with less effort.`;
    }
    
    return "Delivers significant improvements in productivity and efficiency for users.";
  }
  
  /**
   * Identify ambiguous or unclear points in the text
   */
  findAmbiguousPoints(text) {
    const ambiguousPoints = [];
    const sentences = text.split(/[.!?]+/);
    
    // Vague terms that indicate ambiguity
    const vagueTerms = [
      'soon', 'maybe', 'perhaps', 'approximately', 'around', 'about', 
      'could', 'might', 'possibly', 'some', 'several', 'many',
      'a lot', 'various', 'etc', 'and so on', 'and more'
    ];
    
    // Missing specific information patterns
    const missingPatterns = [
      { pattern: /\$\d+/, message: "Pricing information is mentioned but specific amounts may be needed" },
      { pattern: /\d+%/, message: "Percentage improvement mentioned without baseline context" },
      { pattern: /coming soon/i, message: "Timeline mentioned without specific dates" },
      { pattern: /integrate with \w+/i, message: "Integration mentioned without specific platforms" }
    ];
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      
      // Check for vague terms
      for (const term of vagueTerms) {
        if (lowerSentence.includes(term) && sentence.length > 15) {
          ambiguousPoints.push({
            type: "vague_language",
            text: sentence.trim(),
            issue: `Contains vague term: "${term}"`,
            suggestion: "Replace with specific details or remove ambiguous language"
          });
          break;
        }
      }
    }
    
    // Check for missing specific information
    for (const pattern of missingPatterns) {
      if (pattern.pattern.test(text)) {
        ambiguousPoints.push({
          type: "missing_details",
          issue: pattern.message,
          suggestion: "Provide more specific information to reduce ambiguity"
        });
      }
    }
    
    // Check for contradictory statements
    const contradictions = this.findContradictions(text);
    ambiguousPoints.push(...contradictions);
    
    // Remove duplicates (keep unique based on text)
    const uniquePoints = [];
    const seenTexts = new Set();
    
    for (const point of ambiguousPoints) {
      const key = point.text || point.issue;
      if (!seenTexts.has(key)) {
        seenTexts.add(key);
        uniquePoints.push(point);
      }
    }
    
    return uniquePoints.slice(0, 5); // Limit to top 5 ambiguous points
  }
  
  /**
   * Find potential contradictions in the text
   */
  findContradictions(text) {
    const contradictions = [];
    const lowerText = text.toLowerCase();
    
    // Check for contradictory pairs
    const contradictoryPairs = [
      { a: 'simple', b: 'complex', message: "Product described as both simple and complex" },
      { a: 'cheap', b: 'premium', message: "Pricing positioning appears contradictory" },
      { a: 'fast', b: 'slow', message: "Performance description contradictory" },
      { a: 'small', b: 'large', message: "Scale description contradictory" }
    ];
    
    for (const pair of contradictoryPairs) {
      if (lowerText.includes(pair.a) && lowerText.includes(pair.b)) {
        contradictions.push({
          type: "contradiction",
          issue: pair.message,
          suggestion: "Review and align messaging to avoid contradictions"
        });
      }
    }
    
    return contradictions;
  }
  
  /**
   * Calculate confidence scores for each extraction
   */
  calculateConfidenceScores(extractedData) {
    const scores = {};
    
    // Product name confidence
    if (extractedData.productName && extractedData.productName !== "Unnamed Product") {
      scores.product_name = Math.min(0.95, 0.7 + (extractedData.productName.length / 100));
    } else {
      scores.product_name = 0.3;
    }
    
    // Features confidence
    if (extractedData.features.length > 0) {
      scores.features = Math.min(0.9, 0.5 + (extractedData.features.length / 10));
    } else {
      scores.features = 0.2;
    }
    
    // Target audience confidence
    if (extractedData.targetAudience.length > 0 && extractedData.targetAudience[0] !== "General Users") {
      scores.target_audience = 0.85;
    } else {
      scores.target_audience = 0.5;
    }
    
    // Value proposition confidence
    if (extractedData.valueProposition && extractedData.valueProposition.length > 30) {
      scores.value_proposition = 0.9;
    } else {
      scores.value_proposition = 0.6;
    }
    
    return scores;
  }
  
  /**
   * Helper: Get word count
   */
  getWordCount(text) {
    return text.trim().split(/\s+/).length;
  }
  
  /**
   * Helper: Get sentence count
   */
  getSentenceCount(text) {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  }
  
  /**
   * Helper: Capitalize first letter
   */
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  /**
   * Simulate AI processing time (like calling an external API)
   */
  async simulateProcessingTime() {
    // Simulate network delay (500ms to 1500ms)
    const delay = Math.random() * 1000 + 500;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

module.exports = new AIAnalysisService();