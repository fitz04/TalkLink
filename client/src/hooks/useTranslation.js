import { useState, useCallback } from 'react';

export function useTranslation() {
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState(null);

  const translate = useCallback(async (text, tone = 'professional') => {
    if (!text || text.trim().length === 0) {
      return { translation: '', detected_language: null, cached: false };
    }

    setTranslating(true);
    setError(null);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), tone })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '번역 중 오류가 발생했습니다');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setTranslating(false);
    }
  }, []);

  const detectLanguage = useCallback(async (text) => {
    if (!text || text.trim().length === 0) {
      return { language: null, confidence: 0 };
    }

    try {
      const res = await fetch('/api/translate/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      return await res.json();
    } catch (err) {
      console.error('Language detection error:', err);
      return { language: 'unknown', confidence: 0 };
    }
  }, []);

  const polishEmail = useCallback(async (text) => {
    if (!text || text.trim().length === 0) {
      return { result: '', mode: 'polish' };
    }

    setTranslating(true);
    setError(null);

    try {
      const res = await fetch('/api/email/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '이메일 다듬기 중 오류가 발생했습니다');
      }

      return { result: data.polished, mode: 'polish' };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setTranslating(false);
    }
  }, []);

  const summarizeEmail = useCallback(async (text) => {
    if (!text || text.trim().length === 0) {
      return { summary: '', actionItems: '', intentions: '', mode: 'summarize' };
    }

    setTranslating(true);
    setError(null);

    try {
      const res = await fetch('/api/email/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '이메일 요약 중 오류가 발생했습니다');
      }

      return {
        summary: data.summary,
        actionItems: data.action_items,
        intentions: data.intentions,
        mode: 'summarize'
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setTranslating(false);
    }
  }, []);

  return {
    translate,
    detectLanguage,
    polishEmail,
    summarizeEmail,
    translating,
    error
  };
}
