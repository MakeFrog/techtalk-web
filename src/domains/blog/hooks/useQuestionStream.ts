import { useState, useCallback, useRef, useEffect } from 'react';
import { useBlogBasicInfo } from '@/domains/blog/providers/BlogBasicInfoProvider';

export interface Question {
    question: string;
    answer: string;
}

// 질문 스트림 상태 타입 (Discriminated Union)
export type QuestionStreamState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'streaming'; questions: Question[] }
    | { status: 'completed'; questions: Question[] }
    | { status: 'error'; message: string; questions: Question[] };

interface QuestionStreamInput {
    title: string;
    content: string;
}

/**
 * 면접 질문 스트리밍을 관리하는 Hook
 * 
 * 개선사항:
 * - 실시간 질문 수신 및 표시
 * - 중복 질문 방지 로직
 * - AbortController를 통한 안전한 스트림 취소
 * - API 레이어에서의 자동 저장 (BlogBasicInfoProvider의 documentId 활용)
 * - 초기 로드 시 기존 저장된 QnA 확인 및 로드
 */
export function useQuestionStream() {
    const [state, setState] = useState<QuestionStreamState>({ status: 'idle' });
    const abortControllerRef = useRef<AbortController | null>(null);
    const { documentId } = useBlogBasicInfo();
    const [hasCheckedExisting, setHasCheckedExisting] = useState(false);

    // 기존 QnA 데이터 확인 및 로드
    const checkExistingQuestions = useCallback(async () => {
        if (!documentId || hasCheckedExisting) return;

        console.log('🔍 [면접질문] 기존 데이터 확인 중:', documentId);
        setHasCheckedExisting(true);

        try {
            const response = await fetch(`/api/blog/analyzed-info/${documentId}`);
            const result = await response.json();

            if (result.success && result.exists && result.data?.qna && Array.isArray(result.data.qna) && result.data.qna.length > 0) {
                console.log('✅ [면접질문] 기존 데이터 발견:', {
                    questionsCount: result.data.qna.length
                });
                setState({
                    status: 'completed',
                    questions: result.data.qna
                });
            } else {
                console.log('📭 [면접질문] 기존 데이터 없음');
            }
        } catch (error) {
            console.error('❌ [면접질문] 기존 데이터 확인 실패:', error);
        }
    }, [documentId, hasCheckedExisting]);

    // 컴포넌트 마운트 시 기존 데이터 확인
    useEffect(() => {
        if (documentId && !hasCheckedExisting) {
            checkExistingQuestions();
        }
    }, [documentId, checkExistingQuestions, hasCheckedExisting]);

    const startStreaming = useCallback(async (input: QuestionStreamInput) => {
        // 이미 완료된 상태면 스트리밍 시작하지 않음
        if (state.status === 'completed') {
            console.log('✅ [면접질문] 이미 완료된 상태, 스트리밍 생략');
            return;
        }

        console.log('🚀 [면접질문] 스트리밍 시작');
        console.log('📋 [면접질문] 입력:', {
            title: input.title,
            contentLength: input.content.length,
            documentId // BlogBasicInfoProvider에서 가져온 documentId 사용
        });

        // 이전 요청이 있으면 취소
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // 새로운 AbortController 생성
        abortControllerRef.current = new AbortController();

        setState({ status: 'loading' });

        try {
            // documentId를 포함한 요청 데이터
            const requestBody = {
                ...input,
                documentId // API에서 자동 저장을 위해 documentId 전달
            };

            const response = await fetch('/api/blog/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                // 기존 QnA가 있는 경우 (status 200이지만 useExisting: true)
                if (response.status === 200) {
                    const result = await response.json();
                    if (result.useExisting && result.data && Array.isArray(result.data)) {
                        console.log('✅ [면접질문] 기존 저장된 QnA 사용:', {
                            questionsCount: result.data.length
                        });
                        setState({
                            status: 'completed',
                            questions: result.data
                        });
                        return;
                    }
                }
                throw new Error(`HTTP ${response.status}: 서버 응답 오류`);
            }

            // 스트리밍이 아닌 일반 JSON 응답 처리 (useExisting 케이스)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const result = await response.json();
                if (result.useExisting && result.data && Array.isArray(result.data)) {
                    console.log('✅ [면접질문] 기존 저장된 QnA 사용:', {
                        questionsCount: result.data.length
                    });
                    setState({
                        status: 'completed',
                        questions: result.data
                    });
                    return;
                }
            }

            if (!response.body) {
                throw new Error('응답 스트림을 받을 수 없습니다.');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            const questions: Question[] = [];
            const receivedQuestions = new Set<string>(); // 중복 방지

            console.log('📡 [면접질문] 스트림 읽기 시작');
            setState({ status: 'streaming', questions: [] });

            try {
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                        console.log('✅ [면접질문] 스트림 완료 (API에서 자동 저장됨)');
                        setState({ status: 'completed', questions });
                        break;
                    }

                    const chunk = decoder.decode(value, { stream: true });

                    // SSE 형식 파싱 (data: {...})
                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const jsonData = line.slice(6); // 'data: ' 제거
                                const parsedData = JSON.parse(jsonData);

                                // 에러 처리
                                if (parsedData.error) {
                                    console.error('❌ [면접질문] 서버 에러:', parsedData.error);
                                    setState({
                                        status: 'error',
                                        message: parsedData.error,
                                        questions
                                    });
                                    return;
                                }

                                // 질문 데이터 처리
                                if (parsedData.question && parsedData.answer) {
                                    const questionKey = `${parsedData.question}_${parsedData.answer}`;

                                    // 중복 질문 제거
                                    if (!receivedQuestions.has(questionKey)) {
                                        receivedQuestions.add(questionKey);
                                        questions.push({
                                            question: parsedData.question,
                                            answer: parsedData.answer
                                        });

                                        console.log(`📨 [면접질문] 새 질문 수신 (${questions.length}번째):`, {
                                            question: parsedData.question.substring(0, 50) + '...',
                                            answer: parsedData.answer.substring(0, 30) + '...'
                                        });

                                        // 실시간 상태 업데이트
                                        setState({ status: 'streaming', questions: [...questions] });
                                    } else {
                                        console.log('⏭️ [면접질문] 중복 질문 건너뛰기');
                                    }
                                }
                            } catch (parseError) {
                                console.warn('⚠️ [면접질문] JSON 파싱 실패:', line);
                            }
                        }
                    }
                }
            } catch (streamError) {
                if (streamError instanceof Error && streamError.name === 'AbortError') {
                    console.log('🛑 [면접질문] 스트림 취소됨');
                    setState({ status: 'idle' });
                } else {
                    console.error('❌ [면접질문] 스트림 읽기 오류:', streamError);
                    setState({
                        status: 'error',
                        message: '스트림 읽기에 실패했습니다.',
                        questions
                    });
                }
            } finally {
                reader.releaseLock();
            }

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('🛑 [면접질문] 요청 취소됨');
                setState({ status: 'idle' });
            } else {
                console.error('❌ [면접질문] 요청 오류:', error);
                setState({
                    status: 'error',
                    message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
                    questions: []
                });
            }
        }
    }, [documentId, state.status, checkExistingQuestions]);

    const stopStreaming = useCallback(() => {
        console.log('🛑 [면접질문] 스트리밍 중단');

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        setState(prev => ({ ...prev, status: 'idle' }));
    }, []);

    const reset = useCallback(() => {
        console.log('🔄 [면접질문] Hook 리셋');

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        setState({ status: 'idle' });
        setHasCheckedExisting(false);
    }, []);

    return {
        state,
        startStreaming,
        stopStreaming,
        reset,
        // 디버깅용 상태 노출
        debug: {
            hasActiveRequest: !!abortControllerRef.current,
            documentId,
            hasCheckedExisting
        }
    };
} 