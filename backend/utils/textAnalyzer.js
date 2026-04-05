/**
 * Text Analyzer Utilities
 * Helper functions for text preprocessing and analysis
 */

const axios = require('axios');

class TextAnalyzer {
  cleanText(text) {
    if (!text) return '';
    let cleaned = text;
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    cleaned = cleaned.replace(/[^\w\s.,!?;:'"()%-]/g, '');
    cleaned = cleaned.trim();
    return cleaned;
  }

  extractKeyPhrases(text, limit = 5) {
    const sentences = text.split(/[.!?]+/);
    const phrases = [];

    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/);
      let currentPhrase = [];

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (word.length > 1 && word[0] === word[0].toUpperCase() &&
            !this.isCommonWord(word.toLowerCase())) {
          currentPhrase.push(word);
        } else if (currentPhrase.length > 0) {
          if (currentPhrase.length >= 2) {
            phrases.push(currentPhrase.join(' '));
          }
          currentPhrase = [];
        }
      }

      if (currentPhrase.length >= 2) {
        phrases.push(currentPhrase.join(' '));
      }
    }

    const uniquePhrases = [...new Set(phrases)];
    return uniquePhrases.slice(0, limit);
  }

  isCommonWord(word) {
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
      'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are',
      'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did'
    ]);
    return commonWords.has(word);
  }

  calculateComplexity(text) {
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const avgSentenceLength = words.length / sentences.length;
    const complexWords = words.filter(word => this.countSyllables(word) > 3).length;
    const complexWordRatio = complexWords / words.length;
    const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * complexWordRatio);

    return {
      avg_word_length: Math.round(avgWordLength * 100) / 100,
      avg_sentence_length: Math.round(avgSentenceLength * 100) / 100,
      complex_word_ratio: Math.round(complexWordRatio * 100) / 100,
      flesch_reading_ease: Math.max(0, Math.min(100, Math.round(fleschScore))),
      readability_level: this.getReadabilityLevel(fleschScore)
    };
  }

  countSyllables(word) {
    word = word.toLowerCase();
    let count = 0;
    let previousWasVowel = false;
    for (let i = 0; i < word.length; i++) {
      const isVowel = 'aeiou'.includes(word[i]);
      if (isVowel && !previousWasVowel) count++;
      previousWasVowel = isVowel;
    }
    if (word.endsWith('e')) count--;
    return Math.max(1, count);
  }

  getReadabilityLevel(score) {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  }

  extractKeywords(text, limit = 10) {
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for',
      'in', 'is', 'it', 'of', 'on', 'or', 'the', 'to', 'with', 'from'
    ]);

    const frequency = {};
    for (const word of words) {
      if (!stopWords.has(word) && word.length > 2) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    }

    return Object.entries(frequency)
      .map(([word, count]) => ({ word, count, score: count / words.length }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Fetch and extract text content from a real URL
   */
  async fetchUrlContent(url) {
    try {
      // Ensure URL has protocol
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;

      const response = await axios.get(fullUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ContentFactory/1.0)'
        }
      });

      let html = response.data;

      // Remove script and style tags
      html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

      // Remove all HTML tags
      let text = html.replace(/<[^>]+>/g, ' ');

      // Decode HTML entities
      text = text.replace(/&amp;/g, '&')
                 .replace(/&lt;/g, '<')
                 .replace(/&gt;/g, '>')
                 .replace(/&nbsp;/g, ' ')
                 .replace(/&quot;/g, '"');

      // Clean up whitespace
      text = text.replace(/\s+/g, ' ').trim();

      // Limit to first 5000 characters to keep analysis manageable
      if (text.length > 5000) {
        text = text.substring(0, 5000) + '...';
      }

      if (text.length < 50) {
        throw new Error('Could not extract meaningful content from URL');
      }

      return text;

    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error(`Could not reach URL: ${url}. Please check the URL and try again.`);
      }
      if (error.response?.status === 403) {
        throw new Error(`Access denied to URL: ${url}. The website may block automated requests.`);
      }
      throw new Error(`Failed to fetch URL: ${error.message}`);
    }
  }

  detectLanguage(text) {
    const englishIndicators = ['the', 'and', 'for', 'with', 'this'];
    const words = text.toLowerCase().split(/\s+/);
    let englishScore = 0;
    for (const indicator of englishIndicators) {
      if (words.includes(indicator)) englishScore++;
    }
    return englishScore >= 3 ? 'en' : 'unknown';
  }

  summarizeText(text, sentenceCount = 3) {
    const sentences = text.split(/[.!?]+/);
    const keywords = this.extractKeywords(text, 5);
    const keywordSet = new Set(keywords.map(k => k.word));
    const importantSentences = [];

    for (const sentence of sentences) {
      let score = 0;
      const words = sentence.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (keywordSet.has(word)) score++;
      }
      importantSentences.push({ text: sentence.trim(), score });
    }

    return importantSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, sentenceCount)
      .map(s => s.text)
      .join('. ') + '.';
  }
}

module.exports = new TextAnalyzer();