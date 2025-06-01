"use client";

import { useState, useCallback, useRef } from 'react';
import { ProgrammingKeyword } from '@/app/blog/[id]/components/Content/components/Summary/types/keywordTypes';

interface SummaryInput {
    title: string;
    text: string;
    toc?: any[]; // TOC 아이템 배열
    sectionTitle?: string; // 개별 섹션용 (하위 호환성)
    keywords: ProgrammingKeyword[];
}

export type SummaryStreamState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'streaming'; content: string }
    | { status: 'completed'; content: string }
    | { status: 'error'; message: string };

interface UseSummaryStreamReturn {
    state: SummaryStreamState;
    startStreaming: (input: SummaryInput) => Promise<void>;
    reset: () => void;
}

export const useSummaryStream = (): UseSummaryStreamReturn => {
    const [state, setState] = useState<SummaryStreamState>({ status: 'idle' });
    const abortControllerRef = useRef<AbortController | null>(null);

    const startStreaming = useCallback(async (input: SummaryInput) => {
        // 이전 요청이 있다면 중단
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // 새로운 AbortController 생성
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setState({ status: 'loading' });

        try {
            const response = await fetch('/api/blog/summary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(input),
                signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (!response.body) {
                throw new Error('응답 스트림이 없습니다.');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let content = '';

            setState({ status: 'streaming', content: '' });

            try {
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    content += chunk;

                    // 중단되었는지 확인
                    if (signal.aborted) {
                        break;
                    }

                    setState({ status: 'streaming', content });
                }

                // 스트리밍 완료
                if (!signal.aborted) {
                    setState({ status: 'completed', content });
                }
            } finally {
                reader.releaseLock();
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                // 중단된 경우 상태를 변경하지 않음
                return;
            }

            const errorMessage = error instanceof Error
                ? error.message
                : '요약 생성 중 오류가 발생했습니다.';

            setState({ status: 'error', message: errorMessage });
            console.error('Summary 스트리밍 오류:', error);
        }
    }, []);

    const reset = useCallback(() => {
        // 진행 중인 요청 중단
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setState({ status: 'idle' });
    }, []);

    return {
        state,
        startStreaming,
        reset,
    };
}; 