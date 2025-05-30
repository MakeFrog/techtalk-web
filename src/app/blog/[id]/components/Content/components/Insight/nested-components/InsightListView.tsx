import React from 'react';
import { parseMarkdown } from '@/utils/markdownParser';
import * as styles from './InsightListView.css';

// 마크다운 문자열 리스트를 불렛 리스트로 렌더링
interface MarkdownBulletListProps {
    items: string[];
}

const MarkdownBulletList = React.memo(function MarkdownBulletList({ items }: MarkdownBulletListProps) {
    return (
        <ul className={styles.bulletList}>
            {items.map((item, idx) => (
                <li key={idx} className={styles.listItem}>
                    {parseMarkdown(item, {
                        inlineCodeClassName: styles.inlineCode,
                        textSpanClassName: styles.textSpan,
                        codeBlockClassName: styles.codeBlock,
                        blockquoteClassName: styles.blockquote,
                        boldClassName: styles.bold,
                        italicClassName: styles.italic,
                    })}
                </li>
            ))}
        </ul>
    );
});

// 예시용 더미 데이터   
const dummyMarkdownList = [
    '`React`는 선언적 UI 라이브러리입니다.',
    '`Next.js`는 SSR/SSG를 지원하는 `React` 프레임워크입니다.마크다운 파싱이 필요하다면 `react-markdown` 라이브러리 활용 가능. 마크다운 파싱이 필요하다면 `react-markdown` 라이브러리 활용 가능.',
    '퍼포먼스를 위해 리스트는 `React.memo`로 감쌉니다.',
    '마크다운 파싱이 필요하다면 `react-markdown` 라이브러리 활용 가능.',
    '다음은 간단한 React Hook 예시입니다: ```javascript\nconst [count, setCount] = useState(0);\nconst increment = () => setCount(count + 1);```',
    '개발자들이 자주 인용하는 명언: > 코드는 작성하는 시간보다 읽는 시간이 훨씬 길다. 읽기 쉬운 코드를 작성하라.',
    '**성능 최적화**는 중요하지만 과도하면 안 됩니다: > *조기 최적화는 모든 악의 근원이다* - Donald Knuth',
];

export function InsightListView() {
    return (
        <div>
            <MarkdownBulletList items={dummyMarkdownList} />
        </div>
    );
}
