import React from 'react';
import { parseMarkdown } from '@/utils/markdownParser';
import { SUMMARY_DATA, SummaryItemEntity, generateAnchorId } from '../../types/summaryItemEntity';
import * as styles from './SummaryListView.css';

interface SummaryListItemProps {
    content: string;
}

// 인용문으로 시작하는지 확인하는 유틸 함수
const isBlockquoteContent = (content: string): boolean => {
    return content.trim().startsWith('>');
};

// 개별 리스트 아이템 컴포넌트 - 메모이제이션으로 최적화
const SummaryListItem = React.memo(({ content }: SummaryListItemProps) => {
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
            })}
        </li>
    );
});

SummaryListItem.displayName = 'SummaryListItem';

// 개별 섹션 컴포넌트 - 메모이제이션으로 최적화
const SummaryItemComponent = React.memo(({ item }: { item: SummaryItemEntity }) => {
    return (
        <section id={generateAnchorId(item.title, item.id)} className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>
                {item.id}. {item.title}
            </h2>
            <ul className={styles.bulletList}>
                {item.content.map((paragraph, idx) => (
                    <SummaryListItem key={idx} content={paragraph} />
                ))}
            </ul>
        </section>
    );
});

SummaryItemComponent.displayName = 'SummaryItem';

const SummaryListViewComponent = () => {
    return (
        <div className={styles.container}>
            {SUMMARY_DATA.map((item) => (
                <SummaryItemComponent key={item.id} item={item} />
            ))}
        </div>
    );
};

// React.memo로 컴포넌트 메모이제이션 - 불필요한 리렌더링 방지
export const SummaryListView = React.memo(SummaryListViewComponent);