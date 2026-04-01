/**
 * Social Media Generator Service
 * Generates social media threads from analysis data
 */

const contentHelpers = require('../utils/contentHelpers');

class SocialGeneratorService {
  /**
   * Generate social media thread from analysis data
   * @param {Object} analysisData - Data from /analyze endpoint
   * @returns {Object} Generated social media thread
   */
  async generateSocialThread(analysisData) {
    // Simulate AI processing time
    await this.simulateProcessing();
    
    const { product_name, features, target_audience, value_proposition } = analysisData;
    
    // Create 5 tweets for the thread
    const tweets = this.createTweetThread(
      product_name,
      features,
      target_audience,
      value_proposition
    );
    
    // Format the thread
    const formattedThread = contentHelpers.formatSocialThread(tweets);
    
    return {
      id: contentHelpers.generateContentId(),
      platform: "Twitter/X",
      thread: tweets,
      formatted_thread: formattedThread,
      tweet_count: tweets.length,
      style: "Engaging/Punchy",
      generated_at: new Date().toISOString()
    };
  }
  
  /**
   * Create a thread of 5 tweets
   */
  createTweetThread(productName, features, targetAudience, valueProposition) {
    const audience = targetAudience[0] || "businesses";
    const feature1 = features[0] || "intelligent automation";
    const feature2 = features[1] || "advanced analytics";
    const feature3 = features[2] || "seamless integration";
    
    // Use emojis based on context
    const emojis = {
      start: ['🚀', '💡', '✨', '🎯', '🔥'],
      feature: ['⚡', '🔧', '💪', '🎨', '🤖'],
      benefit: ['💰', '⏱️', '📈', '🎉', '🏆'],
      call: ['👉', '🔗', '💬', '📱', '✨']
    };
    
    const randomEmoji = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    return [
      // Tweet 1: Hook/Introduction
      `${randomEmoji(emojis.start)} Exciting news! ${productName} is here to transform how ${audience} work. Say goodbye to manual processes and hello to automation! 🎯\n\n#Innovation #Automation`,
      
      // Tweet 2: Problem statement
      `🤔 Are you spending hours on repetitive tasks? You're not alone. ${audience.charAt(0).toUpperCase() + audience.slice(1)} everywhere face the same challenge. But what if there was a better way?`,
      
      // Tweet 3: Solution/Features
      `${randomEmoji(emojis.feature)} Enter ${productName} - your all-in-one solution! Features include:\n\n✓ ${feature1}\n✓ ${feature2}\n✓ ${feature3}\n\nAll designed to supercharge your workflow! ⚡`,
      
      // Tweet 4: Benefits/Value Proposition
      `${randomEmoji(emojis.benefit)} The results? ${valueProposition || 'Save time, reduce errors, and boost productivity by up to 45%'}. ${audience.charAt(0).toUpperCase() + audience.slice(1)} are already seeing amazing results! 📊`,
      
      // Tweet 5: Call to Action
      `${randomEmoji(emojis.call)} Ready to transform your workflow? Learn more about ${productName} and start your free trial today!\n\n👇 ${this.getCallToAction()}\n\n#ProductLaunch #MarketingTech #Innovation`
    ];
  }
  
  /**
   * Get call to action link
   */
  getCallToAction() {
    const ctas = [
      "Link in bio to get started!",
      "Visit our website to learn more →",
      "Click the link in our profile!",
      "Try it free for 14 days!",
      "Book a demo today!"
    ];
    return ctas[Math.floor(Math.random() * ctas.length)];
  }
  
  /**
   * Simulate AI processing
   */
  async simulateProcessing() {
    return new Promise(resolve => setTimeout(resolve, 600));
  }
}

module.exports = new SocialGeneratorService();