'use client';

import { Gap } from "@/components/gap/Gap";
import { EmojiPrefixedTitle } from "@/components/text/EmojiPrefixedTitle/EmojiPrefixedTitle";
import { InsightStreamState } from "@/domains/blog/hooks/useInsightStream";
import { InsightContentView } from "./nested-components/InsightContentView";
import * as styles from "./nested-components/InsightContentView.css";

interface InsightSectionViewProps {
    streamState: InsightStreamState;

}

/**
 * 인사이트 섹션 컴포넌트
 * Gemini API를 통해 생성된 요약 내용을 표시
 */
export function InsightSectionView({ streamState }: InsightSectionViewProps) {
    return (
        <div>
            <EmojiPrefixedTitle emoji="💡" title="핵심 인사이트" />
            <Gap size={12} />
            <InsightContentView streamState={streamState} />
        </div>
    );
}

export const InsightSectionViewLoader = () => {
    return (
        <div>
            <EmojiPrefixedTitle emoji="💡" title="핵심 인사이트" />
            <Gap size={12} />
            <div className={styles.contentContainer} style={{ minHeight: '200px' }}>

            </div>
        </div>
    );
};

