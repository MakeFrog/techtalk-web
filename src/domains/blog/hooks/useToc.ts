"use client";

import { useState, useCallback } from 'react';
import { TocResponse, TocItem } from '@/app/blog/[id]/components/Content/components/Summary/types/tocTypes';

interface UseTocReturn {
    tocItems: TocItem[];
    isLoading: boolean;
    error: string | null;
    generateToc: (title: string, text: string) => Promise<void>;
    reset: () => void;
}

export const useToc = (): UseTocReturn => {
    const [tocItems, setTocItems] = useState<TocItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateToc = useCallback(async (title: string, text: string) => {
        if (!title || !text) {
            setError('제목과 본문이 필요합니다.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setTocItems([]);

        try {
            const response = await fetch('/api/blog/toc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, text }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: TocResponse = await response.json();

            // 응답 데이터를 TocItem 형식으로 변환
            const items: TocItem[] = data.toc.map((tocTitle, index) => ({
                id: index + 1,
                title: tocTitle,
            }));

            setTocItems(items);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '목차 생성 중 오류가 발생했습니다.';
            setError(errorMessage);
            console.error('TOC 생성 오류:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setTocItems([]);
        setError(null);
        setIsLoading(false);
    }, []);

    return {
        tocItems,
        isLoading,
        error,
        generateToc,
        reset,
    };
}; 