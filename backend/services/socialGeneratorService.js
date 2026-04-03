/**
 * Social Media Generator Service
 * Generates social media threads from analysis data
 */
const contentHelpers = require('../utils/contentHelpers');

class SocialGeneratorService {
  async generateSocialThread(analysisData) {
    await this.simulateProcessing();

    const { product_name, features, target_audience, value_proposition } = analysisData;

    const tweets = this.createTweetThread(
      product_name,
      features,
      target_audience,
      value_proposition
    );

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

  createTweetThread(productName, features, targetAudience, valueProposition) {
    const audience = targetAudience[0] || "businesses";
    const feature1 = features[0] || "intelligent automation";
    const feature2 = features[1] || "advanced analytics";
    const feature3 = features[2] || "seamless integration";
    const audienceCap = audience.charAt(0).toUpperCase() + audience.slice(1);

    const valueProp = valueProposition
      ? valueProposition.replace(/(\d+)\s*%/g, '$1%')
      : 'Save time, reduce errors, and boost productivity by up to 45%';

    return [
      `🚀 Exciting news! ${productName} is here to transform how ${audience} work. Say goodbye to manual processes and hello to automation! 🎯\n\n#Innovation #Automation`,

      `🤔 Are you spending hours on repetitive tasks? You're not alone. ${audienceCap} everywhere face the same challenge. But what if there was a better way?`,

      `⚡ Enter ${productName} - your all-in-one solution! Features include:\n\n✔ ${feature1}\n✔ ${feature2}\n✔ ${feature3}\n\nAll designed to supercharge your workflow!`,

      `📈 The results? ${valueProp}. ${audienceCap} are already seeing amazing results! 🎉`,

      `👉 Ready to transform your workflow? Learn more about ${productName} and start your free trial today!\n\n💬 ${this.getCallToAction()}\n\n#ProductLaunch #MarketingTech #Innovation`
    ];
  }

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

  async simulateProcessing() {
    return new Promise(resolve => setTimeout(resolve, 600));
  }
}

module.exports = new SocialGeneratorService();