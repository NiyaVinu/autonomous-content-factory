import { useState } from 'react';
import { runFullPipeline } from '../services/api';

/**
 * Custom hook for managing content generation state and logic
 */
function useContentGeneration() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Idle');
  const [logs, setLogs] = useState([]);
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const [review, setReview] = useState(null);

  /**
   * Add a log entry with timestamp
   */
  const addLog = (message) => {
    setLogs(prev => [...prev, {
      timestamp: new Date(),
      message: message
    }]);
  };

  /**
   * Clear all state
   */
  const clearState = () => {
    setContent(null);
    setError(null);
    setReview(null);
    setLogs([]);
  };

  /**
   * Generate content from input text
   */
  const generateContent = async (text) => {
    setLoading(true);
    setStatus('Analyzing...');
    clearState();
    
    try {
      // Add initial log
      addLog('🚀 Starting content generation pipeline...');
      
      // Run the full pipeline with progress updates
      const result = await runFullPipeline(text, (message, stage) => {
        addLog(message);
        
        // Update status based on stage
        switch(stage) {
          case 'analysis':
            setStatus('Analyzing source content...');
            break;
          case 'generation':
            setStatus('Generating marketing content...');
            break;
          case 'review':
            setStatus('Reviewing and quality checking...');
            break;
          default:
            setStatus('Processing...');
        }
      });
      
      if (result.success) {
        addLog('✅ Content generation completed successfully!');
        setStatus('Completed');
        setContent(result.content);
        setReview(result.review);
        
        // Add review summary to logs
        if (result.review && result.review.status) {
          addLog(`📊 Review Status: ${result.review.status}`);
          if (result.review.summary) {
            addLog(`📝 ${result.review.summary.summary}`);
          }
        }
      } else {
        throw new Error(result.error || 'Generation failed');
      }
      
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message);
      setStatus('Error');
      addLog(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    status,
    logs,
    content,
    review,
    error,
    generateContent,
    clearState
  };
}

export default useContentGeneration;