"use client";

import { useState, useCallback } from 'react';
import { KeywordsResponse, ProgrammingKeyword } from '@/app/blog/[id]/components/Content/components/Summary/types/keywordTypes';

interface UseKeywordsReturn {
    keywords: ProgrammingKeyword[];
    isLoading: boolean;
    error: string | null;
    extractKeywords: (title: string, text: string) => Promise<void>;
    reset: () => void;
}

export const useKeywords = (): UseKeywordsReturn => {
    const [keywords, setKeywords] = useState<ProgrammingKeyword[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const extractKeywords = useCallback(async (title: string, text: string) => {
        if (!title || !text) {
            setError('제목과 본문이 필요합니다.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setKeywords([]);

        try {
            const response = await fetch('/api/blog/keywords', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, text }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: KeywordsResponse = await response.json();
            setKeywords(data.keywords);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '키워드 추출 중 오류가 발생했습니다.';
            setError(errorMessage);
            console.error('Keywords 추출 오류:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setKeywords([]);
        setError(null);
        setIsLoading(false);
    }, []);

    return {
        keywords,
        isLoading,
        error,
        extractKeywords,
        reset,
    };
}; 