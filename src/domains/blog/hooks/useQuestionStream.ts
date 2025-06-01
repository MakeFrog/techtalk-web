import { useState, useCallback } from 'react';

export interface Question {
    question: string;
    answer: string;
}

interface UseQuestionStreamReturn {
    questions: Question[];
    isLoading: boolean;
    error: string | null;
    generateQuestions: (title: string, content: string) => Promise<void>;
    reset: () => void;
}

export function useQuestionStream(): UseQuestionStreamReturn {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reset = useCallback(() => {
        setQuestions([]);
        setIsLoading(false);
        setError(null);
    }, []);

    const generateQuestions = useCallback(async (title: string, content: string) => {
        console.log('🚀 [useQuestionStream] 스트림 질문 생성 시작');

        setIsLoading(true);
        setError(null);
        setQuestions([]);

        try {
            const response = await fetch('/api/blog/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content }),
            });

            if (!response.ok) {
                // 429 에러 특별 처리
                if (response.status === 429) {
                    throw new Error('API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
                }
                throw new Error(`API 요청 실패: ${response.status}`);
            }

            if (!response.body) {
                throw new Error('응답 본문이 없습니다');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let questionCount = 0;
            const processedQuestions = new Set<string>(); // 중복 방지

            console.log('🔄 [useQuestionStream] 스트림 처리 시작');

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    console.log('✅ [useQuestionStream] 스트림 완료');
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                console.log('📨 [useQuestionStream] 스트림 데이터 수신:', { bufferLength: buffer.length });

                // SSE 형식으로 파싱
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // 마지막 불완전한 줄은 버퍼에 유지

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6); // 'data: ' 제거

                        if (dataStr === '[DONE]') {
                            console.log('🏁 [useQuestionStream] 스트림 종료 신호 수신');
                            break;
                        }

                        try {
                            const data = JSON.parse(dataStr);

                            // 에러 처리
                            if (data.error) {
                                console.error('❌ [useQuestionStream] 서버 에러:', data.error);
                                setError(data.error);
                                break;
                            }

                            // 중복 질문 방지
                            const questionKey = `${data.question}_${data.answer}`;
                            if (!processedQuestions.has(questionKey)) {
                                processedQuestions.add(questionKey);
                                questionCount++;

                                console.log(`✨ [useQuestionStream] ${questionCount}번째 질문 수신:`, {
                                    question: data.question?.substring(0, 50) + '...',
                                    answer: data.answer?.substring(0, 30) + '...'
                                });

                                setQuestions(prev => [...prev, data]);
                            } else {
                                console.log('⏭️ [useQuestionStream] 중복 질문 건너뛰기');
                            }
                        } catch (parseError) {
                            console.warn('⚠️ [useQuestionStream] JSON 파싱 실패:', {
                                data: dataStr.substring(0, 100),
                                error: parseError
                            });
                        }
                    }
                }
            }

            console.log(`🎯 [useQuestionStream] 총 ${questionCount}개 질문 처리 완료`);

        } catch (error: any) {
            console.error('❌ [useQuestionStream] 스트림 오류:', error);

            // 429 에러에 대한 사용자 친화적 메시지
            if (error.message.includes('API 요청 한도')) {
                setError('🚫 API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
            } else if (error.message.includes('429')) {
                setError('🚫 너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.');
            } else {
                setError(error instanceof Error ? error.message : '질문 생성에 실패했습니다.');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        questions,
        isLoading,
        error,
        generateQuestions,
        reset
    };
} 