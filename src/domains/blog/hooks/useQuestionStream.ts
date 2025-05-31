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
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                console.log('📥 [useQuestionStream] 수신된 라인들:', {
                    lineCount: lines.length,
                    bufferLength: buffer.length
                });

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);

                        if (data === '[DONE]') {
                            console.log('🏁 [useQuestionStream] 스트림 종료 신호');
                            setIsLoading(false);
                            break;
                        }

                        try {
                            const questionData = JSON.parse(data);

                            if (questionData.question && questionData.answer) {
                                // 중복 질문 체크 (질문 텍스트 기준)
                                const questionKey = questionData.question.trim();
                                if (processedQuestions.has(questionKey)) {
                                    console.log('⏭️ [useQuestionStream] 중복 질문 건너뛰기:',
                                        questionKey.substring(0, 50) + '...');
                                    continue;
                                }

                                questionCount++;
                                processedQuestions.add(questionKey);

                                console.log(`✨ [useQuestionStream] ${questionCount}번째 새 질문 추가:`, {
                                    question: questionData.question.substring(0, 50) + '...',
                                    answer: questionData.answer.substring(0, 30) + '...',
                                    totalQuestions: questionCount
                                });

                                // 새 질문을 기존 질문 목록에 추가
                                setQuestions(prev => {
                                    const newQuestions = [...prev, questionData];
                                    console.log('📝 [useQuestionStream] 상태 업데이트:', {
                                        previousCount: prev.length,
                                        newCount: newQuestions.length
                                    });
                                    return newQuestions;
                                });
                            } else {
                                console.warn('⚠️ [useQuestionStream] 질문 데이터 형식 오류:', questionData);
                            }
                        } catch (parseError) {
                            console.warn('⚠️ [useQuestionStream] 데이터 파싱 실패:', {
                                data: data.substring(0, 100),
                                error: parseError instanceof Error ? parseError.message : parseError
                            });
                        }
                    }
                }
            }

            console.log(`🎯 [useQuestionStream] 최종 결과: ${questionCount}개 질문 생성`);

        } catch (err) {
            console.error('❌ [useQuestionStream] 오류:', err);
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
            setIsLoading(false);
        }
    }, []);

    return {
        questions,
        isLoading,
        error,
        generateQuestions,
        reset,
    };
} 