import { useState } from 'react';
import { runFullPipeline } from '../services/api';

function useContentGeneration() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Idle');
  const [logs, setLogs] = useState([]);
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const [review, setReview] = useState(null);

  const addLog = (message) => {
    setLogs(prev => [...prev, {
      timestamp: new Date(),
      message: message
    }]);
  };

  const clearState = () => {
    setContent(null);
    setError(null);
    setReview(null);
    setLogs([]);
  };

  const generateContent = async (text) => {
    setLoading(true);
    setStatus('Analyzing...');
    clearState();
    
    try {
      addLog('🚀 Starting content generation pipeline...');
      
      const result = await runFullPipeline(text, (message, stage) => {
        addLog(message);
        
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
        setContent({
          blog: result.content?.blog_post?.content || '',
          social: result.content?.social_media_thread?.formatted_thread || '',
          email: result.content?.email_teaser?.body || '',
          factSheet: result.analysis
        });
        setReview(result.review);
        
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