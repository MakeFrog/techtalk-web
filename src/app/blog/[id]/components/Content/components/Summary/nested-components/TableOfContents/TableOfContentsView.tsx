"use client";

import React, { useMemo } from "react";
import { container, title, orderedList, listItem, linkAnchor, loadingState, errorState } from "./TabOfContentView.css";
import type { TocItem } from "../../types/tocTypes";

// 상수로 매직 스트링 제거 (응집도 향상)
const TOC_CONSTANTS = {
    TITLE: '목차',
    MESSAGES: {
        LOADING: '목차를 생성하고 있습니다...',
        EMPTY_LOADING: '목차를 불러오는 중...',
        ERROR_PREFIX: '오류: '
    }
} as const;

interface TableOfContentsViewProps {
    tocItems?: TocItem[];
    isLoading?: boolean;
    error?: string;
}

// 앵커 생성 로직 분리 (단일 책임)
const createAnchorId = (id: number): string => {
    return `section-${id}`;
};

// 스크롤 이동 로직 분리 (단일 책임)
const scrollToAnchor = (anchorId: string): void => {
    // 브라우저 환경 체크
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
    }

    const targetElement = document.getElementById(anchorId);

    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
        });
    } else {
        console.warn(`⚠️ [TOC] 앵커 요소를 찾을 수 없습니다: ${anchorId}`);
    }
};

// 로딩 상태 컴포넌트 분리 (조건부 렌더링 개선)
const TocLoadingContent: React.FC = React.memo(() => (
    <div className={loadingState}>{TOC_CONSTANTS.MESSAGES.LOADING}</div>
));

// 에러 상태 컴포넌트 분리
const TocErrorContent: React.FC<{ error: string }> = React.memo(({ error }) => (
    <div className={errorState}>{TOC_CONSTANTS.MESSAGES.ERROR_PREFIX}{error}</div>
));

// 빈 상태 컴포넌트 분리
const TocEmptyContent: React.FC = React.memo(() => (
    <div className={loadingState}>{TOC_CONSTANTS.MESSAGES.EMPTY_LOADING}</div>
));

// TOC 아이템 컴포넌트 분리 (결합도 감소)
const TocItemComponent: React.FC<{ item: TocItem }> = React.memo(({ item }) => {
    const anchorId = createAnchorId(item.id);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        scrollToAnchor(anchorId);
    };

    return (
        <li className={listItem}>
            <a
                href={`#${anchorId}`}
                className={linkAnchor}
                onClick={handleClick}
            >
                {item.title}
            </a>
        </li>
    );
});

// TOC 리스트 컴포넌트 분리
const TocListContent: React.FC<{ tocItems: TocItem[] }> = React.memo(({ tocItems }) => (
    <ol className={orderedList}>
        {tocItems.map((item) => (
            <TocItemComponent key={item.id} item={item} />
        ))}
    </ol>
));

// 메인 컴포넌트 - 상태에 따른 내용 결정 로직만 담당
const TableOfContentsComponent: React.FC<TableOfContentsViewProps> = ({
    tocItems = [],
    isLoading = false,
    error
}) => {
    // 조건부 렌더링 로직을 명확한 함수로 분리 (가독성 향상)
    const renderTocContent = useMemo(() => {
        if (isLoading) {
            return <TocLoadingContent />;
        }

        if (error) {
            return <TocErrorContent error={error} />;
        }

        if (tocItems.length === 0) {
            return <TocEmptyContent />;
        }

        return <TocListContent tocItems={tocItems} />;
    }, [tocItems, isLoading, error]);

    return (
        <div className={container}>
            {/* 제목은 한 번만 렌더링 - 중복 제거 */}
            <h2 className={title}>{TOC_CONSTANTS.TITLE}</h2>
            {/* 상태별 내용만 조건부 렌더링 */}
            {renderTocContent}
        </div>
    );
};

// React.memo로 컴포넌트 메모이제이션 - 불필요한 리렌더링 방지
export const TableOfContentsView = React.memo(TableOfContentsComponent);    