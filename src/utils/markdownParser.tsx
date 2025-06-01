import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ParseMarkdownOptions {
    inlineCodeClassName?: string;
    textSpanClassName?: string;
    codeBlockClassName?: string;
    blockquoteClassName?: string;
    boldClassName?: string;
    italicClassName?: string;
    conceptKeywordClassName?: string;
    onConceptClick?: (keyword: string, event: React.MouseEvent) => void;
}

// 공통 마크다운 스타일 프리셋
export const MARKDOWN_STYLE_PRESETS = {
    insight: {
        inlineCodeClassName: 'insight-inline-code',
        textSpanClassName: 'insight-text-span',
        codeBlockClassName: 'insight-code-block',
        blockquoteClassName: 'insight-blockquote',
        boldClassName: 'insight-bold',
        italicClassName: 'insight-italic',
    },
    question: {
        inlineCodeClassName: 'question-inline-code',
        textSpanClassName: 'question-text-span',
        boldClassName: 'question-bold',
        italicClassName: 'question-italic',
    },
    comment: {
        inlineCodeClassName: 'comment-inline-code',
        textSpanClassName: 'comment-text-span',
        boldClassName: 'comment-bold',
        italicClassName: 'comment-italic',
    },
    summary: {
        inlineCodeClassName: 'summary-inline-code',
        textSpanClassName: 'summary-text-span',
        codeBlockClassName: 'summary-code-block',
        blockquoteClassName: 'summary-blockquote',
        boldClassName: 'summary-bold',
        italicClassName: 'summary-italic',
        conceptKeywordClassName: 'summary-concept-keyword',
    }
} as const;

/**
 * 전체 마크다운을 파싱하여 JSX 요소로 변환
 * @param text 파싱할 마크다운 텍스트
 * @param options 스타일 클래스 옵션
 * @returns JSX 요소 배열
 */
export const parseMarkdown = (text: string, options: ParseMarkdownOptions = {}) => {
    const {
        inlineCodeClassName = '',
        textSpanClassName = '',
        codeBlockClassName = '',
        blockquoteClassName = '',
        boldClassName = '',
        italicClassName = '',
        conceptKeywordClassName = '',
        onConceptClick
    } = options;

    // 코드 블록 파싱 (```으로 감싸진 부분)
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = text.split(codeBlockRegex);

    const elements: React.ReactNode[] = [];

    for (let i = 0; i < parts.length; i += 3) {
        const textPart = parts[i];
        const language = parts[i + 1];
        const codePart = parts[i + 2];

        // 일반 텍스트 부분 처리
        if (textPart) {
            elements.push(...parseInlineElements(textPart, {
                inlineCodeClassName,
                textSpanClassName,
                blockquoteClassName,
                boldClassName,
                italicClassName,
                conceptKeywordClassName,
                onConceptClick
            }, elements.length));
        }

        // 코드 블록 부분 처리 - SyntaxHighlighter 사용
        if (codePart !== undefined) {
            const codeLanguage = language || 'text';
            elements.push(
                <div key={`codeblock-${elements.length}`} className={codeBlockClassName}>
                    <SyntaxHighlighter
                        language={codeLanguage}
                        style={oneDark}
                        customStyle={{
                            margin: 0,
                            borderRadius: '8px',
                            fontSize: '14px',
                        }}
                        codeTagProps={{
                            style: {
                                fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace',
                            }
                        }}
                    >
                        {codePart.trim()}
                    </SyntaxHighlighter>
                </div>
            );
        }
    }

    return elements;
};

/**
 * 인라인 요소들을 파싱 (인라인 코드, 인용문, 볼드, 이탤릭)
 */
