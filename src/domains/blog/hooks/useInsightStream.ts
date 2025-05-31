import { useState, useCallback, useRef } from 'react';

interface BlogInput {
    title: string;
    text: string;
}

// 인사이트 스트림 상태 타입 - Discriminated Union 패턴
export type InsightStreamState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'streaming'; content: string }
    | { status: 'completed'; content: string }
    | { status: 'error'; message: string };

/**
 * 인사이트 스트리밍을 관리하는 Hook
 * 
 * 개선사항:
 * - 실시간 청크 처리로 빠른 응답성
 * - ChatGPT 스타일의 자연스러운 스트리밍
 * - AbortController를 통한 안전한 스트림 취소
 */
export function useInsightStream() {
    const [state, setState] = useState<InsightStreamState>({ status: 'idle' });
    const abortControllerRef = useRef<AbortController | null>(null);

    const startStreaming = useCallback(async (blogInput: BlogInput) => {
        console.log('🚀 [인사이트] 스트리밍 시작');
        console.log('📋 [인사이트] 입력:', {
            title: blogInput.title,
            textLength: blogInput.text.length
        });

        // 이전 요청이 있으면 취소
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // 새로운 AbortController 생성
        abortControllerRef.current = new AbortController();

        setState({ status: 'loading' });

        try {
            const response = await fetch('/api/blog/insights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(blogInput),
                signal: abortControllerRef.current.signal, // 취소 가능한 요청
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: 서버 응답 오류`);
            }

            if (!response.body) {
                throw new Error('응답 스트림을 받을 수 없습니다.');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';

            console.log('📡 [인사이트] 스트림 읽기 시작');
            setState({ status: 'streaming', content: '' });

            try {
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                        console.log('✅ [인사이트] 스트림 완료');
                        // 마지막에 불필요한 줄바꿈 제거
                        const trimmedContent = accumulatedContent.trim();
                        setState({ status: 'completed', content: trimmedContent });
                        break;
                    }

                    // 새로운 청크를 디코딩하여 누적
                    const chunk = decoder.decode(value, { stream: true });
                    accumulatedContent += chunk;

                    // 실시간으로 상태 업데이트 (받은 만큼 바로 표시, 뒤쪽 공백만 trim)
                    setState({ status: 'streaming', content: accumulatedContent.trimEnd() });

                    console.log('📨 [인사이트] 청크 수신:', {
                        chunkLength: chunk.length,
                        totalLength: accumulatedContent.length
                    });
                }
            } catch (streamError) {
                if (streamError instanceof Error && streamError.name === 'AbortError') {
                    console.log('🛑 [인사이트] 스트림 취소됨');
                    setState({ status: 'idle' });
                } else {
                    console.error('❌ [인사이트] 스트림 읽기 오류:', streamError);
                    setState({
                        status: 'error',
                        message: '스트림 읽기에 실패했습니다.'
                    });
                }
            } finally {
                reader.releaseLock();
            }

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('🛑 [인사이트] 요청 취소됨');
                setState({ status: 'idle' });
            } else {
                console.error('❌ [인사이트] 요청 오류:', error);
                setState({
                    status: 'error',
                    message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
                });
            }
        }
    }, []);

    const stopStreaming = useCallback(() => {
        console.log('🛑 [인사이트] 스트리밍 중단');

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        setState({ status: 'idle' });
    }, []);

    const reset = useCallback(() => {
        console.log('🔄 [인사이트] Hook 리셋');

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        setState({ status: 'idle' });
    }, []);

    return {
        state,
        startStreaming,
        stopStreaming,
        reset,
        // 디버깅용 상태 노출
        debug: {
            hasActiveRequest: !!abortControllerRef.current
        }
    };
} 