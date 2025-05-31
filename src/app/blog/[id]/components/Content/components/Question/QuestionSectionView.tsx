'use client';

import { Gap } from "@/components/gap/Gap";
import { EmojiPrefixedTitle } from "@/components/text/EmojiPrefixedTitle/EmojiPrefixedTitle";
import { QuestionListView } from "./nested-components/QuestionListView";
import { useQuestionStream } from "@/domains/blog/hooks/useQuestionStream";
import { useBlogBasicInfo } from "@/domains/blog/providers/BlogBasicInfoProvider";
import { useEffect } from "react";

/**
 * 질문 섹션 컴포넌트 (데이터 연동 버전)
 * 기술 블로그 제목과 내용을 기반으로 면접 질문을 생성하여 표시
 * 답변은 숨기고 질문만 표시
 */
export function QuestionSectionView() {
    const { state } = useBlogBasicInfo();
    const { questions, isLoading, error, generateQuestions } = useQuestionStream();

    // BlogBasicInfoProvider에서 제목과 내용이 로드되면 질문 생성 시작
    useEffect(() => {
        if (state.status === 'success' && questions.length === 0 && !isLoading) {
            const { title, content } = state.data;
            console.log('🚀 [QuestionSectionView] 질문 생성 시작:', {
                hasQuestions: questions.length > 0,
                isLoading,
                title: title.substring(0, 50) + '...'
            });
            generateQuestions(title, content);
        }
    }, [state, questions.length, isLoading]);

    return (
        <div style={{
            paddingTop: questions.length > 0 ? '12px' : '0',
            paddingBottom: questions.length > 0 || isLoading ? '20px' : '0',
        }}>
            <EmojiPrefixedTitle emoji="❓" title="답변할 수 있나요?" />
            <Gap size={12} />
            <QuestionListView
                questions={questions}
                isLoading={isLoading}
                error={error}
            />
        </div>
    );
}               