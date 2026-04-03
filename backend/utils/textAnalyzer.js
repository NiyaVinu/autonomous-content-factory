/**
 * Text Analyzer Utilities
 * Helper functions for text preprocessing and analysis
 */

class TextAnalyzer {
  /**
   * Clean and preprocess text
   * @param {string} text - Raw input text
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    if (!text) return '';
    
    let cleaned = text;
    
    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Remove HTML tags if any
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    
    // Remove special characters but keep punctuation
    cleaned = cleaned.replace(/[^\w\s.,!?;:'"()-]/g, '');
    
    // Trim whitespace
    cleaned = cleaned.trim();
    
    return cleaned;
  }
  
  /**
   * Extract key phrases from text
   * @param {string} text - Input text
   * @param {number} limit - Maximum number of phrases
   * @returns {Array} Array of key phrases
   */
  extractKeyPhrases(text, limit = 5) {
    const sentences = text.split(/[.!?]+/);
    const phrases = [];
    
    for (const sentence of sentences) {
      // Look for capitalized phrases that might be proper nouns
      const words = sentence.trim().split(/\s+/);
      let currentPhrase = [];
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        // Check if word is capitalized (potential proper noun)
        if (word.length > 1 && word[0] === word[0].toUpperCase() && 
            !this.isCommonWord(word.toLowerCase())) {
          currentPhrase.push(word);
        } else if (currentPhrase.length > 0) {
          // End of phrase
          if (currentPhrase.length >= 2) {
            phrases.push(currentPhrase.join(' '));
          }
          currentPhrase = [];
        }
      }
      
      // Add last phrase if exists
      if (currentPhrase.length >= 2) {
        phrases.push(currentPhrase.join(' '));
      }
    }
    
    // Remove duplicates and limit
    const uniquePhrases = [...new Set(phrases)];
    return uniquePhrases.slice(0, limit);
  }
  
  /**
   * Check if a word is common (not a proper noun)
   */
  isCommonWord(word) {
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
      'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are',
      'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did'
    ]);
    
    return commonWords.has(word);
  }
  
  /**
   * Calculate text complexity score
   * @param {string} text - Input text
   * @returns {Object} Complexity metrics
   */
  calculateComplexity(text) {
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/);
    
    // Average word length
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // Average sentence length
    const avgSentenceLength = words.length / sentences.length;
    
    // Count of complex words (more than 3 syllables - simplified)
    const complexWords = words.filter(word => this.countSyllables(word) > 3).length;
    const complexWordRatio = complexWords / words.length;
    
    // Flesch Reading Ease approximation
    const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * complexWordRatio);
    
    return {
      avg_word_length: Math.round(avgWordLength * 100) / 100,
      avg_sentence_length: Math.round(avgSentenceLength * 100) / 100,
      complex_word_ratio: Math.round(complexWordRatio * 100) / 100,
      flesch_reading_ease: Math.max(0, Math.min(100, Math.round(fleschScore))),
      readability_level: this.getReadabilityLevel(fleschScore)
    };
  }
  
  /**
   * Simple syllable counter (approximation)
   */
  countSyllables(word) {
    word = word.toLowerCase();
    let count = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = 'aeiou'.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }
    
    // Handle silent e
    if (word.endsWith('e')) {
      count--;
    }
    
    return Math.max(1, count);
  }
  
  /**
   * Get readability level description
   */
  getReadabilityLevel(score) {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  }
  
  /**
   * Extract keywords with TF-IDF like scoring
   * @param {string} text - Input text
   * @param {number} limit - Number of keywords to return
   * @returns {Array} Array of keywords with scores
   */
  extractKeywords(text, limit = 10) {
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for',
      'in', 'is', 'it', 'of', 'on', 'or', 'the', 'to', 'with', 'from'
    ]);
    
    // Count word frequencies
    const frequency = {};
    for (const word of words) {
      if (!stopWords.has(word) && word.length > 2) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    }
    
    // Calculate scores
    const keywords = Object.entries(frequency)
      .map(([word, count]) => ({
        word,
        count,
        score: count / words.length
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    return keywords;
  }
  
  /**
   * Simulate fetching content from URL
   * In production, you would use axios or node-fetch
   */
  async fetchUrlContent(url) {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return simulated content
    return `Content from ${url}: This is a simulated webpage content. 
    In a real implementation, you would fetch the actual HTML and extract the main content.
    The product features include intelligent automation, real-time analytics, and seamless integration.
    Target audience includes marketing professionals and content creators.`;
  }
  
  /**
   * Detect language of text (simplified)
   * @param {string} text - Input text
   * @returns {string} Detected language code
   */
  detectLanguage(text) {
    // Simple detection - check for common English words
    const englishIndicators = ['the', 'and', 'for', 'with', 'this'];
    const words = text.toLowerCase().split(/\s+/);
    
    let englishScore = 0;
    for (const indicator of englishIndicators) {
      if (words.includes(indicator)) {
        englishScore++;
      }
    }
    
    return englishScore >= 3 ? 'en' : 'unknown';
  }
  
  /**
   * Summarize text
   * @param {string} text - Input text
   * @param {number} sentenceCount - Number of sentences in summary
   * @returns {string} Text summary
   */
  summarizeText(text, sentenceCount = 3) {
    const sentences = text.split(/[.!?]+/);
    const importantSentences = [];
    
    // Simple importance scoring based on keyword presence
    const keywords = this.extractKeywords(text, 5);
    const keywordSet = new Set(keywords.map(k => k.word));
    
    for (const sentence of sentences) {
      let score = 0;
      const words = sentence.toLowerCase().split(/\s+/);
      
      for (const word of words) {
        if (keywordSet.has(word)) {
          score++;
        }
      }
      
      importantSentences.push({ text: sentence.trim(), score });
    }
    
    // Sort by importance and take top sentences
    const topSentences = importantSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, sentenceCount)
      .map(s => s.text);
    
    return topSentences.join('. ') + '.';
  }
}

module.exports = new TextAnalyzer();