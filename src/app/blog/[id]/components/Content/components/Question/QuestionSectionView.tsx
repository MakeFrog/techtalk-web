import { Gap } from "@/components/gap/Gap";
import { EmojiPrefixedTitle } from "@/components/text/EmojiPrefixedTitle/EmojiPrefixedTitle";
import { QuestionListView } from "./nested-components/QuestionListView";


export function QuestionSectionView() {
    return (
        <div>
            <EmojiPrefixedTitle emoji="❓" title="답변할 수 있나요?" />
            <Gap size={12} />
            <QuestionListView />
        </div>
    );
}           