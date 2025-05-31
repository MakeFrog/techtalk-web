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

interface QuestionListViewProps {
    questions: Question[];
    isLoading: boolean;
    error: string | null;
}

/**
 * 면접 질문 리스트를 표시하는 컴포넌트
 * 질문만 표시하고 답변은 숨김 (데이터는 유지하여 추후 기능 확장 가능)
 */
export function QuestionListView({ questions, isLoading, error }: QuestionListViewProps) {
    if (error) {
        return (
            <div className={errorContainer}>
                오류가 발생했습니다: {error}
            </div>
        );
    }

    if (isLoading) {
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

    if (questions.length === 0) {
        return (
            <div className={emptyContainer}>
                아직 생성된 질문이 없습니다.
            </div>
        );
    }

    return (
        <ol className={orderedList}>
            {questions.map((question, index) => (
                <QuestionItem
                    key={`question-${index}`}
                    question={question}
                    index={index}
                />
            ))}
        </ol>
    );
} 