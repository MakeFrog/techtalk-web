'use client';

import { Gap } from "@/components/gap/Gap";
import { EmojiPrefixedTitle } from "@/components/text/EmojiPrefixedTitle/EmojiPrefixedTitle";
import { QuestionListView } from "./nested-components/QuestionListView";

/**
 * 질문 섹션 컴포넌트 (정적 버전)
 * 마크다운을 지원하는 세련된 질문 리스트를 표시
 */
export function QuestionSectionView() {
    return (
        <div>
            <EmojiPrefixedTitle emoji="❓" title="답변할 수 있나요?" />
            <Gap size={12} />
            <QuestionListView />
        </div>
    );
}           