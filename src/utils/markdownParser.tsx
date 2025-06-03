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
    validKeywords?: string[]; // 유효한 키워드 목록 추가
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
export const parseMarkdown = (
    text: string,
    options: ParseMarkdownOptions = {},
    baseKey: string = 'markdown'
): React.ReactNode[] => {
    const {
        inlineCodeClassName = '',
        textSpanClassName = '',
        codeBlockClassName = '',
        blockquoteClassName = '',
        boldClassName = '',
        italicClassName = '',
        conceptKeywordClassName = '',
        onConceptClick,
        validKeywords = []
    } = options;

    // 빈 텍스트 처리
    if (!text || !text.trim()) {
        return [<span key="empty" />];
    }

    // 코드 블록 파싱 (```으로 감싸진 부분)
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = text.split(codeBlockRegex);

    const elements: React.ReactNode[] = [];
    let headingCounter = 1; // 전체 문서에서 제목 순서 관리

    for (let i = 0; i < parts.length; i += 3) {
        const textPart = parts[i];
        const language = parts[i + 1];
        const codePart = parts[i + 2];

        // 일반 텍스트 부분 처리
        if (textPart) {
            // 코드 블록 앞의 단순 구분자 줄 제거 (예: "-\n```" 에서 "-" 제거)
            const cleanedTextPart = textPart.replace(/\n-\s*$/, '').replace(/^-\s*\n/, '');

            const { parsedElements, newHeadingCounter } = parseInlineElements(cleanedTextPart, {
                inlineCodeClassName,
                textSpanClassName,
                blockquoteClassName,
                boldClassName,
                italicClassName,
                conceptKeywordClassName,
                onConceptClick,
                validKeywords
            }, elements.length, headingCounter);

            elements.push(...parsedElements);
            headingCounter = newHeadingCounter; // 카운터 업데이트
        }

        // 코드 블록 부분 처리 - SyntaxHighlighter 사용
        if (codePart !== undefined) {
            const codeLanguage = language || 'text';
            elements.push(
                <div key={`codeblock-${elements.length}`} className={codeBlockClassName} style={{ margin: 0, maxWidth: '100%', overflow: 'hidden' }}>
                    <SyntaxHighlighter
                        language={codeLanguage}
                        style={oneDark}
                        customStyle={{
                            margin: 0,
                            padding: '16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            maxWidth: '100%',
                            overflow: 'auto',
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                        }}
                        codeTagProps={{
                            style: {
                                fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace',
                                wordWrap: 'break-word',
                                whiteSpace: 'pre-wrap',
                            }
                        }}
                        wrapLongLines={true}
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
    baseKey: number,
    initialHeadingCounter: number
): { parsedElements: React.ReactNode[]; newHeadingCounter: number } => {
    const {
        inlineCodeClassName = '',
        textSpanClassName = '',
        blockquoteClassName = '',
        boldClassName = '',
        italicClassName = '',
        conceptKeywordClassName = '',
        onConceptClick,
        validKeywords = []
    } = options;

    // 줄 단위로 분리하여 각종 블록 요소 처리
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let headingCounter = initialHeadingCounter; // 전달받은 카운터 사용

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

            elements.push(
                React.createElement(HeadingTag, {
                    key: `heading-${baseKey}-${lineIndex}`,
                    id: anchorId, // 앵커 ID 추가
                    style: {
                        fontSize: level === 1 ? '1.8rem' : level === 2 ? '1.5rem' : level === 3 ? '1.3rem' : '1.1rem',
                        fontWeight: 'bold',
                        margin: '20px 0 6px 0', // 하단 마진을 12px에서 6px로 줄임
                        lineHeight: '1.4',
                        color: '#1a1a1a'
                    }
                }, formattedTitle) // 키워드 파싱 제거, 단순 텍스트로 처리
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
                        position: 'relative',
                        lineHeight: '1.5'
                    }}
                >
                    <span
                        style={{
                            position: 'absolute',
                            left: '0',
                            top: '0.75em',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#666',
                            transform: 'translateY(-50%)',
                        }}
                    />
                    <span style={{ flex: 1 }}>
                        {parseTextFormatting(listText, {
                            inlineCodeClassName,
                            textSpanClassName,
                            boldClassName,
                            italicClassName,
                            conceptKeywordClassName,
                            onConceptClick,
                            validKeywords
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
                        onConceptClick,
                        validKeywords
                    }, `${baseKey}-${lineIndex}`)}
                </blockquote>
            );
        }
        // 빈 줄 처리 - 코드 블록 주변의 빈 줄은 무시
        else if (!trimmedLine) {
            // 이전 요소나 다음 요소가 코드 블록인지 확인
            const prevLine = lineIndex > 0 ? lines[lineIndex - 1]?.trim() : '';
            const nextLine = lineIndex < lines.length - 1 ? lines[lineIndex + 1]?.trim() : '';

            // 코드 블록 바로 앞뒤의 빈 줄은 무시
            if (prevLine.includes('```') || nextLine.includes('```')) {
                // 빈 줄 무시
            } else {
                elements.push(<br key={`br-${baseKey}-${lineIndex}`} />);
            }
        }
        // 일반 텍스트 처리
        else {
            elements.push(
                <div key={`text-${baseKey}-${lineIndex}`} style={{ margin: '4px 0', lineHeight: '1.6' }}>
                    {parseTextFormatting(line, {
                        inlineCodeClassName,
                        textSpanClassName,
                        boldClassName,
                        italicClassName,
                        conceptKeywordClassName,
                        onConceptClick,
                        validKeywords
                    }, `${baseKey}-${lineIndex}`)}
                </div>
            );
        }
    });

    return { parsedElements: elements, newHeadingCounter: headingCounter };
};

