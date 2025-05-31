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
        console.log('🚀 [useQuestionStream] 질문 생성 시작');

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
                const errorData = await response.json();
                throw new Error(errorData.details || `API 요청 실패: ${response.status}`);
            }

            const data = await response.json();
            console.log('📨 [useQuestionStream] 응답 데이터:', data);

            // qnas 배열 추출
            if (data.qnas && Array.isArray(data.qnas)) {
                const validQuestions = data.qnas.filter(
                    (item: any) => item.question && item.answer
                );

                console.log('✅ [useQuestionStream] 유효한 질문들:', validQuestions.length);
                setQuestions(validQuestions);
            } else {
                console.warn('⚠️ [useQuestionStream] qnas 배열을 찾을 수 없습니다:', data);
                setQuestions([]);
            }

        } catch (err) {
            console.error('❌ [useQuestionStream] 오류:', err);
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
        } finally {
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