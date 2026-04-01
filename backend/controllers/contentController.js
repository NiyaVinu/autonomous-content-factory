const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const researchAgent = require('../agents/researchAgent');
const copywriterAgent = require('../agents/copywriterAgent');
const editorAgent = require('../agents/editorAgent');

// In-memory storage for jobs (in production, use a database)
const jobs = new Map();

exports.generateContent = async (req, res) => {
  try {
    const jobId = uuidv4();
    let sourceContent = '';
    
    // Check if content is from file upload or text input
    if (req.file) {
      // Read uploaded file
      sourceContent = await fs.readFile(req.file.path, 'utf-8');
    } else if (req.body.content) {
      // Use text input
      sourceContent = req.body.content;
    } else {
      return res.status(400).json({ error: 'No content provided' });
    }
    
    // Initialize job status
    jobs.set(jobId, {
      id: jobId,
      status: 'processing',
      sourceContent: sourceContent,
      timestamp: new Date(),
      logs: [],
      result: null
    });
    
    // Process asynchronously
    processContent(jobId, sourceContent);
    
    res.json({ 
      jobId, 
      status: 'processing',
      message: 'Content generation started' 
    });
    
  } catch (error) {
    console.error('Error in generateContent:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getJobStatus = (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  res.json({
    id: job.id,
    status: job.status,
    timestamp: job.timestamp,
    logs: job.logs,
    result: job.result
  });
};

exports.getCampaign = (req, res) => {
  const job = jobs.get(req.params.campaignId);
  if (!job) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  
  res.json({
    id: job.id,
    sourceContent: job.sourceContent,
    result: job.result,
    status: job.status
  });
};

async function processContent(jobId, sourceContent) {
  const job = jobs.get(jobId);
  
  try {
    // Add log entry
    addLog(jobId, 'Starting content generation process...');
    
    // Step 1: Research & Fact-Check Agent
    addLog(jobId, '🤖 Research Agent: Analyzing source content...');
    const factSheet = await researchAgent.analyze(sourceContent);
    addLog(jobId, '✓ Research Agent: Fact sheet created');
    
    // Step 2: Creative Copywriter Agent
    addLog(jobId, '✍️ Copywriter Agent: Creating content variants...');
    const drafts = await copywriterAgent.createContent(factSheet);
    addLog(jobId, '✓ Copywriter Agent: Drafts completed');
    
    // Step 3: Editor-in-Chief Agent
    addLog(jobId, '📝 Editor Agent: Reviewing content quality...');
    const finalContent = await editorAgent.reviewAndApprove(drafts, factSheet);
    addLog(jobId, '✓ Editor Agent: Content approved');
    
    // Update job with final result
    job.status = 'completed';
    job.result = finalContent;
    addLog(jobId, '✅ Campaign generation completed!');
    
  } catch (error) {
    console.error('Error processing content:', error);
    job.status = 'failed';
    job.error = error.message;
    addLog(jobId, `❌ Error: ${error.message}`);
  }
}

function addLog(jobId, message) {
  const job = jobs.get(jobId);
  if (job && job.logs) {
    job.logs.push({
      timestamp: new Date(),
      message: message
    });
  }
}