/**
 * 텍스트 포맷팅 처리 (굵게, 기울임꼴, 인라인 코드, concept 링크)
 */
const parseTextFormatting = (
    text: string,
    options: {
        inlineCodeClassName?: string;
        textSpanClassName?: string;
        boldClassName?: string;
        italicClassName?: string;
        conceptKeywordClassName?: string;
        onConceptClick?: (keyword: string, event: React.MouseEvent) => void;
        validKeywords?: string[]; // 유효한 키워드 목록 추가
    },
    baseKey: string
): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];

    // Bold (**text**) 처리
    const boldParts = text.split(/(\*\*[^*]+\*\*)/g);

    boldParts.forEach((part, index) => {
        const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);

        if (boldMatch) {
            const [, boldText] = boldMatch;
            elements.push(
                <span key={`${baseKey}-bold-${index}`} className={options.boldClassName || ''}>
                    {parseTextFormatting(boldText, {
                        ...options,
                        boldClassName: undefined // 중첩 방지
                    }, `${baseKey}-bold-${index}`)}
                </span>
            );
        } else {
            // Italic (*text*) 처리
            const italicParts = part.split(/(\*[^*]+\*)/g);

            italicParts.forEach((italicPart, italicIndex) => {
                const italicMatch = italicPart.match(/^\*([^*]+)\*$/);

                if (italicMatch) {
                    const [, italicText] = italicMatch;
                    elements.push(
                        <span key={`${baseKey}-italic-${index}-${italicIndex}`} className={options.italicClassName || ''}>
                            {parseInnerFormatting(italicText, options, `${baseKey}-italic-${index}-${italicIndex}`)}
                        </span>
                    );
                } else {
                    // 일반 텍스트 처리
                    const innerElements = parseInnerFormatting(italicPart, options, `${baseKey}-inner-${index}-${italicIndex}`);
                    elements.push(...innerElements);
                }
            });
        }
    });

    return elements;
};

/**
 * 내부 포맷팅 처리 (concept 링크, 인라인 코드)
 */
const parseInnerFormatting = (
    text: string,
    options: {
        inlineCodeClassName?: string;
        textSpanClassName?: string;
        conceptKeywordClassName?: string;
        onConceptClick?: (keyword: string, event: React.MouseEvent) => void;
        validKeywords?: string[]; // 유효한 키워드 목록 추가
    },
    baseKey: string
): React.ReactNode[] => {
    const {
        inlineCodeClassName = '',
        textSpanClassName = '',
        conceptKeywordClassName = '',
        onConceptClick,
        validKeywords = []
    } = options;

    // concept 링크와 단순 키워드 처리
    const conceptLinkParts = text.split(/(\[[^\]]+\](?:\(concept:[^)]+\))?)/g);
    const elements: React.ReactNode[] = [];

    conceptLinkParts.forEach((part, index) => {
        // [keyword](concept:keyword) 형식 매칭
        const fullConceptMatch = part.match(/\[([^\]]+)\]\(concept:([^)]+)\)/);
        // [keyword] 형식 매칭 (뒤에 (concept:...)가 없는 경우)
        const simpleConceptMatch = part.match(/^\[([^\]]+)\]$/) && !part.includes('(concept:');

        if (fullConceptMatch) {
            // 전체 concept 링크 - 키워드 유효성 검증
            const [, displayText, keyword] = fullConceptMatch;
            const isValidKeyword = validKeywords.length === 0 || validKeywords.includes(keyword);

            if (isValidKeyword) {
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
            } else {
                // 유효하지 않은 키워드는 일반 텍스트로 처리
                elements.push(
                    <span key={`${baseKey}-invalid-concept-${index}`} className={textSpanClassName}>
                        {displayText}
                    </span>
                );
            }
        } else if (simpleConceptMatch) {
            // 단순 [keyword] 형식 - 키워드 유효성 검증
            const keyword = part.slice(1, -1); // [ ] 제거
            const isValidKeyword = validKeywords.length === 0 || validKeywords.includes(keyword);

            if (isValidKeyword) {
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
                // 유효하지 않은 키워드는 일반 텍스트로 처리
                elements.push(
                    <span key={`${baseKey}-invalid-simple-concept-${index}`} className={textSpanClassName}>
                        {keyword}
                    </span>
                );
            }
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
                } else if (codePart) {
                    // 일반 텍스트
                    elements.push(
                        <span key={`${baseKey}-text-${index}-${codeIndex}`} className={textSpanClassName}>
                            {codePart}
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