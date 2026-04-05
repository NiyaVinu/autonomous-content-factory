import { useState } from 'react';
import { runFullPipeline } from '../services/api';

function useContentGeneration() {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const [agentStates, setAgentStates] = useState({ factCheck: 'idle', copywriter: 'idle', editor: 'idle' });
  const [chatFeed, setChatFeed] = useState([]);
  const [review, setReview] = useState(null);

  const addChat = (agent, message, type = 'info') => {
    setChatFeed(prev => [...prev, {
      id: Date.now() + Math.random(),
      agent,
      message,
      type,
      time: new Date().toLocaleTimeString()
    }]);
  };

  const clearState = () => {
    setContent(null);
    setError(null);
    setReview(null);
    setAgentStates({ factCheck: 'idle', copywriter: 'idle', editor: 'idle' });
    setChatFeed([]);
  };

  const generateContent = async (text) => {
    setLoading(true);
    clearState();

    try {
      // Agent 1 starts
      setAgentStates({ factCheck: 'running', copywriter: 'idle', editor: 'idle' });
      addChat('factCheck', 'Reading source document and extracting key information...');

      const result = await runFullPipeline(text, (message, stage) => {
        if (stage === 'analysis') {
          addChat('factCheck', message);

        } else if (stage === 'generation') {
          setAgentStates({ factCheck: 'done', copywriter: 'running', editor: 'idle' });
          addChat('factCheck', 'Fact-Sheet complete. Passing verified data to Copywriter.');
          addChat('copywriter', 'Received Fact-Sheet. Generating Blog, Social Thread and Email simultaneously...');

        } else if (stage === 'review') {
          setAgentStates({ factCheck: 'done', copywriter: 'done', editor: 'running' });
          addChat('copywriter', 'All content drafts complete. Sending to Editor for review...');
          addChat('editor', 'Received drafts. Running hallucination check, tone audit and quality review...');

        } else if (stage === 'feedback') {
          // Feedback loop — editor rejected, sending back to copywriter
          setAgentStates({ factCheck: 'done', copywriter: 'running', editor: 'running' });
          addChat('editor', '✗ Content rejected. Sending correction notes to Copywriter...', 'error');
          addChat('copywriter', `Received correction notes. Revising content...`, 'warning');
        }
      });

      if (result.success) {
        const reviewData = result.review;
        const overallStatus = reviewData?.status || 'APPROVED';

        setAgentStates({ factCheck: 'done', copywriter: 'done', editor: 'done' });

        if (overallStatus === 'REJECTED') {
          addChat('editor', `✗ Content REJECTED after max revisions — ${reviewData?.critical_issues?.length || 0} critical issue(s) remain. Showing best version.`, 'error');
        } else if (overallStatus === 'APPROVED_WITH_WARNINGS') {
          addChat('editor', `⚠ Content APPROVED WITH WARNINGS — ${reviewData?.warnings?.length || 0} warning(s) found.`, 'warning');
        } else {
          addChat('editor', '✓ All content reviewed and approved. No issues found!', 'success');
        }

        setReview(reviewData);
        setContent({
          blog: result.content?.blog_post?.content || '',
          social: result.content?.social_media_thread?.formatted_thread || '',
          email: result.content?.email_teaser?.body || '',
          factSheet: result.analysis
        });
      } else {
        throw new Error(result.error || 'Generation failed');
      }

    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message);
      setAgentStates({ factCheck: 'error', copywriter: 'error', editor: 'error' });
      addChat('factCheck', `✗ Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    content,
    error,
    agentStates,
    chatFeed,
    review,
    generateContent,
    clearState
  };
}

export default useContentGeneration;