import React, { useMemo } from "react";
import { parseMarkdownWithPreset } from '@/utils/markdownParser';
import { orderedList, listItem, questionContent, questionNumber } from "./QuestionListView.css.ts";

// 목 데이터 - 정적 면접 질문들 (마크다운 지원)
const MOCK_QUESTIONS = [
    "React의 `useEffect` Hook의 의존성 배열은 어떤 역할을 하나요?",
    "**Next.js**에서 `SSR`과 `SSG`의 차이점은 무엇인가요?",
    "TypeScript의 **타입 가드(Type Guard)**는 언제 사용하나요?",
    "React의 메모이제이션 기법들(`useMemo`, `useCallback`, `React.memo`)은 언제 사용해야 하나요?",
    "**Virtual DOM**과 실제 DOM의 차이점과 React가 Virtual DOM을 사용하는 이유는 무엇인가요?"
];

// 개별 질문 아이템 컴포넌트
interface QuestionItemProps {
    question: string;
    index: number;
}

const QuestionItem = React.memo(function QuestionItem({ question, index }: QuestionItemProps) {
    // 프리셋을 사용한 마크다운 파싱을 메모이제이션하여 성능 최적화
    const parsedQuestion = useMemo(() => {
        return parseMarkdownWithPreset(question, 'question');
    }, [question]);

    return (
        <li className={listItem}>
            <span className={questionNumber}>{index + 1}</span>
            <div className={questionContent}>
                {parsedQuestion}
            </div>
        </li>
    );
});

/**
 * 면접 질문 리스트를 표시하는 컴포넌트 (정적 버전)
 * 개선된 마크다운 파싱으로 코드나 강조 표시가 정확히 렌더링
 */
export function QuestionListView() {
    return (
        <ol className={orderedList}>
            {MOCK_QUESTIONS.map((question, index) => (
                <QuestionItem
                    key={`question-${index}`}
                    question={question}
                    index={index}
                />
            ))}
        </ol>
    );
} 