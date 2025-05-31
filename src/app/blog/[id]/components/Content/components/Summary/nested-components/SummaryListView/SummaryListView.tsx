'use client';

import React, { useState } from 'react';
import { parseMarkdown } from '@/utils/markdownParser';
import { SUMMARY_DATA, SummaryItemEntity, generateAnchorId } from '../../types/summaryItemEntity';
import { MOCK_BLOG_DATA, ProgrammingConcept } from '../../types/mockData';
import { ConceptPopup } from '../ConceptPopup/ConceptPopup';
import * as styles from './SummaryListView.css';

interface SummaryListItemProps {
    content: string;
    concepts: ProgrammingConcept[];
    onConceptClick: (keyword: string, event: React.MouseEvent) => void;
}

interface PopupState {
    isVisible: boolean;
    keyword: string;
    description: string;
    position: { x: number; y: number };
}

// 인용문으로 시작하는지 확인하는 유틸 함수
const isBlockquoteContent = (content: string): boolean => {
    return content.trim().startsWith('>');
};

// 개별 리스트 아이템 컴포넌트 - 메모이제이션으로 최적화
const SummaryListItem = React.memo(({ content, concepts, onConceptClick }: SummaryListItemProps) => {
    const isQuote = isBlockquoteContent(content);

    return (
        <li className={isQuote ? styles.listItemNoBullet : styles.listItem}>
            {parseMarkdown(content, {
                inlineCodeClassName: styles.inlineCode,
                textSpanClassName: styles.textSpan,
                codeBlockClassName: styles.codeBlock,
                blockquoteClassName: styles.blockquote,
                boldClassName: styles.bold,
                italicClassName: styles.italic,
                conceptKeywordClassName: styles.conceptKeyword,
                onConceptClick,
            })}
        </li>
    );
});

SummaryListItem.displayName = 'SummaryListItem';

// 개별 섹션 컴포넌트 - 메모이제이션으로 최적화
const SummaryItemComponent = React.memo(({
    item,
    concepts,
    onConceptClick
}: {
    item: SummaryItemEntity;
    concepts: ProgrammingConcept[];
    onConceptClick: (keyword: string, event: React.MouseEvent) => void;
}) => {
    return (
        <section id={generateAnchorId(item.title, item.id)} className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>
                {item.id}. {item.title}
            </h2>
            <ul className={styles.bulletList}>
                {item.content.map((paragraph, idx) => (
                    <SummaryListItem
                        key={idx}
                        content={paragraph}
                        concepts={concepts}
                        onConceptClick={onConceptClick}
                    />
                ))}
            </ul>
        </section>
    );
});

SummaryItemComponent.displayName = 'SummaryItem';

const SummaryListViewComponent = () => {
    const [popupState, setPopupState] = useState<PopupState>({
        isVisible: false,
        keyword: '',
        description: '',
        position: { x: 0, y: 0 }
    });

    const handleConceptClick = (keyword: string, event: React.MouseEvent) => {
        event.preventDefault();

        // 해당 키워드의 설명 찾기
        const concept = MOCK_BLOG_DATA.programming_concepts.find(
            concept => concept.keyword === keyword
        );

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
    };

    const handleClosePopup = () => {
        setPopupState(prev => ({ ...prev, isVisible: false }));
    };

    return (
        <>
            <div className={styles.container}>
                {SUMMARY_DATA.map((item) => (
                    <SummaryItemComponent
                        key={item.id}
                        item={item}
                        concepts={MOCK_BLOG_DATA.programming_concepts}
                        onConceptClick={handleConceptClick}
                    />
                ))}
            </div>

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