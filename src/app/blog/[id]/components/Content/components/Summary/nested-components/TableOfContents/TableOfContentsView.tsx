"use client";

import React from "react";
import { container, title, orderedList, listItem, linkAnchor } from "./TabOfContentView.css";
import { SUMMARY_DATA, generateAnchorId } from "../../types/summaryItemEntity";

const TableOfContentsComponent = () => {
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

    return (
        <div className={container}>
            <h2 className={title}>Table of Contents</h2>
            <ol className={orderedList}>
                {SUMMARY_DATA.map((item) => {
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