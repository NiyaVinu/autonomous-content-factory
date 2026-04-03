/**
 * Email Generator Service
 * Generates email teasers from analysis data
 */

const contentHelpers = require('../utils/contentHelpers');

class EmailGeneratorService {
  async generateEmailTeaser(analysisData) {
    await this.simulateProcessing();

    const { product_name, features, target_audience, value_proposition } = analysisData;

    const subject = this.generateSubject(product_name, target_audience);
    const preview = this.generatePreview(value_proposition, product_name);
    const body = this.generateBody(
      product_name,
      features,
      target_audience,
      value_proposition
    );

    const formattedEmail = contentHelpers.formatEmailTeaser(subject, preview, body);
    const enhancedBody = contentHelpers.enhanceContent(body, 'email');

    return {
      id: contentHelpers.generateContentId(),
      subject: subject,
      preview_text: preview,
      body: enhancedBody,
      formatted_email: formattedEmail.formatted,
      word_count: contentHelpers.countWords(body),
      style: "Professional/Friendly",
      generated_at: new Date().toISOString()
    };
  }

  generateSubject(productName, targetAudience) {
    const audience = targetAudience[0] || "teams";
    const audienceCap = audience.charAt(0).toUpperCase() + audience.slice(1);
    const subjects = [
      `Transform Your ${audienceCap} with ${productName}`,
      `${productName}: The Game-Changer for Modern ${audienceCap}`,
      `🚀 Introducing ${productName} - Built for ${audienceCap}`,
      `Save Hours Each Week with ${productName}`,
      `Your ${audienceCap} Just Got Smarter: Meet ${productName}`
    ];

    return subjects[Math.floor(Math.random() * subjects.length)];
  }

  generatePreview(valueProposition, productName) {
    if (valueProposition) {
      return valueProposition.length > 100
        ? valueProposition.substring(0, 100) + '...'
        : valueProposition;
    }
    return `Discover how ${productName} can revolutionize your workflow and deliver exceptional results.`;
  }

  generateBody(productName, features, targetAudience, valueProposition) {
    const audience = targetAudience[0] || "you and your team";
    const audienceCap = audience.charAt(0).toUpperCase() + audience.slice(1);
    const feature1 = features[0] || "intelligent automation";
    const feature2 = features[1] || "powerful insights";
    const feature3 = features[2] || "seamless integration";

    const valueProp = valueProposition
      ? valueProposition.replace(/(\d+)\s*%/g, '$1%')
      : `The best part? ${productName} helps you achieve more in less time, with users reporting significant improvements in productivity and efficiency.`;

    return `Hi there,

I hope this email finds you well! I'm excited to share something that I think will genuinely transform how ${audience} work.

Meet ${productName} - the platform that's redefining what's possible in ${audience.toLowerCase()} operations.

Here's why ${productName} is different:

✨ ${feature1.charAt(0).toUpperCase() + feature1.slice(1)} - Streamline your workflows and eliminate manual tasks
📊 ${feature2.charAt(0).toUpperCase() + feature2.slice(1)} - Make data-driven decisions with real-time analytics
🔌 ${feature3.charAt(0).toUpperCase() + feature3.slice(1)} - Connect with your favorite tools effortlessly

${valueProp}

But don't just take my word for it. ${audienceCap} across industries are already seeing amazing results:
✔ 10+ hours saved per week on average
✔ 45% increase in engagement
✔ 3x faster content creation

Ready to see what ${productName} can do for you? I'd love to give you a personal walkthrough or set you up with a free trial.

Click here to get started: [Link to your trial/demo]

Questions? Just reply to this email - I'm here to help!

Best regards,
[Your Name]
[Your Title]
[Company Name]`;
  }

  async simulateProcessing() {
    return new Promise(resolve => setTimeout(resolve, 700));
  }
}

module.exports = new EmailGeneratorService();