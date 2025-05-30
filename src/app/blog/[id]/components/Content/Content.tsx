import { Gap } from "@/components/gap/Gap.tsx";
import ContentHeader from "./components/ContentHeader/ContentHeader.tsx";
import { InsightSectionView } from "./components/Insight/InsightSectionView.tsx";
import { container } from "./Content.css.ts";
import { QuestionSectionView } from "./components/Question/QuestionSectionView.tsx";
import { SummarySectionView } from "./components/Summary/SummarySectionView.tsx";

export default function Content() {
    return (
        <section className={container}>
            <ContentHeader />
            <Gap size={24} />
            <InsightSectionView />
            <Gap size={20} />
            <QuestionSectionView />
            <Gap size={24} />
            <SummarySectionView />
        </section>
    );
}   