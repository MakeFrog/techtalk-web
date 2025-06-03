import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { updateAnalyzedInfo, checkFieldExists } from '@/domains/blog/services/analyzedInfoService';

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
    console.log('🚨🚨🚨 [Summary API] ===== API 호출 시작 =====');

    try {
        const { title, text, toc, keywords, documentId } = await request.json();

        console.log('✅ [Summary API] JSON 파싱 완료');

        console.log('🔍 [Summary API] 요청 데이터:', {
            title: title?.substring(0, 50),
            textLength: text?.length,
            tocLength: toc?.length,
            keywordsLength: keywords?.length,
            documentId,
            hasDocumentId: !!documentId,
            tocItems: toc?.slice(0, 3) // 첫 3개 목차 확인
        });

        // documentId가 있으면 기존 저장된 요약 확인
        if (documentId) {
            console.log('🔍 [Summary API] 기존 요약 확인 중:', documentId);
            const existsResult = await checkFieldExists(documentId, 'summary');

            if (existsResult.exists) {
                console.log('✅ [Summary API] 기존 요약 발견, 저장된 데이터 반환');
                return NextResponse.json(
                    {
                        message: '기존 저장된 요약을 사용합니다.',
                        useExisting: true,
                        summary: existsResult.data // 실제 저장된 요약 데이터
                    },
                    { status: 200 }
                );
            }
            console.log('📭 [Summary API] 기존 요약 없음, 새로 생성');
        }

        // 상세한 인자 로그 추가
        console.log('📋 [Summary API] 전체 프롬프트 인자들:');
        console.log('1️⃣ [Title 전체]:', title);
        console.log('2️⃣ [Text 샘플 (처음 500자)]:', text?.substring(0, 500));
        console.log('3️⃣ [TOC 전체 배열]:', JSON.stringify(toc, null, 2));
        console.log('4️⃣ [Keywords 전체 배열]:', JSON.stringify(keywords, null, 2));
        console.log('📏 [Text 전체 길이]:', text?.length, '글자');

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
당신은 프로그래밍 강사 입니다.
기술 블로그의 '제목', '원문', '목차', '프로그래밍 키워드'를 바탕으로 학습에 최적화된 요약을 생성해야 합니다.

#### 📋 내용 구성
- 제공된 목차 구조를 정확히 따라 각 섹션별로 요약하여 학생이 핵심 내용을 쉽게 이해할 수 있도록 'contents(요약문 리스트)'를 작성합니다.
- 아래 제공된 **목차 순서**를 정확히 따라 **모든 목차**를 다뤄야 합니다.
- contents는 리스트로 구성되어 있지만 각 항목은 **이어지는 문장**으로 구성되어 단계별로 유저가 핵심 내용을 이해할 수 있는 서술현 문장으로 구성하니다.
  + 단순한 나열식("첫 번째 문장, 두 번째 문장...")이 아니라 설명 흐름이 자연스럽게 이어지도록 **앞뒤 맥락을 자연스럽게 이어** 지도록 구성합니다.
  + 각 내용은 경어체(존댓말)을 사용해 하되, **바로 학생에게 설명**한는듯이 설명하는 주체가 되어 1-2문장으로 서술 합니다.
  + 다시 강조하지만 contents 리스트의 각 문장들을 서로 설명의 흐름이 이어지는 맥락으로 구성하여 프로그래밍 개념을 설명해야됩니다.
  
- 각 목차 내용은 3-7개의 핵심 포인트로 구성합니다.



#### 📝 마크다운 형식
- 각 목차는 \`##(목차제목)\` 형식의 헤더로 시작합니다.
- 목차 아래 내용은 \`- 항목\` 형식의 리스트로 구성합니다.
- 글의 맥락상 중요한 내용이거나 프로그래밍 키워드는 **볼드**로 강조하여 나타냅니다. (각 센션별로 최소 2개 이상) 
- 필요 시 \`\`\`dart / \`\`\`ts 등의 마크다운 코드 스니펫을 적극 사용합니다.
- 목차별로 하단 부분에는 아래와 같은 형식이 필요에 따라 구성될 수 있습니다.
   - 주의사항: 글에서 독자에게 경고하는 부분이 있으면 \`> **⚠️ 주의** : (관련 내용)\` 형태로 강조
   - 팁: 글에서 강조하거나 추가적으로 알아두면 좋은 내용이 있으면 \`> **💡 팁** : (관련 내용)\` 형태로 강조

#### 🔗 키워드 연결
- 요약 내용에 '프로그래밍 키워'드 목록에 있는 단어가 있으면 동일한 용어로 \`[키워드]\` 형식으로 표기합니다.
- 전달 받은 '프로그래밍 키워드'와 동일한 문자열로 구성합니다.
- 전달 받지 않는 '프로그래밍 키워드'는 해당 형식으로 표기를 하지 않습니다.

### 📥 입력 데이터

**제목:** ${title}

**📋 목차 (이 순서대로 섹션을 구성하세요):**
${tocTitles.join('\n')}

**🔑 프로그래밍 키워드 :**
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
- \`\`\`ts코드예시\`\`\`를 통해 실제 구현 방법을 확인할 수 있습니다.
- [다른키워드]와의 연관성을 이해하는 것이 중요합니다.
.... 

## (두 번째 목차)
....
\`\`\`
`;

        console.log('📋 [Summary API] 원본 목차:', toc);
        console.log('📋 [Summary API] 처리된 목차:', tocTitles);
        console.log('🔑 [Summary API] 사용된 키워드:', keywords.map((k: { keyword: string }) => k.keyword));

        // 목차 처리 과정 상세 로그
        console.log('🔄 [Summary API] 목차 처리 과정:');
        tocTitles.forEach((title: string, index: number) => {
            console.log(`   ${index + 1}. ${title}`);
        });

        // 키워드 처리 과정 상세 로그
        console.log('🔄 [Summary API] 키워드 처리 과정:');
        keywords.forEach((keyword: { keyword: string; description: string }, index: number) => {
            console.log(`   ${index + 1}. [${keyword.keyword}]: ${keyword.description}`);
        });

        // 프롬프트 전문을 로그로 출력 (디버깅용)
        console.log('📝 [Summary API] 생성된 프롬프트 전문:\n' + summaryPrompt);

        console.log('🚀 [Full Summary] 전체 요약 스트리밍 시작');

        // 스트리밍 응답 생성
        const encoder = new TextEncoder();
        let accumulatedContent = ''; // 전체 요약 내용을 누적하기 위한 변수

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

                            // 전체 내용 누적
                            accumulatedContent += chunkText;

                            controller.enqueue(encoder.encode(chunkText));
                        }
                    }

                    console.log('✅ [Full Summary] 스트림 완료');

                    // documentId가 있으면 자동 저장
                    if (documentId && accumulatedContent.trim()) {
                        console.log('💾 [Summary API] 자동 저장 시작');
                        try {
                            const saveResult = await updateAnalyzedInfo(documentId, {
                                summary: accumulatedContent.trim()
                            });

                            if (saveResult.success) {
                                console.log('✅ [Summary API] 자동 저장 성공:', saveResult.documentPath);
                            } else {
                                console.error('❌ [Summary API] 자동 저장 실패:', saveResult.error);
                            }
                        } catch (saveError) {
                            console.error('❌ [Summary API] 자동 저장 오류:', saveError);
                            // 저장 실패해도 스트림은 정상 완료 처리 (저장은 부가 기능)
                        }
                    }

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