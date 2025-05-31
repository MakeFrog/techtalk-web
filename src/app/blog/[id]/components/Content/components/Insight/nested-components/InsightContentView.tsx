import React, { useEffect, useState, useMemo } from 'react';
import { parseMarkdownWithPreset } from '@/utils/markdownParser';
import { InsightStreamState } from '@/domains/blog/hooks/useInsightStream';
import * as styles from './InsightContentView.css';

// 즉시 표시 Hook (딜레이 없음)
function useInstantDisplay(content: string, isCompleted: boolean) {
    const [displayedContent, setDisplayedContent] = useState('');

    useEffect(() => {
        if (!content) {
            setDisplayedContent('');
            return;
        }

        // 완료된 상태든 스트리밍 중이든 받은 즉시 표시 (딜레이 없음)
        setDisplayedContent(content);
    }, [content, isCompleted]);

    return { displayedContent };
}

// 에러 메시지 컴포넌트
const ErrorMessage = React.memo(function ErrorMessage({ message }: { message: string }) {
    return (
        <div className={styles.errorContainer}>
            <span className={styles.errorIcon}>⚠️</span>
            <p className={styles.errorText}>{message}</p>
        </div>
    );
});

// 빈 상태 컴포넌트
const EmptyState = React.memo(function EmptyState() {
    return (
        <div className={styles.emptyContainer}>
            <span className={styles.emptyIcon}>💭</span>
            <p className={styles.emptyText}>인사이트를 분석 중입니다...</p>
        </div>
    );
});

interface InsightContentViewProps {
    streamState: InsightStreamState;
}

/**
 * 인사이트 내용을 즉시 표시하는 컴포넌트
 * 개선된 마크다운 파싱으로 볼드, 이탤릭, 코드 등을 정확히 렌더링
 */
export function InsightContentView({ streamState }: InsightContentViewProps) {
    const content = streamState.status === 'streaming' || streamState.status === 'completed'
        ? streamState.content
        : '';

    const isCompleted = streamState.status === 'completed';

    const { displayedContent } = useInstantDisplay(content, isCompleted);

    // 프리셋을 사용한 마크다운 파싱을 메모이제이션하여 성능 최적화
    const parsedContent = useMemo(() => {
        if (!displayedContent) return null;

        return parseMarkdownWithPreset(displayedContent, 'insight');
    }, [displayedContent]);

    switch (streamState.status) {
        case 'idle':
        case 'loading':
            return <EmptyState />;

        case 'streaming':
        case 'completed':
            if (displayedContent) {
                return (
                    <div className={styles.contentContainer}>
                        <div className={styles.contentText}>
                            {parsedContent}
                        </div>
                    </div>
                );
            } else {
                return <EmptyState />;
            }

        case 'error':
            return <ErrorMessage message={streamState.message} />;

        default:
            return <EmptyState />;
    }
} 