class CopywriterAgent {
  async createContent(factSheet) {
    // Simulate writing time
    await this.delay(1500);
    
    // Generate different content formats
    const content = {
      blogPost: this.generateBlogPost(factSheet),
      socialThread: this.generateSocialThread(factSheet),
      emailTeaser: this.generateEmailTeaser(factSheet),
      timestamp: new Date()
    };
    
    return content;
  }
  
  generateBlogPost(factSheet) {
    const features = factSheet.coreFeatures.slice(0, 3);
    const audience = factSheet.targetAudience;
    
    return {
      title: `How Our Solution ${factSheet.valueProposition.substring(0, 50)}...`,
      content: `
        <article>
          <h2>Introduction</h2>
          <p>In today's fast-paced digital landscape, ${audience}s need efficient tools to streamline their workflow. Our platform offers exactly that.</p>
          
          <h2>Key Features</h2>
          <ul>
            ${features.map(f => `<li>${f}</li>`).join('\n            ')}
          </ul>
          
          <h2>Why It Matters</h2>
          <p>${factSheet.valueProposition}</p>
          
          <h2>Getting Started</h2>
          <p>Ready to transform your content creation process? Our platform makes it simple to get started today.</p>
        </article>
      `,
      wordCount: 500,
      style: 'Professional/Trustworthy'
    };
  }
  
  generateSocialThread(factSheet) {
    const features = factSheet.coreFeatures;
    
    return {
      platform: 'Twitter/X',
      thread: [
        {
          tweetNumber: 1,
          content: `🚀 Exciting news! We're revolutionizing content creation with our new platform. ${factSheet.valueProposition.substring(0, 80)}...`
        },
        {
          tweetNumber: 2,
          content: `✨ Key features include: ${features.slice(0, 3).join(', ')}. All designed to save you time and boost engagement!`
        },
        {
          tweetNumber: 3,
          content: `💡 Perfect for ${factSheet.targetAudience}s who want to streamline their workflow and maintain brand consistency.`
        },
        {
          tweetNumber: 4,
          content: `🎯 The result? More time for strategy, less time on repetitive tasks. Ready to transform your content game?`
        },
        {
          tweetNumber: 5,
          content: `👉 Learn more and start your free trial today! #ContentMarketing #Automation #MarketingTech`
        }
      ],
      style: 'Engaging/Punchy'
    };
  }
  
  generateEmailTeaser(factSheet) {
    return {
      subject: `Transform Your ${factSheet.targetAudience.charAt(0).toUpperCase() + factSheet.targetAudience.slice(1)} Strategy with Automation`,
      preview: factSheet.valueProposition,
      body: `
        <p>Hi there,</p>
        
        <p>Are you spending too much time manually repurposing content across channels? You're not alone.</p>
        
        <p>Our new platform automates the entire content creation process, taking your source documents and instantly generating:</p>
        <ul>
          <li>Blog posts</li>
          <li>Social media threads</li>
          <li>Email newsletters</li>
        </ul>
        
        <p><strong>${factSheet.valueProposition}</strong></p>
        
        <p>Ready to save hours of work each week? <a href="#">Get started with your free trial →</a></p>
        
        <p>Best regards,<br>The Team</p>
      `,
      style: 'Professional/Friendly'
    };
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new CopywriterAgent();