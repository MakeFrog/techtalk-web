import React, { useMemo } from "react";
import { parseMarkdownWithPreset } from '@/utils/markdownParser';
import { Question } from "@/domains/blog/hooks/useQuestionStream";
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';
import {
    orderedList,
    listItem,
    questionContent,
    questionNumber,
    loadingContainer,
    errorContainer,
    emptyContainer
} from "./QuestionListView.css";

// 개별 질문 아이템 컴포넌트 - 질문만 표시 (답변은 숨김)
interface QuestionItemProps {
    question: Question;
    index: number;
}

const QuestionItem = React.memo(function QuestionItem({ question, index }: QuestionItemProps) {
    // 질문 마크다운 파싱
    const parsedQuestion = useMemo(() => {
        return parseMarkdownWithPreset(question.question, 'question');
    }, [question.question]);

    return (
        <li className={listItem}>
            <span className={questionNumber}>{index + 1}</span>
            <div className={questionContent}>
                {parsedQuestion}
            </div>
        </li>
    );
});

// 추가 로딩 컴포넌트 (스트림 중일 때 표시)
const AdditionalLoadingItem = React.memo(function AdditionalLoadingItem() {
    return (
        <li className={listItem} style={{ opacity: 0.7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LoadingSpinner size="small" layout="inline" />
                <span style={{ color: '#6b7280', fontSize: '14px' }}>
                    질문을 생성하고 있습니다...
                </span>
            </div>
        </li>
    );
});

interface QuestionListViewProps {
    questions: Question[];
    isLoading: boolean;
    error: string | null;
}

/**
 * 면접 질문 리스트를 표시하는 컴포넌트 (스트림 버전)
 * 질문을 하나씩 실시간으로 표시하고, 로딩 중일 때 추가 스피너 표시
 * 답변은 숨기고 질문만 표시 (데이터는 유지하여 추후 기능 확장 가능)
 */
export function QuestionListView({ questions, isLoading, error }: QuestionListViewProps) {
    // 디버깅용 로그
    console.log('🎯 [QuestionListView] 렌더링:', {
        questionCount: questions.length,
        isLoading,
        error,
        questionsPreview: questions.map((q, i) => ({
            index: i,
            questionPreview: q.question.substring(0, 30) + '...',
            questionLength: q.question.length
        }))
    });

    if (error) {
        return (
            <div className={errorContainer}>
                오류가 발생했습니다: {error}
            </div>
        );
    }

    // 완전히 로딩 중이고 질문이 하나도 없을 때
    if (isLoading && questions.length === 0) {
        return (
            <div className={loadingContainer}>
                <LoadingSpinner
                    size="medium"
                    layout="center"
                    message="면접 질문을 생성하고 있습니다..."
                />
            </div>
        );
    }

    // 질문이 없고 로딩도 아닐 때
    if (questions.length === 0 && !isLoading) {
        return (
            <LoadingSpinner
                size="medium"
                layout="center"
                message="면접 질문을 생성하고 있습니다..."
            />
        );
    }

    // 중복 제거된 고유 질문만 표시
    const uniqueQuestions = useMemo(() => {
        const seen = new Set<string>();
        const unique = questions.filter(question => {
            const key = question.question.trim();
            if (seen.has(key)) {
                console.warn('⚠️ [QuestionListView] 중복 질문 제거:', key.substring(0, 50) + '...');
                return false;
            }
            seen.add(key);
            return true;
        });

        console.log('🔍 [QuestionListView] 중복 제거 결과:', {
            original: questions.length,
            unique: unique.length,
            duplicatesRemoved: questions.length - unique.length
        });

        return unique;
    }, [questions]);

    // 질문이 있을 때 (스트림 중이든 아니든)
    return (
        <ol className={orderedList}>
            {/* 생성된 질문들 표시 */}
            {uniqueQuestions.map((question, index) => (
                <QuestionItem
                    key={`question-${index}-${question.question.substring(0, 20)}`} // 더 고유한 키
                    question={question}
                    index={index}
                />
            ))}

            {/* 추가 질문을 기다리는 중일 때 로딩 표시 */}
            {isLoading && uniqueQuestions.length > 0 && (
                <AdditionalLoadingItem />
            )}
        </ol>
    );
} 