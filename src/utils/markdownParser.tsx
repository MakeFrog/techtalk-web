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
}

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
        italicClassName = ''
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
                italicClassName
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
        italicClassName = ''
    } = options;

    // 줄 단위로 분리하여 인용문 처리
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, lineIndex) => {
        // 인용문 처리 (> 로 시작하는 줄)
        if (line.trim().startsWith('> ')) {
            const quoteText = line.replace(/^>\s*/, '');
            elements.push(
                <blockquote key={`quote-${baseKey}-${lineIndex}`} className={blockquoteClassName}>
                    {parseTextFormatting(quoteText, {
                        inlineCodeClassName,
                        textSpanClassName,
                        boldClassName,
                        italicClassName
                    }, `${baseKey}-${lineIndex}`)}
                </blockquote>
            );
        } else if (line.trim()) {
            // 일반 텍스트 처리
            elements.push(
                <div key={`text-${baseKey}-${lineIndex}`}>
                    {parseTextFormatting(line, {
                        inlineCodeClassName,
                        textSpanClassName,
                        boldClassName,
                        italicClassName
                    }, `${baseKey}-${lineIndex}`)}
                </div>
            );
        }

        // 줄바꿈 추가 (마지막 줄 제외)
        if (lineIndex < lines.length - 1) {
            elements.push(<br key={`br-${baseKey}-${lineIndex}`} />);
        }
    });

    return elements;
};

/**
 * 텍스트 포맷팅 요소들을 파싱 (인라인 코드, 볼드, 이탤릭)
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
        italicClassName = ''
    } = options;

    // 인라인 코드 먼저 처리 (`code`)
    const inlineCodeParts = text.split(/(`[^`]+`)/g);
    const elements: React.ReactNode[] = [];

    inlineCodeParts.forEach((part, index) => {
        if (part.startsWith('`') && part.endsWith('`')) {
            // 인라인 코드
            const codeText = part.slice(1, -1);
            elements.push(
                <code key={`${baseKey}-code-${index}`} className={inlineCodeClassName}>
                    {codeText}
                </code>
            );
        } else {
            // 볼드/이탤릭 처리
            elements.push(...parseBoldItalic(part, {
                textSpanClassName,
                boldClassName,
                italicClassName
            }, `${baseKey}-${index}`));
        }
    });

    return elements;
};

/**
 * 볼드와 이탤릭을 파싱
 */
const parseBoldItalic = (
    text: string,
    options: { textSpanClassName?: string; boldClassName?: string; italicClassName?: string },
    baseKey: string
): React.ReactNode[] => {
    const { textSpanClassName = '', boldClassName = '', italicClassName = '' } = options;

    // 볼드 처리 (**text**)
    const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
    const elements: React.ReactNode[] = [];

    boldParts.forEach((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            // 볼드 텍스트
            const boldText = part.slice(2, -2);
            elements.push(
                <strong key={`${baseKey}-bold-${index}`} className={boldClassName}>
                    {boldText}
                </strong>
            );
        } else {
            // 이탤릭 처리 (*text*)
            const italicParts = part.split(/(\*[^*]+\*)/g);

            italicParts.forEach((italicPart, italicIndex) => {
                if (italicPart.startsWith('*') && italicPart.endsWith('*') && !italicPart.startsWith('**')) {
                    // 이탤릭 텍스트
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
 * 기존 인라인 코드 파싱 함수 (하위 호환성)
 * @deprecated parseMarkdown 사용 권장
 */
export const parseInlineCode = (text: string, options: ParseMarkdownOptions = {}) => {
    return parseMarkdown(text, options);
}; 