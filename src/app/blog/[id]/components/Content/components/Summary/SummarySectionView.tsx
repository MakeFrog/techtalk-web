"use client";

import { Gap } from "@/components/gap/Gap";
import { TableOfContentsView } from "./nested-components/TableOfContents/TableOfContentsView";
import { SummaryListView } from "./nested-components/SummaryListView/SummaryListView";
import { useBlogBasicInfo } from "@/domains/blog/providers/BlogBasicInfoProvider";
import { useState } from "react";
import { TocItem } from "./types/tocTypes";

export const SummarySectionView = () => {
    const { state } = useBlogBasicInfo();
    const [tocItems, setTocItems] = useState<TocItem[]>([]);

    const handleTocReady = (items: TocItem[]) => {
        setTocItems(items);
    };

    // 블로그 상태에 따른 로딩/에러 상태 계산
    const isLoading = state.status === 'loading';
    const error = state.status === 'error' ? state.error : undefined;

    return (
        <div>
            <TableOfContentsView
                tocItems={tocItems}
                isLoading={isLoading}
                error={error}
            />
            <Gap size={24} />
            <SummaryListView onTocReady={handleTocReady} />
        </div>
    );
};      