const parseInlineElements = (
    text: string,
    options: ParseMarkdownOptions,
    baseKey: number
): React.ReactNode[] => {
    const {
        inlineCodeClassName = '',
        textSpanClassName = '',
        blockquoteClassName = '',
        boldClassName = '',
        italicClassName = '',
        conceptKeywordClassName = '',
        onConceptClick
    } = options;

    // 줄 단위로 분리하여 각종 블록 요소 처리
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let headingCounter = 1; // 제목 순서 카운터

    lines.forEach((line, lineIndex) => {
        const trimmedLine = line.trim();

        // 제목 처리 (## , ### 등)
        const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            const [, hashes, titleText] = headingMatch;
            const level = hashes.length;
            const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
            const anchorId = `section-${headingCounter}`; // TOC와 매칭되는 ID 생성

            // 제목에 숫자가 없으면 자동으로 추가 (예: "제목" -> "1. 제목")
            const hasNumberPrefix = /^\d+\.\s/.test(titleText);
            const formattedTitle = hasNumberPrefix ? titleText : `${headingCounter}. ${titleText}`;

            console.log(`🔍 [마크다운 파서] 제목 처리:`, {
                원본: titleText,
                포맷된제목: formattedTitle,
                앵커ID: anchorId,
                레벨: level
            });

            elements.push(
                React.createElement(HeadingTag, {
                    key: `heading-${baseKey}-${lineIndex}`,
                    id: anchorId, // 앵커 ID 추가
                    style: {
                        fontSize: level === 1 ? '1.8rem' : level === 2 ? '1.5rem' : level === 3 ? '1.3rem' : '1.1rem',
                        fontWeight: 'bold',
                        margin: '20px 0 12px 0',
                        lineHeight: '1.4',
                        color: '#1a1a1a'
                    }
                }, parseTextFormatting(formattedTitle, {
                    inlineCodeClassName,
                    textSpanClassName,
                    boldClassName,
                    italicClassName,
                    conceptKeywordClassName,
                    onConceptClick
                }, `${baseKey}-heading-${lineIndex}`))
            );

            headingCounter++; // 제목 카운터 증가
        }
        // 리스트 아이템 처리 (- 또는 * 로 시작)
        else if (trimmedLine.match(/^[-*]\s+/)) {
            const listText = trimmedLine.replace(/^[-*]\s+/, '');
            elements.push(
                <div
                    key={`list-item-${baseKey}-${lineIndex}`}
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        margin: '8px 0',
                        paddingLeft: '16px',
                        position: 'relative'
                    }}
                >
                    <span
                        style={{
                            position: 'absolute',
                            left: '0',
                            top: '0.5em',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#666',
                            marginTop: '-3px'
                        }}
                    />
                    <span style={{ flex: 1 }}>
                        {parseTextFormatting(listText, {
                            inlineCodeClassName,
                            textSpanClassName,
                            boldClassName,
                            italicClassName,
                            conceptKeywordClassName,
                            onConceptClick
                        }, `${baseKey}-list-${lineIndex}`)}
                    </span>
                </div>
            );
        }
        // 인용문 처리 (> 로 시작하는 줄)
        else if (trimmedLine.startsWith('> ')) {
            const quoteText = trimmedLine.replace(/^>\s*/, '');
            elements.push(
                <blockquote key={`quote-${baseKey}-${lineIndex}`} className={blockquoteClassName}>
                    {parseTextFormatting(quoteText, {
                        inlineCodeClassName,
                        textSpanClassName,
                        boldClassName,
                        italicClassName,
                        conceptKeywordClassName,
                        onConceptClick
                    }, `${baseKey}-${lineIndex}`)}
                </blockquote>
            );
        }
        // 빈 줄 처리
        else if (!trimmedLine) {
            elements.push(<br key={`br-${baseKey}-${lineIndex}`} />);
        }
        // 일반 텍스트 처리
        else {
            elements.push(
                <div key={`text-${baseKey}-${lineIndex}`} style={{ margin: '8px 0', lineHeight: '1.6' }}>
                    {parseTextFormatting(line, {
                        inlineCodeClassName,
                        textSpanClassName,
                        boldClassName,
                        italicClassName,
                        conceptKeywordClassName,
                        onConceptClick
                    }, `${baseKey}-${lineIndex}`)}
                </div>
            );
        }
    });

    return elements;
};

/**
 * 텍스트 포맷팅 요소들을 파싱 (인라인 코드, 볼드, 이탤릭, concept 링크)
 */
