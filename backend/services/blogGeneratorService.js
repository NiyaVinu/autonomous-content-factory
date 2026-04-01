/**
 * Blog Generator Service
 * Generates blog posts from analysis data
 */

const contentHelpers = require('../utils/contentHelpers');

class BlogGeneratorService {
  /**
   * Generate a blog post from analysis data
   * @param {Object} analysisData - Data from /analyze endpoint
   * @returns {Object} Generated blog post
   */
  async generateBlogPost(analysisData) {
    // Simulate AI processing time
    await this.simulateProcessing();
    
    const { product_name, features, target_audience, value_proposition } = analysisData;
    
    // Create blog title
    const title = this.generateTitle(product_name, target_audience);
    
    // Create blog sections
    const sections = this.createBlogSections(
      product_name,
      features,
      target_audience,
      value_proposition
    );
    
    // Format the blog post
    const content = contentHelpers.formatBlogPost(title, sections);
    const plainText = this.extractPlainText(content);
    const wordCount = contentHelpers.countWords(plainText);
    
    // Ensure we hit approximately 500 words
    const adjustedContent = this.adjustWordCount(content, plainText, wordCount, 500);
    
    return {
      id: contentHelpers.generateContentId(),
      title: title,
      content: adjustedContent,
      plain_text: this.extractPlainText(adjustedContent),
      word_count: contentHelpers.countWords(this.extractPlainText(adjustedContent)),
      sections: sections,
      style: "Professional/Educational",
      generated_at: new Date().toISOString()
    };
  }
  
  /**
   * Generate blog title
   */
  generateTitle(productName, targetAudience) {
    const audienceText = targetAudience[0] || "Modern Businesses";
    const titles = [
      `How ${productName} is Transforming ${audienceText}`,
      `The Ultimate Guide to ${productName} for ${audienceText}`,
      `${productName}: Revolutionizing ${audienceText} Workflows`,
      `Why ${audienceText} Are Switching to ${productName}`,
      `${productName}: The Future of ${audienceText} Automation`
    ];
    
    return titles[Math.floor(Math.random() * titles.length)];
  }
  
  /**
   * Create blog sections
   */
  createBlogSections(productName, features, targetAudience, valueProposition) {
    const audience = targetAudience[0] || "businesses";
    const featureList = features.slice(0, 3);
    
    return [
      {
        heading: "Introduction",
        content: `In today's fast-paced digital landscape, ${audience} are constantly seeking ways to streamline their operations and stay ahead of the competition. Enter ${productName}, a game-changing solution designed to address the unique challenges faced by modern ${audience}. ${valueProposition || 'This innovative platform delivers exceptional results while saving valuable time and resources.'}`
      },
      {
        heading: "The Challenge",
        content: `${audience.charAt(0).toUpperCase() + audience.slice(1)} face numerous obstacles in their daily operations. From managing multiple channels to maintaining consistent quality, the demands can be overwhelming. Manual processes often lead to inefficiencies, errors, and missed opportunities. This is where ${productName} makes a significant difference.`
      },
      {
        heading: "Key Features That Set Us Apart",
        content: `${productName} comes equipped with powerful features designed to address these challenges head-on. ${featureList[0] || 'Intelligent automation'} ensures streamlined workflows, while ${featureList[1] || 'advanced analytics'} provides actionable insights. Additionally, ${featureList[2] || 'seamless integration'} capabilities allow you to connect with your existing tools effortlessly.`
      },
      {
        heading: `How ${productName} Benefits ${audience.charAt(0).toUpperCase() + audience.slice(1)}`,
        content: `The benefits of implementing ${productName} are substantial. Users report significant improvements in efficiency, with some saving up to 10 hours per week on repetitive tasks. The platform's intuitive interface means minimal training time, while its robust features ensure you never miss important opportunities. ${targetAudience.length > 1 ? 'From marketing teams to sales departments,' : ''} everyone can leverage the power of automation.`
      },
      {
        heading: "Real-World Applications",
        content: `Imagine being able to ${featureList[0]?.toLowerCase() || 'automate complex workflows'} without any technical expertise. Picture your team collaborating seamlessly across departments, sharing insights, and making data-driven decisions in real-time. This isn't just a vision – it's what ${productName} delivers every day for forward-thinking ${audience}.`
      },
      {
        heading: "Getting Started",
        content: `Ready to transform your operations? Getting started with ${productName} is simple. Our onboarding process is designed to have you up and running in no time, with dedicated support available every step of the way. Whether you're a small team or a large enterprise, ${productName} scales to meet your needs.`
      },
      {
        heading: "Conclusion",
        content: `The future of ${audience} operations is here, and it's powered by ${productName}. Don't let manual processes hold you back any longer. Embrace automation, unlock new efficiencies, and discover what's possible when you have the right tools at your disposal. Start your journey with ${productName} today and experience the difference for yourself.`
      }
    ];
  }
  
  /**
   * Extract plain text from HTML
   */
  extractPlainText(html) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  
  /**
   * Adjust word count to target
   */
  adjustWordCount(content, plainText, currentCount, targetCount) {
    if (Math.abs(currentCount - targetCount) <= 50) {
      return content;
    }
    
    if (currentCount < targetCount) {
      // Add more content
      const missingWords = targetCount - currentCount;
      const additionalParagraph = `<p>Moreover, ${plainText.split(' ').slice(0, 20).join(' ')} continues to evolve with regular updates and new features based on user feedback. The commitment to innovation ensures that ${plainText.split(' ').slice(0, 10).join(' ')} remains at the forefront of industry solutions.</p>`;
      return content.replace('</article>', additionalParagraph + '\n</article>');
    } else {
      // Content is too long, but we'll keep it as is for quality
      return content;
    }
  }
  
  /**
   * Simulate AI processing
   */
  async simulateProcessing() {
    return new Promise(resolve => setTimeout(resolve, 800));
  }
}

module.exports = new BlogGeneratorService();