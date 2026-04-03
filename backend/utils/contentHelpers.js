/**
 * Content Helpers
 * Utility functions for content generation
 */

class ContentHelpers {
  /**
   * Generate a unique ID for content
   */
  generateContentId() {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Count words in text
   */
  countWords(text) {
    return text.trim().split(/\s+/).length;
  }
  
  /**
   * Truncate text to specific word count
   */
  truncateToWords(text, wordCount) {
    const words = text.split(/\s+/);
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  }
  
  /**
   * Capitalize first letter of each sentence
   */
  capitalizeSentences(text) {
    return text.replace(/([.!?]\s+)([a-z])/g, (match, separator, letter) => {
      return separator + letter.toUpperCase();
    });
  }
  
  /**
   * Add emojis to text based on context
   */
  addRelevantEmojis(text, context) {
    const emojiMap = {
      'product': '🚀',
      'feature': '✨',
      'new': '🆕',
      'save': '💰',
      'time': '⏱️',
      'efficient': '⚡',
      'automate': '🤖',
      'team': '👥',
      'marketing': '📢',
      'content': '📝',
      'social': '📱',
      'email': '📧',
      'blog': '📖',
      'growth': '📈',
      'success': '🎉',
      'innovative': '💡',
      'powerful': '💪',
      'easy': '😊',
      'fast': '🚀'
    };
    
    let emojified = text;
    
    // Add emoji at the beginning if it's social media
    if (context === 'social') {
      const firstWord = text.split(' ')[0].toLowerCase();
      for (const [keyword, emoji] of Object.entries(emojiMap)) {
        if (firstWord.includes(keyword) || text.toLowerCase().includes(keyword)) {
          emojified = `${emoji} ${emojified}`;
          break;
        }
      }
    }
    
    return emojified;
  }
  
  /**
   * Format blog post with proper HTML structure
   */
  formatBlogPost(title, sections) {
    let html = `<article class="blog-post">\n`;
    html += `  <h1>${title}</h1>\n\n`;
    
    for (const section of sections) {
      html += `  <h2>${section.heading}</h2>\n`;
      html += `  <p>${section.content}</p>\n\n`;
    }
    
    html += `  <div class="blog-footer">\n`;
    html += `    <p><em>Ready to get started? Visit our website to learn more!</em></p>\n`;
    html += `  </div>\n`;
    html += `</article>`;
    
    return html;
  }
  
  /**
   * Format social media thread
   */
  formatSocialThread(thread) {
    return thread.map((tweet, index) => {
      return `${index + 1}/${thread.length} ${tweet}`;
    }).join('\n\n');
  }
  
  /**
   * Format email teaser
   */
  formatEmailTeaser(subject, preview, body) {
    return {
      subject: subject,
      preview: preview,
      body: body,
      formatted: `
Subject: ${subject}

Preview: ${preview}

${body}

---
Best regards,
The Team
      `.trim()
    };
  }
  
  /**
   * Validate generated content
   */
  validateContent(content, type, minWords = 50) {
    const issues = [];
    
    if (!content) {
      issues.push('Content is empty');
      return { valid: false, issues };
    }
    
    const wordCount = this.countWords(content);
    if (wordCount < minWords) {
      issues.push(`Content has only ${wordCount} words, expected at least ${minWords}`);
    }
    
    if (content.length > 10000) {
      issues.push('Content exceeds maximum length');
    }
    
    return {
      valid: issues.length === 0,
      issues,
      wordCount
    };
  }
  
  /**
   * Enhance content with formatting
   */
  enhanceContent(content, type) {
  let enhanced = content;

  // Fix punctuation spacing
  enhanced = enhanced.replace(/\s+\./g, '.');
  enhanced = enhanced.replace(/\s+,/g, ',');

  // Ensure proper spacing after periods (but not after numbers like 80%)
  enhanced = enhanced.replace(/\.([A-Z])/g, '. $1');

  // Capitalize first letter
  enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);

  return enhanced;
}
}

module.exports = new ContentHelpers();