const parseTextFormatting = (
    text: string,
    options: ParseMarkdownOptions,
    baseKey: string
): React.ReactNode[] => {
    const {
        inlineCodeClassName = '',
        textSpanClassName = '',
        boldClassName = '',
        italicClassName = '',
        conceptKeywordClassName = '',
        onConceptClick
    } = options;

    // concept 링크와 단순 키워드 먼저 처리
    // 1. [keyword](concept:keyword) 형식
    // 2. [keyword] 형식 (단순)
    const conceptLinkParts = text.split(/(\[[^\]]+\](?:\(concept:[^)]+\))?)/g);
    const elements: React.ReactNode[] = [];

    conceptLinkParts.forEach((part, index) => {
        // [keyword](concept:keyword) 형식 매칭
        const fullConceptMatch = part.match(/\[([^\]]+)\]\(concept:([^)]+)\)/);
        // [keyword] 형식 매칭 (뒤에 (concept:...)가 없는 경우)
        const simpleConceptMatch = part.match(/^\[([^\]]+)\]$/) && !part.includes('(concept:');

        if (fullConceptMatch) {
            // 전체 concept 링크
            const [, displayText, keyword] = fullConceptMatch;
            elements.push(
                <span
                    key={`${baseKey}-concept-${index}`}
                    className={conceptKeywordClassName}
                    onClick={(e) => onConceptClick?.(keyword, e)}
                    style={{ cursor: 'pointer' }}
                >
                    {displayText}
                </span>
            );
        } else if (simpleConceptMatch) {
            // 단순 [keyword] 형식
            const keyword = part.slice(1, -1); // [ ] 제거
            elements.push(
                <span
                    key={`${baseKey}-simple-concept-${index}`}
                    className={conceptKeywordClassName}
                    onClick={(e) => onConceptClick?.(keyword, e)}
                    style={{ cursor: 'pointer' }}
                >
                    {keyword}
                </span>
            );
        } else {
            // 인라인 코드 처리 (`code`)
            const inlineCodeParts = part.split(/(`[^`]+`)/g);

            inlineCodeParts.forEach((codePart, codeIndex) => {
                if (codePart.startsWith('`') && codePart.endsWith('`')) {
                    // 인라인 코드
                    const codeText = codePart.slice(1, -1);
                    elements.push(
                        <code key={`${baseKey}-code-${index}-${codeIndex}`} className={inlineCodeClassName}>
                            {codeText}
                        </code>
                    );
                } else {
                    // 볼드/이탤릭 처리
                    elements.push(...parseBoldItalic(codePart, {
                        textSpanClassName,
                        boldClassName,
                        italicClassName
                    }, `${baseKey}-${index}-${codeIndex}`));
                }
            });
        }
    });

    return elements;
};

/**
 * 볼드와 이탤릭을 파싱 (개선된 정규식 사용)
 */
const parseBoldItalic = (
    text: string,
    options: { textSpanClassName?: string; boldClassName?: string; italicClassName?: string },
    baseKey: string
): React.ReactNode[] => {
    const { textSpanClassName = '', boldClassName = '', italicClassName = '' } = options;

    // 볼드 처리 (**text**) - 개선된 정규식으로 더 넓은 범위 지원
    const boldParts = text.split(/(\*\*[^\*]*?\*\*)/g);
    const elements: React.ReactNode[] = [];

    boldParts.forEach((part, index) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            // 볼드 텍스트 (최소 1글자는 있어야 함)
            const boldText = part.slice(2, -2);
            elements.push(
                <strong key={`${baseKey}-bold-${index}`} className={boldClassName}>
                    {boldText}
                </strong>
            );
        } else {
            // 이탤릭 처리 (*text*) - 볼드가 아닌 경우만
            const italicParts = part.split(/(\*[^\*]+?\*)/g);

            italicParts.forEach((italicPart, italicIndex) => {
                if (italicPart.startsWith('*') && italicPart.endsWith('*') &&
                    !italicPart.startsWith('**') && italicPart.length > 2) {
                    // 이탤릭 텍스트 (최소 1글자는 있어야 함)
                    const italicText = italicPart.slice(1, -1);
                    elements.push(
                        <em key={`${baseKey}-italic-${index}-${italicIndex}`} className={italicClassName}>
                            {italicText}
                        </em>
                    );
                } else if (italicPart) {
                    // 일반 텍스트
                    elements.push(
                        <span key={`${baseKey}-text-${index}-${italicIndex}`} className={textSpanClassName}>
                            {italicPart}
                        </span>
                    );
                }
            });
        }
    });

    return elements;
};

/**
 * 프리셋을 사용한 마크다운 파싱 헬퍼
 */
export const parseMarkdownWithPreset = (
    text: string,
    preset: keyof typeof MARKDOWN_STYLE_PRESETS,
    additionalOptions: Partial<ParseMarkdownOptions> = {}
) => {
    return parseMarkdown(text, {
        ...MARKDOWN_STYLE_PRESETS[preset],
        ...additionalOptions
    });
};

/**
 * 기존 인라인 코드 파싱 함수 (하위 호환성)
 * @deprecated parseMarkdown 사용 권장
 */
export const parseInlineCode = (text: string, options: ParseMarkdownOptions = {}) => {
    return parseMarkdown(text, options);
}; 