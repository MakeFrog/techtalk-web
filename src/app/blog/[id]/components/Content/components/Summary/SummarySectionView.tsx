import { Gap } from "@/components/gap/Gap";
import { TableOfContentsView } from "./nested-components/TableOfContents/TableOfContentsView";
import { SummaryListView } from "./nested-components/SummaryListView/SummaryListView";

export const SummarySectionView = () => {
    return (
        <div>
            <TableOfContentsView />
            <Gap size={24} />
            <SummaryListView />
        </div>
    );
};      