'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { parseMarkdown } from '@/utils/markdownParser';
import { ConceptPopup } from '../ConceptPopup/ConceptPopup';
import { useBlogBasicInfo } from '@/domains/blog/providers/BlogBasicInfoProvider';
import { useToc } from '@/domains/blog/hooks/useToc';
import { useKeywords } from '@/domains/blog/hooks/useKeywords';
import { useSummaryStream } from '@/domains/blog/hooks/useSummaryStream';
import { TocItem } from '../../types/tocTypes';
import * as styles from './SummaryListView.css';

interface PopupState {
    isVisible: boolean;
    keyword: string;
    description: string;
    position: { x: number; y: number };
}

interface SummaryListViewProps {
    onTocReady?: (tocItems: TocItem[]) => void;
}

const SummaryListViewComponent: React.FC<SummaryListViewProps> = ({ onTocReady }) => {
    const { state: blogState } = useBlogBasicInfo();
    const { tocItems, generateToc } = useToc();
    const { keywords, extractKeywords } = useKeywords();
    const { state: summaryState, startStreaming, reset } = useSummaryStream();

    const [popupState, setPopupState] = useState<PopupState>({
        isVisible: false,
        keyword: '',
        description: '',
        position: { x: 0, y: 0 }
    });

    const [isDataReady, setIsDataReady] = useState(false);
    const [hasStartedSummary, setHasStartedSummary] = useState(false);

    // 전체 요약 생성 함수
    const handleGenerateFullSummary = useCallback(async () => {
        if (blogState.status !== 'success') return;

        reset(); // 이전 스트림 상태 초기화

        await startStreaming({
            title: blogState.data.title,
            text: blogState.data.content,
            toc: tocItems,
            keywords
        });
    }, [blogState, reset, startStreaming, tocItems, keywords]);

    // 블로그 데이터가 로드되면 TOC 생성
    useEffect(() => {
        if (blogState.status === 'success' && tocItems.length === 0) {
            generateToc(blogState.data.title, blogState.data.content);
        }
    }, [blogState, tocItems.length, generateToc]);

    // TOC가 생성되면 상위 컴포넌트에 전달
    useEffect(() => {
        if (tocItems.length > 0 && onTocReady) {
            onTocReady(tocItems);
        }
    }, [tocItems, onTocReady]);

    // 블로그 데이터가 로드되면 키워드 추출
    useEffect(() => {
        if (blogState.status === 'success' && keywords.length === 0) {
            extractKeywords(blogState.data.title, blogState.data.content);
        }
    }, [blogState, keywords.length, extractKeywords]);

    // TOC와 키워드가 모두 준비되었는지 확인
    useEffect(() => {
        if (tocItems.length > 0 && keywords.length > 0 && !isDataReady) {
            setIsDataReady(true);
        }
    }, [tocItems.length, keywords.length, isDataReady]);

    // 데이터가 준비되면 자동으로 전체 요약 생성 시작
    useEffect(() => {
        if (isDataReady && blogState.status === 'success' && !hasStartedSummary) {
            setHasStartedSummary(true);
            handleGenerateFullSummary();
        }
    }, [isDataReady, blogState.status, hasStartedSummary, handleGenerateFullSummary]);

    const handleConceptClick = useCallback((keyword: string, event: React.MouseEvent) => {
        event.preventDefault();

        // 키워드 목록에서 해당 키워드의 설명 찾기
        const concept = keywords.find(k => k.keyword === keyword);

        if (concept) {
            setPopupState({
                isVisible: true,
                keyword: concept.keyword,
                description: concept.description,
                position: {
                    x: event.clientX,
                    y: event.clientY
                }
            });
        }
    }, [keywords]);

    const handleClosePopup = useCallback(() => {
        setPopupState(prev => ({ ...prev, isVisible: false }));
    }, []);

    // 마크다운 파싱을 메모이제이션
    const parsedContent = useMemo(() => {
        if (summaryState.status === 'streaming' || summaryState.status === 'completed') {
            return parseMarkdown(summaryState.content, {
                inlineCodeClassName: styles.inlineCode,
                textSpanClassName: styles.textSpan,
                codeBlockClassName: styles.codeBlock,
                blockquoteClassName: styles.blockquote,
                boldClassName: styles.bold,
                italicClassName: styles.italic,
                conceptKeywordClassName: styles.conceptKeyword,
                onConceptClick: handleConceptClick,
            });
        }
        return null;
    }, [summaryState, handleConceptClick]);

    // 블로그 데이터 로딩 중이거나 에러인 경우
    if (blogState.status === 'loading') {
        return <div></div>; // 백그라운드 로딩, UI에 표시하지 않음
    }

    if (blogState.status === 'error') {
        return (
            <div className={styles.container}>
                <div className={styles.errorContainer}>
                    <span className={styles.errorText}>⚠️ 블로그 데이터를 불러오는데 실패했습니다.</span>
                </div>
            </div>
        );
    }

    // 데이터 준비 중이면 빈 화면
    if (!isDataReady) {
        return <div></div>;
    }

    // 요약 상태에 따른 렌더링
    const renderContent = () => {
        switch (summaryState.status) {
            case 'idle':
            case 'loading':
                return (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner}></div>
                        <span>전체 요약을 생성하고 있습니다...</span>
                    </div>
                );

            case 'streaming':
            case 'completed':
                return (
                    <div className={styles.container}>
                        {parsedContent}
                    </div>
                );

            case 'error':
                return (
                    <div className={styles.errorContainer}>
                        <span className={styles.errorText}>⚠️ {summaryState.message}</span>
                        <button
                            className={styles.retryButton}
                            onClick={handleGenerateFullSummary}
                        >
                            다시 시도
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            {renderContent()}

            {/* 팝업 */}
            {popupState.isVisible && (
                <ConceptPopup
                    keyword={popupState.keyword}
                    description={popupState.description}
                    position={popupState.position}
                    onClose={handleClosePopup}
                />
            )}
        </>
    );
};

// React.memo로 컴포넌트 메모이제이션 - 불필요한 리렌더링 방지
export const SummaryListView = React.memo(SummaryListViewComponent);