import React, { useMemo, useState } from "react";
import { parseMarkdownWithPreset } from '@/utils/markdownParser';
import { Question } from "@/domains/blog/hooks/useQuestionStream";
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';
import {
    orderedList,
    listItem,
    questionHeader,
    questionContent,
    questionNumber,
    answerContainer,
    answerExpanded,
    answerContent,
    answerContentExpanded,
    answerLabel,
    answerText,
    loadingContainer,
    errorContainer,
    emptyContainer
} from "./QuestionListView.css";

// 개별 질문 아이템 컴포넌트 - 클릭 시 답변 토글
interface QuestionItemProps {
    question: Question;
    index: number;
}

const QuestionItem = React.memo(function QuestionItem({ question, index }: QuestionItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // 답변이 있는지 확인
    const hasAnswer = question.answer && question.answer.trim().length > 0;

    // 질문과 답변 마크다운 파싱
    const parsedQuestion = useMemo(() => {
        return parseMarkdownWithPreset(question.question, 'question');
    }, [question.question]);

    const parsedAnswer = useMemo(() => {
        if (!hasAnswer) return null;
        return parseMarkdownWithPreset(question.answer, 'comment', {
            inlineCodeClassName: 'answer-inline-code',
            textSpanClassName: 'answer-text-span',
            boldClassName: 'answer-bold',
            italicClassName: 'answer-italic',
        });
    }, [question.answer, hasAnswer]);

    const handleToggle = () => {
        if (hasAnswer) {
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <li className={listItem}>
            {/* 질문 헤더 - 답변이 있을 때만 클릭 가능 */}
            <div
                className={questionHeader}
                onClick={handleToggle}
                style={{
                    cursor: hasAnswer ? 'pointer' : 'default',
                }}
            >
                <span className={questionNumber}>{index + 1}</span>
                <div className={questionContent}>
                    {parsedQuestion}
                </div>
            </div>

            {/* 답변 영역 (항상 렌더링하되 CSS로 애니메이션 제어) */}
            {hasAnswer && (
                <div className={`${answerContainer} ${isExpanded ? answerExpanded : ''}`}>
                    <div className={`${answerContent} ${isExpanded ? answerContentExpanded : ''}`}>
                        <span className={answerLabel}>💡 모범 답변</span>
                        <div className={answerText}>
                            {parsedAnswer}
                        </div>
                    </div>
                </div>
            )}
        </li>
    );
});

// 추가 로딩 컴포넌트 (스트림 중일 때 표시)
const AdditionalLoadingItem = React.memo(function AdditionalLoadingItem() {
    return (
        <li className={listItem}>
            <div className={questionHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <LoadingSpinner size="small" layout="inline" />
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>
                        질문을 생성하고 있습니다...
                    </span>
                </div>
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
 * 면접 질문 리스트를 표시하는 컴포넌트 (클릭 가능한 답변 토글 버전)
 * 
 * 기능:
 * - 질문을 하나씩 실시간으로 표시
 * - 질문 클릭 시 모범 답변 토글 (세련된 애니메이션)
 * - 마크다운 파싱을 통한 질문/답변 포맷팅
 * - 로딩 상태 및 에러 처리
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
            answerPreview: q.answer.substring(0, 30) + '...',
            questionLength: q.question.length,
            answerLength: q.answer.length
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
                    key={`question-${index}-${question.question.substring(0, 20)}`}
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