'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { parseMarkdown } from '@/utils/markdownParser';
import { MarkdownPreprocessor } from '@/utils/markdownPreprocessor';
import { ConceptPopup } from '../ConceptPopup/ConceptPopup';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner/LoadingSpinner';
import { useBlogBasicInfo } from '@/domains/blog/providers/BlogBasicInfoProvider';
import { useAnalyzedInfo } from '@/domains/blog/providers/AnalyzedInfoProvider';
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
    const { state: analyzedState } = useAnalyzedInfo();

    const [popupState, setPopupState] = useState<PopupState>({
        isVisible: false,
        keyword: '',
        description: '',
        position: { x: 0, y: 0 }
    });

    // TOC 데이터 변환 (string[] -> TocItem[])
    const tocItems = useMemo(() => {
        if (!analyzedState.toc) return [];
        return analyzedState.toc.map((title, index) => ({
            id: index + 1,
            title
        }));
    }, [analyzedState.toc]);

    // TOC가 생성되면 상위 컴포넌트에 전달
    useEffect(() => {
        if (tocItems.length > 0 && onTocReady) {
            onTocReady(tocItems);
        }
    }, [tocItems, onTocReady]);

    const handleConceptClick = useCallback((keyword: string, event: React.MouseEvent) => {
        event.preventDefault();

        // 키워드 목록에서 해당 키워드의 설명 찾기
        const concept = analyzedState.programming_keywords?.find(k => k.keyword === keyword);

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
    }, [analyzedState.programming_keywords]);

    const handleClosePopup = useCallback(() => {
        setPopupState(prev => ({ ...prev, isVisible: false }));
    }, []);

    // 마크다운 파싱을 메모이제이션
    const parsedContent = useMemo(() => {
        // 스트리밍 중이거나 완료된 상태에서 summary가 있으면 파싱
        if (analyzedState.summary &&
            (analyzedState.fieldStatus.summary === 'loading' || analyzedState.fieldStatus.summary === 'completed')) {

            // 마크다운 전처리 - 유틸리티 클래스 사용
            const preprocessedText = MarkdownPreprocessor.preprocessWithLog(
                analyzedState.summary,
                'SummaryListView'
            );

            // 유효한 키워드 목록 생성 (실제 전달받은 키워드만)
            const validKeywords = analyzedState.programming_keywords?.map(keyword => keyword.keyword) || [];

            return parseMarkdown(preprocessedText, {
                inlineCodeClassName: styles.inlineCode,
                textSpanClassName: styles.textSpan,
                codeBlockClassName: styles.codeBlock,
                blockquoteClassName: styles.blockquote,
                boldClassName: styles.bold,
                italicClassName: styles.italic,
                conceptKeywordClassName: styles.conceptKeyword,
                onConceptClick: handleConceptClick,
                validKeywords: validKeywords, // 유효한 키워드 목록 전달
            });
        }
        return null;
    }, [analyzedState.summary, analyzedState.fieldStatus.summary, analyzedState.programming_keywords, handleConceptClick]);

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

    // 목차가 아직 생성되지 않았으면 아무것도 보여주지 않음
    if (tocItems.length === 0) {
        return <div></div>;
    }

    // 요약이 아직 시작되지 않은 경우에만 로딩 스피너 표시
    if (analyzedState.fieldStatus.summary === 'pending') {
        return (
            <>
                <div className={styles.container}>
                    <LoadingSpinner
                        size="medium"
                        layout="center"
                        message="요약을 생성하고 있습니다..."
                    />
                </div>
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
    }

    // 요약 상태에 따른 렌더링
    const renderContent = () => {
        switch (analyzedState.fieldStatus.summary) {
            case 'loading':
                // 스트리밍 중: 현재까지 받은 내용을 실시간으로 표시
                return (
                    <div className={styles.container}>
                        {parsedContent && (
                            <div>
                                {parsedContent}
                            </div>
                        )}
                        {/* 스트리밍 중에는 항상 로딩 스피너 표시 */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '20px 0'
                        }}>
                            <LoadingSpinner
                                size="medium"
                                layout="center"
                            />
                        </div>
                    </div>
                );

            case 'completed':
                // 완료: 최종 내용 표시
                return (
                    <div className={styles.container}>
                        {parsedContent}
                    </div>
                );

            case 'error':
                return (
                    <div className={styles.errorContainer}>
                        <span className={styles.errorText}>⚠️ 요약 생성 중 오류가 발생했습니다.</span>
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