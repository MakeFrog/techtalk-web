/**
 * 마크다운 텍스트 전처리를 위한 유틸리티 클래스
 * 
 * 마크다운 텍스트의 불필요한 공백, 코드 블록 감싸기, 줄바꿈 등을 
 * 정리하여 깔끔한 렌더링을 위한 전처리를 담당합니다.
 */
export class MarkdownPreprocessor {
    /**
     * 마크다운 코드 블록 감싸기를 제거합니다.
     * 
     * @example
     * ```markdown
     * # 제목
     * ```
     * // -> "# 제목"
     */
    private static removeMarkdownCodeBlockWrapper(text: string): string {
        let processed = text;

        // ```markdown으로 감싸진 경우 제거
        if (processed.startsWith('```markdown') && processed.endsWith('```')) {
            processed = processed
                .replace(/^```markdown\s*\n?/, '')
                .replace(/\n?\s*```$/, '');
        }

        // ```으로만 감싸진 경우 제거 (언어 명시 없이)
        if (processed.startsWith('```') && processed.endsWith('```') && !processed.includes('\n```')) {
            processed = processed
                .replace(/^```\s*\n?/, '')
                .replace(/\n?\s*```$/, '');
        }

        return processed;
    }

    /**
     * 제목 뒤의 불필요한 빈 줄을 제거합니다.
     * 
     * @example
     * ## 제목\n\n- 리스트 -> ## 제목\n- 리스트
     */
    private static removeExtraLinesAfterHeadings(text: string): string {
        return text.replace(/^(#{1,6}.*)\n\n(-|\*)/gm, '$1\n$2');
    }

    /**
     * 코드 블록 주변의 불필요한 줄바꿈을 제거합니다.
     */
    private static normalizeCodeBlockSpacing(text: string): string {
        return text
            // 코드 블록 위의 줄바꿈 제거
            .replace(/\n\n```/g, '\n```')
            .replace(/\n```/g, '\n```')
            // 코드 블록 아래의 줄바꿈 제거  
            .replace(/```\n\n/g, '```\n');
    }

    /**
     * 연속된 빈 줄을 정리합니다.
     * 최대 2개의 연속 줄바꿈만 허용합니다.
     */
    private static normalizeLineBreaks(text: string): string {
        return text.replace(/\n{3,}/g, '\n\n');
    }

    /**
     * 텍스트의 시작과 끝 공백을 제거합니다.
     */
    private static trimWhitespace(text: string): string {
        return text.trim();
    }

    /**
     * 마크다운 텍스트를 전처리합니다.
     * 
     * 다음 작업들을 순차적으로 수행합니다:
     * 1. 코드 블록 감싸기 제거
     * 2. 제목 뒤의 빈 줄 정리
     * 3. 코드 블록 주변 공백 정리
     * 4. 연속 줄바꿈 정리
     * 5. 앞뒤 공백 제거
     * 
     * @param text 전처리할 마크다운 텍스트
     * @returns 전처리된 마크다운 텍스트
     */
    static preprocess(text: string): string {
        if (!text || typeof text !== 'string') {
            return '';
        }

        let processed = text;

        // 순차적으로 전처리 작업 수행
        processed = this.removeMarkdownCodeBlockWrapper(processed);
        processed = this.removeExtraLinesAfterHeadings(processed);
        processed = this.normalizeCodeBlockSpacing(processed);
        processed = this.normalizeLineBreaks(processed);
        processed = this.trimWhitespace(processed);

        return processed;
    }

    /**
     * 디버깅용: 전처리 전후 비교
     */
    static preprocessWithLog(text: string, componentName?: string): string {
        const original = text;
        const processed = this.preprocess(text);

        if (process.env.NODE_ENV === 'development' && original !== processed) {
            const prefix = componentName ? `[${componentName}]` : '[MarkdownPreprocessor]';
            console.log(`🔧 ${prefix} 마크다운 전처리 수행`, {
                originalLength: original.length,
                processedLength: processed.length,
                hasCodeBlockWrapper: original.includes('```markdown'),
                hasExtraLineBreaks: /\n{3,}/.test(original)
            });
        }

        return processed;
    }
} 