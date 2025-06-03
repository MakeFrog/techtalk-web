"use client";

import React from "react";
import { container, title, orderedList, listItem, linkAnchor, loadingState, errorState } from "./TabOfContentView.css";
import { TocItem } from "../../types/tocTypes";

interface TableOfContentsViewProps {
    tocItems?: TocItem[];
    isLoading?: boolean;
    error?: string;
}

const TableOfContentsComponent: React.FC<TableOfContentsViewProps> = ({
    tocItems = [],
    isLoading = false,
    error
}) => {
    const generateAnchorId = (tocTitle: string, id: number): string => {
        return `section-${id}`;
    };

    const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, anchorId: string) => {
        e.preventDefault();

        // 브라우저 환경에서만 실행
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

    if (isLoading) {
        return (
            <div className={container}>
                <h2 className={title}>Table of Contents</h2>
                <div className={loadingState}>목차를 생성하고 있습니다...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={container}>
                <h2 className={title}>Table of Contents</h2>
                <div className={errorState}>오류: {error}</div>
            </div>
        );
    }

    if (tocItems.length === 0) {
        return (
            <div className={container}>
                <h2 className={title}>목차</h2>
                <div className={loadingState}>목차를 불러오는 중...</div>
            </div>
        );
    }

    return (
        <div className={container}>
            <h2 className={title}>목차</h2>
            <ol className={orderedList}>
                {tocItems.map((item) => {
                    const anchorId = generateAnchorId(item.title, item.id);
                    return (
                        <li key={item.id} className={listItem}>
                            <a
                                href={`#${anchorId}`}
                                className={linkAnchor}
                                onClick={(e) => handleAnchorClick(e, anchorId)}
                            >
                                {item.title}
                            </a>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

// React.memo로 컴포넌트 메모이제이션 - 불필요한 리렌더링 방지
export const TableOfContentsView = React.memo(TableOfContentsComponent);    