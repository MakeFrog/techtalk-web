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

        console.log('🔍 [Summary API] 요청 데이터:', {
            title: title?.substring(0, 50),
            textLength: text?.length,
            tocLength: toc?.length,
            keywordsLength: keywords?.length,
            tocItems: toc?.slice(0, 3) // 첫 3개 목차 확인
        });

        if (!title || !text) {
            console.error('❌ [Summary API] 필수 데이터 누락:', { title: !!title, text: !!text });
            return NextResponse.json(
                { error: '제목과 본문이 필요합니다.' },
                { status: 400 }
            );
        }

        // 목차가 없으면 요약 생성 중단
        if (!toc || toc.length === 0) {
            console.error('❌ [Summary API] 목차가 없어서 요약 생성 중단');
            return NextResponse.json(
                { error: '목차가 필요합니다.' },
                { status: 400 }
            );
        }

        // 키워드가 없으면 요약 생성 중단
        if (!keywords || keywords.length === 0) {
            console.error('❌ [Summary API] 키워드가 없어서 요약 생성 중단');
            return NextResponse.json(
                { error: '키워드가 필요합니다.' },
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

        // TOC 데이터를 안전하게 처리 (문자열 배열 또는 객체 배열 모두 대응)
        const tocTitles = toc.map((item: any, index: number) => {
            // 이미 문자열인 경우
            if (typeof item === 'string') {
                return `${index + 1}. ${item}`;
            }
            // 객체인 경우 (TocItem 형태: {id, title})
            if (typeof item === 'object' && item.title) {
                return `${index + 1}. ${item.title}`;
            }
            // 예외 상황 처리
            return `${index + 1}. ${String(item)}`;
        });

        const summaryPrompt = `
당신은 기술 블로그 전문 요약가로서, **제목, 원문, 목차, 프로그래밍 키워드**를 바탕으로 학습 최적화된 완전한 요약을 생성해야 합니다.

### 🎯 목표
- 전체 블로그 내용을 체계적으로 요약하여 독자가 핵심 내용을 쉽게 이해할 수 있도록 합니다.
- 제공된 목차 구조를 정확히 따라 각 섹션별로 상세한 설명을 제공합니다.
- 프로그래밍 개념에 대한 링크를 활용하여 연결성을 높입니다.

### ✅ 작성 규칙

#### 📝 마크다운 형식
- 각 목차는 \`## (이모지) (목차제목)\` 형식의 헤더로 시작합니다.
- 목차 아래 내용은 \`- 항목\` 형식의 리스트로 구성합니다.
- 프로그래밍 키워드는 반드시 \`[키워드]\` 형식으로 대괄호로 감쌉니다.
- 중요한 개념은 **볼드**로 강조합니다.
- 코드는 \`인라인 코드\` 형식을 사용합니다.

#### 📋 내용 구성
- 아래 제공된 목차 순서를 정확히 따라 모든 목차를 다뤄야 합니다.
- 각 섹션은 3-7개의 핵심 포인트로 구성합니다.
- 원문의 핵심 내용을 놓치지 않고 포함합니다.
- 기술적 세부사항과 실용적 예시를 균형있게 다룹니다.
- 학습자가 단계별로 이해할 수 있도록 논리적 순서를 유지합니다.

#### 🔗 키워드 연결
- 프로그래밍 키워드 목록에 있는 개념들을 적극적으로 활용합니다.
- 키워드는 정확한 용어로 \`[키워드]\` 형식으로 표기합니다.
- 맥락에 맞게 자연스럽게 키워드를 삽입합니다.

### 📥 입력 데이터

**제목:** ${title}

**📋 목차 (이 순서대로 섹션을 구성하세요):**
${tocTitles.join('\n')}

**🔑 프로그래밍 키워드 (적극 활용하세요):**
${keywords && keywords.length > 0
                ? keywords.map((keyword: { keyword: string; description: string }) => `- [${keyword.keyword}]: ${keyword.description}`).join('\n')
                : '키워드가 제공되지 않았습니다.'
            }

**📄 원문:**
${text}

### 📤 출력 형식
위 목차 순서를 정확히 따라 구조화된 마크다운 형식으로 응답해주세요. 
**모든 목차 항목을 빠뜨리지 말고 포함해야 합니다.**

**예시 형식:**
\`\`\`
## 🎯 첫 번째 목차

- [핵심키워드]는 **중요한 개념**으로서 시스템의 성능을 좌우합니다.
- \`코드예시\`를 통해 실제 구현 방법을 확인할 수 있습니다.
- [다른키워드]와의 연관성을 이해하는 것이 중요합니다.

## 🚀 두 번째 목차

- 실제 프로덕션 환경에서는 [관련기술]을 활용하여 문제를 해결합니다.
- **모니터링**과 **로깅**을 통해 시스템 상태를 추적할 수 있습니다.
\`\`\`
`;

        console.log('📋 [Summary API] 원본 목차:', toc);
        console.log('📋 [Summary API] 처리된 목차:', tocTitles);
        console.log('🔑 [Summary API] 사용된 키워드:', keywords.map((k: { keyword: string }) => k.keyword));

        // 프롬프트 전문을 로그로 출력 (디버깅용)
        console.log('📝 [Summary API] 생성된 프롬프트 전문:\n' + summaryPrompt);

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