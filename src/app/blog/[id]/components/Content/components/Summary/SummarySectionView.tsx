"use client";

import { Gap } from "@/components/gap/Gap";
import { TableOfContentsView } from "./nested-components/TableOfContents/TableOfContentsView";
import { SummaryListView } from "./nested-components/SummaryListView/SummaryListView";
import { useBlogBasicInfo } from "@/domains/blog/providers/BlogBasicInfoProvider";

export const SummarySectionView = () => {
    const { state } = useBlogBasicInfo();

    // 로딩 중이거나 에러인 경우 빈 props로 전달 (TableOfContentsView에서 자체 로딩 처리)
    const blogTitle = state.status === 'success' ? state.data.title : '';
    const blogContent = state.status === 'success' ? state.data.content : '';

    return (
        <div>
            <TableOfContentsView
                blogTitle={blogTitle}
                blogContent={blogContent}
            />
            <Gap size={24} />
            <SummaryListView />
        </div>
    );
};      