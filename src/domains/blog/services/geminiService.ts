import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * 재시도 백오프 유틸리티
 */
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number,
    baseDelay: number
): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            console.warn(`⚠️ [Retry] ${attempt + 1}/${maxRetries + 1} 시도 실패:`, lastError.message);

            if (attempt === maxRetries) {
                break;
            }

            const delay = baseDelay * Math.pow(2, attempt);
            console.log(`⏳ [Retry] ${delay}ms 후 재시도...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}

/**
 * 인사이트 생성 스트림
 */
export async function* generateInsightStream(title: string, text: string): AsyncGenerator<string> {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 528,
        }
    });

    const prompt = `
당신은 기슬 블로그 글을 소개하는 편집자 입니다.
아래 기술 블로그의 '제목'과 '원문'을 바탕으로, 글에서 얻을 수 있는 핵심 인사이트를 간결하게 요약하여,
이 글을 독자가 읽어야 하는 이유를 설명해 주세요.

## 작성 기준 
- 글의 '문제 정의'나 '기술적 고민'이 잘 드러난 부분이 있다면 꼭 언급해주세요.
- 기술적으로 흥미로운 내용이 있으면 설명해주세요.
- 너무 평범하거나 상투적인 요약은 피합니다.
- 글의 마지막 문장에 이 글을 읽고 어떤 지식, 시야, 실전 노하우를 얻을 수 있는지 설명해 주세요.

## 출력 형식
- 2~3줄 내외의 간결하고 자연스러운 한국어 문장
  - 마크다운 형식을 지원합니다
  - 글의 맥락상 중요한 내용이거나 프로그래밍 키워드는 **볼드**로 강조하여 나타냅니다. (각 센션별로 최소 2개 이상) 
- 형식적인 인사말이나 불필요한 도입부 없이 곧바로 요약 내용만 작성

### 📥 입력 데이터
제목: ${title}

원문: ${text}
`;

    try {
        console.log('🚀 [Gemini Service] 인사이트 스트림 시작');

        const result = await retryWithBackoff(
            () => model.generateContentStream(prompt),
            3, // 최대 3회 재시도
            2000 // 기본 2초 대기
        );

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
                yield chunkText;
            }
        }

        console.log('✅ [Gemini Service] 인사이트 스트림 완료');

    } catch (error) {
        console.error('❌ [Gemini Service] 인사이트 생성 오류:', error);
        throw error;
    }
} 