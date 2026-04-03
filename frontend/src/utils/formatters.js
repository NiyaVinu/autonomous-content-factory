/**
 * Format text for display
 */
export const formatText = (text) => {
  if (!text) return '';
  
  // Replace multiple newlines with double newlines
  let formatted = text.replace(/\n{3,}/g, '\n\n');
  
  // Ensure proper spacing after periods
  formatted = formatted.replace(/\.([A-Z])/g, '. $1');
  
  // Trim whitespace
  formatted = formatted.trim();
  
  return formatted;
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 500) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Extract plain text from HTML
 */
export const htmlToPlainText = (html) => {
  if (!html) return '';
  
  // Create temporary div
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Get text content
  let text = temp.textContent || temp.innerText || '';
  
  // Clean up
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
};

/**
 * Count words in text
 */
export const countWords = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
};

/**
 * Estimate reading time in minutes
 */
export const estimateReadingTime = (text, wordsPerMinute = 200) => {
  const wordCount = countWords(text);
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return {
    minutes,
    text: minutes === 1 ? '1 min read' : `${minutes} min read`
  };
};

/**
 * Format date for display
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Generate a slug from text
 */
export const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

/**
 * Highlight keywords in text
 */
export const highlightKeywords = (text, keywords) => {
  if (!text || !keywords || keywords.length === 0) return text;
  
  let highlighted = text;
  keywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  });
  
  return highlighted;
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Extract hashtags from text
 */
export const extractHashtags = (text) => {
  if (!text) return [];
  const hashtags = text.match(/#\w+/g);
  return hashtags ? [...new Set(hashtags)] : [];
};

/**
 * Format social media post with emojis
 */
export const formatSocialPost = (text, includeEmojis = true) => {
  if (!text) return '';
  
  let formatted = text;
  
  if (includeEmojis) {
    // Add relevant emojis based on content
    const emojiMap = {
      'feature': '✨',
      'new': '🆕',
      'save': '💰',
      'time': '⏱️',
      'automate': '🤖',
      'marketing': '📢',
      'content': '📝',
      'social': '📱',
      'email': '📧',
      'blog': '📖',
      'growth': '📈',
      'success': '🎉'
    };
    
    for (const [word, emoji] of Object.entries(emojiMap)) {
      if (formatted.toLowerCase().includes(word)) {
        formatted = formatted.replace(new RegExp(`\\b${word}\\b`, 'i'), `${emoji} ${word}`);
      }
    }
  }
  
  return formatted;
};

export default {
  formatText,
  truncateText,
  htmlToPlainText,
  countWords,
  estimateReadingTime,
  formatDate,
  generateSlug,
  highlightKeywords,
  isValidEmail,
  extractHashtags,
  formatSocialPost
};

export function formatBlog(content) {
  if (!content || typeof content !== 'string') {
    return { title: '', body: [], wordCount: 0 };
  }

  const lines = content.split('\n').map(l => l.trim()).filter(l => l !== '');

  let title = '';
  let bodyLines = [];

  if (lines[0]?.startsWith('# ')) {
    title = lines[0].replace(/^#\s*/, '');
    bodyLines = lines.slice(1);
  } else {
    bodyLines = lines;
  }

  const wordCount = countWords(content);

  return { title, body: bodyLines, wordCount };
}

export function formatSocial(content) {
  if (!content || typeof content !== 'string') return [];

  // Split by numbered tweets like "1.", "2." or by double newlines
  const byNumbered = content.split(/\n(?=\d+[\.\)])/);

  if (byNumbered.length > 1) {
    return byNumbered
      .map(p => p.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter(p => p.length > 0);
  }

  // Fallback: split by double newlines
  return content
    .split(/\n\n+/)
    .map(p => p.replace(/\n/g, ' ').trim())
    .filter(p => p.length > 0);
}