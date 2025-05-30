import { Gap } from "@/components/gap/Gap";
import { EmojiPrefixedTitle } from "@/components/text/EmojiPrefixedTitle/EmojiPrefixedTitle";
import { InsightListView } from "./nested-components/InsightListView";


export function InsightSectionView() {
    return (
        <div>
            <EmojiPrefixedTitle emoji="💡" title="핵심 인사이트" />
            <Gap size={12} />
            <InsightListView />
        </div>
    );
}

// 예시용 더미 데이터
const dummyMarkdownList = [
    '`React`는 선언적 UI 라이브러리입니다.',
    '`Next.js`는 SSR/SSG를 지원하는 `React` 프레임워크입니다.',
    '퍼포먼스를 위해 리스트는 `React.memo`로 감쌉니다.',

];

