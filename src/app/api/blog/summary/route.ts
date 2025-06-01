import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Rate limiting을 위한 유틸리티 함수들
async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number,
    baseDelay: number
): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            const isRateLimitError = error?.status === 429 || error?.message?.includes('429');

            if (isRateLimitError && attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt - 1);
                console.warn(`⚠️ [Summary] 재시도 ${attempt}/${maxRetries} - ${delay}ms 대기`);
                await sleep(delay);
                continue;
            }
            throw error;
        }
    }
    throw new Error('최대 재시도 횟수 초과');
}

export async function POST(request: NextRequest) {
    try {
        const { title, text, toc, keywords } = await request.json();

        if (!title || !text) {
            return NextResponse.json(
                { error: '제목과 본문이 필요합니다.' },
                { status: 400 }
            );
        }

        // Gemini Flash 2.0 모델 설정
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 3000,
            }
        });

        // TOC를 문자열로 변환
        const tocStr = toc && toc.length > 0
            ? toc.map((item: any, index: number) => `${index + 1}. ${item.title || item}`).join('\n')
            : '목차 없음';

        // 키워드를 문자열로 변환
        const keywordsStr = keywords && keywords.length > 0
            ? keywords.map((k: any) => `- ${k.keyword}: ${k.description}`).join('\n')
            : '프로그래밍 키워드 없음';

        const summaryPrompt = `
당신은 기술 블로그 전문 요약가로서, **전체 블로그 내용**을 체계적으로 요약해야 합니다.

### 🎯 목표
- 독자가 블로그 전체 내용을 체계적으로 학습할 수 있도록 완전한 요약을 제공합니다.
- 제공된 목차를 기반으로 각 섹션별 핵심 내용을 정리합니다.
- 프로그래밍 개념에 대한 링크를 활용하여 연결성을 높입니다.

### ✅ 작성 규칙
- 제공된 목차를 ## 헤더로 사용하여 섹션별로 구성합니다.
- 각 섹션당 **불릿 2-8개**로 핵심 내용을 요약합니다.
- 각 블릿은 1-2문장으로 구성되며, 서로 이어지는 문장으로 단계별 이해를 돕습니다.
- 각 블릿은 **콜론( : )은 사용하지 않고**, 구분이 필요하면 **en-dot(.)** 또는 **괄호**를 사용합니다.
- 하이라이트(\`\`)과 같은 마크다운 형식을 활용하여 가독성을 높입니다.
- 코드 예시가 있는 경우 적절히 포함하되, 실제 글의 내용을 기반으로 합니다.
- 각 블릿은 필요 시 \`\`\`css / \`\`\`ts 등의 언어에 적합한 코드 스니펫을 사용합니다.
- 프로그래밍 개념이 언급될 때는 [개념명](concept:개념명) 형식으로 링크를 걸어줍니다.
- 섹션 마지막에는 필요에 따라 다음 형식을 사용할 수 있습니다:
   - 주의사항: \`> **⚠️ 주의** : (관련 내용)\` 형태로 강조
   - 팁: \`> **💡 팁** : (관련 내용)\` 형태로 강조
- **모든 문장은 평서형 '-다/한다' 어미로 끝냅니다.**

### 📚 목차
${tocStr}

### 🔑 프로그래밍 키워드
${keywordsStr}

### 📝 출력 형식
마크다운 형식으로 전체 블로그의 완전한 요약을 반환해주세요. 추가 설명이나 주석은 포함하지 마세요.

### 📥 입력 데이터
제목: ${title}

원문:   
${text}

### ⚠️ 중요
- **전체 블로그 내용**을 목차별로 체계적으로 요약하세요.
- 마크다운 형식의 완전한 요약 내용만 반환하세요.
- 프로그래밍 개념 링크를 적극 활용하세요.
`;

        console.log('🚀 [Full Summary] 전체 요약 스트리밍 시작');

        // 스트리밍 응답 생성
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    console.log('🔄 [Full Summary] 스트림 처리 시작');

                    // 재시도 로직으로 스트림 생성
                    const result = await retryWithBackoff(
                        () => model.generateContentStream(summaryPrompt),
                        3, // 최대 3회 재시도
                        2000 // 기본 2초 대기
                    );

                    // 스트림 처리
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        if (chunkText) {
                            console.log('📨 [Full Summary] 청크 수신:', {
                                chunkLength: chunkText.length
                            });
                            controller.enqueue(encoder.encode(chunkText));
                        }
                    }

                    console.log('✅ [Full Summary] 스트림 완료');
                    controller.close();
                } catch (error: any) {
                    console.error('❌ [Full Summary] 스트림 오류:', error);

                    // 429 에러 특별 처리
                    if (error?.status === 429) {
                        const errorMessage = 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
                        controller.enqueue(encoder.encode(errorMessage));
                    } else {
                        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
                        controller.enqueue(encoder.encode(errorMessage));
                    }

                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error('❌ [Full Summary API] 오류:', error);
        return NextResponse.json(
            { error: '요약 생성 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
} 