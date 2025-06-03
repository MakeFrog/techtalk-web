import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { updateAnalyzedInfo, checkFieldExists } from '@/domains/blog/services/analyzedInfoService';

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
                console.log(`⏳ [Questions] Rate limit 도달, ${delay}ms 후 재시도 (${attempt + 1}/${maxRetries})`);
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
        console.log('🚀 [Question API] 스트림 요청 시작');

        const { title, content, documentId } = await request.json();
        console.log('📋 [Question API] 요청 데이터:', {
            title: title?.substring(0, 50) + '...',
            textLength: content?.length || 0,
            documentId,
            hasDocumentId: !!documentId
        });

        if (!title || !content) {
            return NextResponse.json(
                { error: 'title과 content가 필요합니다.' },
                { status: 400 }
            );
        }

        // documentId가 있으면 기존 QnA 확인
        if (documentId) {
            console.log('🔍 [Questions API] 기존 QnA 확인 중:', documentId);

            const existsResult = await checkFieldExists(documentId, 'qna');
            if (existsResult.exists) {
                console.log('✅ [Questions API] 기존 QnA 발견, 저장된 데이터 반환');

                return NextResponse.json(
                    {
                        message: '기존 저장된 질문을 사용합니다.',
                        useExisting: true,
                        data: existsResult.data // 실제 저장된 QnA 데이터 포함
                    },
                    { status: 200 }
                );
            }
            console.log('📭 [Questions API] 기존 QnA 없음, 새로 생성');
        }

        // Gemini 2.0 Flash 모델 설정
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 562,
            }
        });

        // 스트림용 프롬프트 - 질문을 하나씩 생성
        const streamPrompt = `
기술 블로그의 '제목'과 '원문'을 내용을 바탕으로 프로그래밍 개념을 물어보는 **기술 면접 질문*과 **모범답안**을 작성하세요.

## 작성 내용
- 먼저, 제공된 **제목**과 **원문** 정보를 토대로 **핵심 요약 내용**을 파악하세요.
- 이 **핵심 요약 내용**에서 **직접 언급되는 프로그래밍 개념을 바탕으로, **실제 면접에 사용될 수 있는 심화 질문**을 만들어 주세요.
- 원문 글에서 직접적으로 언급된는 프로그래밍 개념을 물어보는 질문들로만 구성되어야 합니다. (원문 글에서 다루고 있지 않는 내용은 질문으로 생성하지 않습니다)
  + 글에서 다루는 사례를 물어보는 질문이 아닌 **프로그래밍 개념**을 불어보는 질문들로 구성합니다.
  + 독자의 개인적인 경험 또는 사례를 물어보는 질문은 지양합니다.


### 작성 규칙
- 질문 개수는 2개 이상 5개 이하로 작성합니다 (중요)
  + 아래 JSON 형식의 면접 질문을 **정확히 5개만 생성**해주세요. 5개 이상 생성하지 마세요.
  + 질문 1개 생성마다 출력하고, **5개를 넘기면 바로 종료**해주세요.
- 각 질문에는 **명확하고 1,2줄 이내의 모범 답안**을 작성하세요.
- \`question\`에는 번호를 매기지 않고 질문 내용으로 구성되어야 합니다.
- 질문이 전혀 성립하지 않거나 적절한 질문을 구성할 수 없을 경우, **빈 배열(\`[]\`)**을 반환하세요.
- 중복 질문을 피하세요.
- **각 질문마다 개별 JSON 블록으로 즉시 출력**해주세요.

### 🚀 출력 형식
각 질문을 완성할 때마다 즉시 아래 JSON 형식으로 출력하세요: 

\`\`\`json
{
  "question": "구체적인 면접 질문 내용",        
  "answer": "명확한 1-2줄 모범 답안"
}
\`\`\`
    
**중요**: 
> 출력 전 아래 규칙을 다시 검토하여 준수합니다.
- 각 질문마다 개별 JSON 블록으로 출력
- 다른 설명 텍스트 없이 JSON만 출력
- 질문이 생성될 때마다 즉시 출력
- 적절한 질문을 구성할 수 없다면 생성을 중단하고 종료
- 질문 개수는 5개 이하로 작성합니다 (중요)

### 📥 입력 데이터
**제목**: ${title}

**원문**: ${content}

위 내용을 바탕으로 핵심 요약을 파악한 후, 프로그래밍 개념 중심의 면접 질문을 순차적으로 생성해주세요:`;

        console.log('🚀 [Question] 스트림 처리 시작');

        // 스트림 응답 설정
        const encoder = new TextEncoder();
        let accumulatedQuestions: any[] = []; // 전체 질문들을 누적하기 위한 배열

        const stream = new ReadableStream({
            async start(controller) {
                console.log('🔄 [Question] 스트림 시작');

                try {
                    // 재시도 로직으로 스트림 생성
                    const result = await retryWithBackoff(
                        () => model.generateContentStream(streamPrompt),
                        3, // 최대 3회 재시도
                        2000 // 기본 2초 대기
                    );

                    let buffer = '';
                    let questionCount = 0;
                    const processedJsonBlocks = new Set<string>();

                    // 스트림 처리
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        if (chunkText) {
                            buffer += chunkText;

                            // JSON 블록들을 찾아서 처리
                            const jsonBlockRegex = /```json\s*(\{[\s\S]*?\})\s*```/g;
                            let match;

                            while ((match = jsonBlockRegex.exec(buffer)) !== null) {
                                const fullMatch = match[0];
                                const jsonContent = match[1];

                                if (!processedJsonBlocks.has(jsonContent)) {
                                    try {
                                        const questionData = JSON.parse(jsonContent);

                                        if (questionData.question && questionData.answer) {
                                            questionCount++;
                                            processedJsonBlocks.add(jsonContent);

                                            console.log(`✨ [Question] ${questionCount}번째 질문 전송:`, {
                                                question: questionData.question.substring(0, 50) + '...',
                                                answer: questionData.answer.substring(0, 30) + '...',
                                                jsonLength: jsonContent.length,
                                                bufferLength: buffer.length
                                            });

                                            // 질문 데이터를 누적 배열에 추가
                                            accumulatedQuestions.push(questionData);

                                            // 클라이언트로 질문 데이터 전송
                                            const dataString = `data: ${JSON.stringify(questionData)}\n\n`;
                                            controller.enqueue(encoder.encode(dataString));

                                            // 처리된 JSON 블록을 버퍼에서 제거
                                            buffer = buffer.replace(fullMatch, '');
                                        } else {
                                            console.warn('⚠️ [Question] 불완전한 JSON 데이터:', questionData);
                                        }
                                    } catch (parseError) {
                                        console.warn('⚠️ [Question] JSON 파싱 실패:', {
                                            jsonContent: jsonContent.substring(0, 100),
                                            error: parseError
                                        });
                                    }
                                }
                            }

                            // 질문이 5개에 도달하면 스트림 종료
                            if (questionCount >= 5) {
                                console.log('🎯 [Question] 최대 질문 수(5개) 도달, 스트림 종료');
                                break;
                            }
                        }
                    }

                    console.log(`🎯 [Question] 총 ${questionCount}개 질문 처리 완료`);

                    // documentId가 있으면 자동 저장
                    if (documentId && accumulatedQuestions.length > 0) {
                        console.log('💾 [Question] 자동 저장 시작');
                        try {
                            const saveResult = await updateAnalyzedInfo(documentId, {
                                qna: accumulatedQuestions
                            });

                            if (saveResult.success) {
                                console.log('✅ [Question] 자동 저장 성공:', saveResult.documentPath);
                            } else {
                                console.error('❌ [Question] 자동 저장 실패:', saveResult.error);
                            }
                        } catch (saveError) {
                            console.error('❌ [Question] 자동 저장 오류:', saveError);
                            // 저장 실패해도 스트림은 정상 완료 처리 (저장은 부가 기능)
                        }
                    }

                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();

                } catch (error: any) {
                    console.error('❌ [Question] 스트림 오류:', error);

                    // 429 에러 특별 처리
                    if (error?.status === 429) {
                        const errorData = `data: ${JSON.stringify({ error: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' })}\n\n`;
                        controller.enqueue(encoder.encode(errorData));
                    } else {
                        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
                        const errorData = `data: ${JSON.stringify({ error: errorMessage })}\n\n`;
                        controller.enqueue(encoder.encode(errorData));
                    }

                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error: any) {
        console.error('❌ [Question API] 처리 실패:', error);

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
            { error: '면접 질문 생성 실패', details: error instanceof Error ? error.message : '알 수 없는 오류' },
            { status: 500 }
        );
    }
} 