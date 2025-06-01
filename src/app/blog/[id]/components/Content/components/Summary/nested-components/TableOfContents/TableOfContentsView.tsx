"use client";

import React, { useEffect } from "react";
import { container, title, orderedList, listItem, linkAnchor, loadingState, errorState } from "./TabOfContentView.css";
import { useToc } from "@/domains/blog/hooks/useToc";

interface TableOfContentsViewProps {
    blogTitle: string;
    blogContent: string;
}

const TableOfContentsComponent: React.FC<TableOfContentsViewProps> = ({
    blogTitle,
    blogContent
}) => {
    const { tocItems, isLoading, error, generateToc } = useToc();

    useEffect(() => {
        if (blogTitle && blogContent) {
            generateToc(blogTitle, blogContent);
        }
    }, [blogTitle, blogContent, generateToc]);

    const generateAnchorId = (tocTitle: string, id: number): string => {
        return `section-${id}`;
    };

    const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, anchorId: string) => {
        e.preventDefault();

        const targetElement = document.getElementById(anchorId);
        if (targetElement) {
            // 상단에 여백을 주기 위해 offsetTop을 계산하여 수동으로 스크롤
            const container = targetElement.closest('[class*="contentSection"]') as HTMLElement;
            if (container) {
                const offsetTop = targetElement.offsetTop - 24; // 24px 여백
                container.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            } else {
                // fallback: 기본 scrollIntoView 사용
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            }
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
                <h2 className={title}>Table of Contents</h2>
                <div className={loadingState}>목차를 불러오는 중...</div>
            </div>
        );
    }

    return (
        <div className={container}>
            <h2 className={title}>Table of Contents</h2>
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