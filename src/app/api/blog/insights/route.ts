import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Rate limiting을 위한 유틸리티 함수들
async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            // 429 에러인 경우에만 재시도
            if (error?.status === 429 && attempt < maxRetries) {
                // Exponential backoff: 1초, 2초, 4초, 8초...
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`⏳ [Insights] Rate limit 도달, ${delay}ms 후 재시도 (${attempt + 1}/${maxRetries})`);
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
        console.log('🚀 [Gemini Insights API] 요청 시작');

        const { title, text } = await request.json();
        console.log('📋 [Gemini Insights API] 요청 데이터:', {
            title: title?.substring(0, 50) + '...',
            textLength: text?.length || 0
        });

        if (!title || !text) {
            console.error('❌ [Gemini Insights API] 제목 또는 내용이 없습니다.');
            return NextResponse.json(
                { error: '제목과 내용이 필요합니다.' },
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
                maxOutputTokens: 1000,
            }
        });

        // 한국어로 인사이트 생성 프롬프트
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
- 꼭 실무에 적용하거나 참고할 수 있는 가이드/베스트 프랙티스가 포함되도록 작성
- 형식적인 인사말이나 불필요한 도입부 없이 곧바로 요약 내용만 작성

### 📥 입력 데이터
제목: ${title}

원문: ${text}
`;

        console.log('🚀 [Gemini Insights] Flash 2.0 스트리밍 시작');

        // 스트리밍 응답 생성
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    console.log('🔄 [Gemini Insights] 스트림 처리 시작');

                    // 재시도 로직으로 스트림 생성
                    const result = await retryWithBackoff(
                        () => model.generateContentStream(prompt),
                        3, // 최대 3회 재시도
                        2000 // 기본 2초 대기
                    );

                    // 스트림 처리
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        if (chunkText) {
                            console.log('📨 [Gemini Insights] 청크 수신:', {
                                chunkLength: chunkText.length
                            });
                            controller.enqueue(encoder.encode(chunkText));
                        }
                    }

                    console.log('✅ [Gemini Insights] 스트림 완료');
                    controller.close();
                } catch (error: any) {
                    console.error('❌ [Gemini Insights] 스트림 오류:', error);

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
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error: any) {
        console.error('❌ [Gemini Insights API] 전체 오류:', error);
        console.error('❌ [Gemini Insights API] 오류 스택:', error instanceof Error ? error.stack : 'Unknown');

        // 429 에러 특별 처리
        if (error?.status === 429) {
            return NextResponse.json(
                {
                    error: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
                    retryAfter: '60초 후 재시도 가능'
                },
                { status: 429 }
            );
        }

        return NextResponse.json(
            {
                error: '인사이트 생성에 실패했습니다.',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 