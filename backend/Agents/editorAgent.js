class EditorAgent {
  async reviewAndApprove(drafts, factSheet) {
    // Simulate review time
    await this.delay(800);
    
    const corrections = [];
    const approvedContent = {};
    
    // Review each piece of content
    for (const [format, content] of Object.entries(drafts)) {
      const review = await this.reviewContent(content, factSheet, format);
      
      if (review.approved) {
        approvedContent[format] = {
          ...content,
          approved: true,
          reviewNotes: review.notes
        };
      } else {
        // Simulate correction and regeneration
        corrections.push({
          format,
          corrections: review.corrections
        });
        
        // Regenerate with corrections
        approvedContent[format] = await this.regenerateContent(content, review.corrections, format);
      }
    }
    
    return {
      approvedContent,
      corrections,
      finalApproval: Object.values(approvedContent).every(c => c.approved === true),
      timestamp: new Date()
    };
  }
  
  async reviewContent(content, factSheet, format) {
    const notes = [];
    const corrections = [];
    let approved = true;
    
    // Check for hallucinations (invented features/prices)
    const hallucinationCheck = this.checkHallucinations(content, factSheet);
    if (hallucinationCheck.hasIssues) {
      approved = false;
      corrections.push(...hallucinationCheck.corrections);
      notes.push(`Hallucination detected: ${hallucinationCheck.message}`);
    }
    
    // Tone audit
    const toneCheck = this.checkTone(content, format);
    if (toneCheck.hasIssues) {
      notes.push(`Tone adjustment needed: ${toneCheck.message}`);
      corrections.push(toneCheck.suggestion);
    }
    
    // Length check
    const lengthCheck = this.checkLength(content, format);
    if (lengthCheck.hasIssues) {
      notes.push(lengthCheck.message);
      corrections.push(lengthCheck.suggestion);
    }
    
    return {
      approved,
      notes: notes.join('. '),
      corrections
    };
  }
  
  checkHallucinations(content, factSheet) {
    const contentString = JSON.stringify(content).toLowerCase();
    const featuresString = JSON.stringify(factSheet.coreFeatures).toLowerCase();
    
    // Check if any features are invented
    const featureWords = factSheet.coreFeatures.flatMap(f => f.split(' '));
    const contentWords = contentString.split(' ');
    
    const inventedFeatures = contentWords.filter(word => 
      word.length > 5 && !featureWords.includes(word) && 
      !['feature', 'capability', 'platform', 'solution'].includes(word)
    );
    
    if (inventedFeatures.length > 5) {
      return {
        hasIssues: true,
        message: 'Potential invented features detected',
        corrections: ['Remove unverified claims about features']
      };
    }
    
    return { hasIssues: false };
  }
  
  checkTone(content, format) {
    const contentString = JSON.stringify(content).toLowerCase();
    
    // Check for overly salesy language
    const salesyTerms = ['amazing', 'incredible', 'revolutionary', 'best ever', 'must have'];
    const salesyCount = salesyTerms.filter(term => contentString.includes(term)).length;
    
    if (salesyCount > 2) {
      return {
        hasIssues: true,
        message: 'Content sounds too salesy',
        suggestion: 'Reduce promotional language and focus on value'
      };
    }
    
    // Check for robotic language (format-specific)
    if (format === 'socialThread' && !contentString.includes('🎯')) {
      return {
        hasIssues: true,
        message: 'Social content lacks engaging elements',
        suggestion: 'Add emojis and more conversational tone'
      };
    }
    
    return { hasIssues: false };
  }
  
  checkLength(content, format) {
    const contentString = JSON.stringify(content);
    
    if (format === 'blogPost' && contentString.length > 5000) {
      return {
        hasIssues: true,
        message: 'Blog post is too long',
        suggestion: 'Shorten the introduction section'
      };
    }
    
    if (format === 'emailTeaser' && contentString.length > 1500) {
      return {
        hasIssues: true,
        message: 'Email is too long for a teaser',
        suggestion: 'Condense to key points only'
      };
    }
    
    return { hasIssues: false };
  }
  
  async regenerateContent(originalContent, corrections, format) {
    // Simulate regeneration with corrections applied
    await this.delay(500);
    
    // In a real implementation, this would regenerate based on corrections
    const regenerated = { ...originalContent };
    
    if (corrections.includes('Shorten the introduction section')) {
      if (regenerated.content) {
        regenerated.content = regenerated.content.replace(/<p>.*?<\/p>/, '<p>Shortened introduction for conciseness.</p>');
      }
    }
    
    if (corrections.includes('Reduce promotional language')) {
      regenerated.style = 'Balanced/Professional';
    }
    
    regenerated.approved = true;
    regenerated.regenerated = true;
    regenerated.appliedCorrections = corrections;
    
    return regenerated;
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new EditorAgent();