import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

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
                console.log(`⏳ [Question] Rate limit 도달, ${delay}ms 후 재시도 (${attempt + 1}/${maxRetries})`);
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

        const { title, content } = await request.json();

        if (!title || !content) {
            return NextResponse.json(
                { error: 'title과 content가 필요합니다.' },
                { status: 400 }
            );
        }

        console.log('📋 [Question API] 요청 데이터:', {
            title: title.substring(0, 50) + '...',
            textLength: content.length
        });

        // Gemini 2.0 Flash 모델 설정
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        });

        // 스트림용 프롬프트 - 질문을 하나씩 생성
        const streamPrompt = `기술 블로그의 제목과 원문을 내용을 바탕으로 기술 면접 질문과 모범답안을 작성하세요.
기술 블로그 글에서 다루는 '프로그래밍 개념'을 독자가 이해했는지 확인하기 위한 질문입니다.

### ✅ 작성 규칙
- 최소 2개, 최대 **6개의** 핵심 면접 질문을 생성하세요. 6개를 넘기면 **오류**입니다. (중요)
- 먼저, 제공된 **제목**과 **원문** 정보를 토대로 **핵심 요약 내용**을 파악하세요.
- 이 **핵심 요약 내용**에서 **직접 언급되는 프로그래밍 개념을 바탕으로, **실제 면접에 사용될 수 있는 심화 질문**을 만들어 주세요.
- 기술 블로그에서 다루고 있지 않는 내용은 질문으로 생성하지 않습니다.
- 독자의 경험을 물어보는 질문 보다는 '프로그래밍 개념'을 물어보는 질문으로 구성되어야 합니다.
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
- 각 질문마다 개별 JSON 블록으로 출력
- 다른 설명 텍스트 없이 JSON만 출력
- 질문이 생성될 때마다 즉시 출력
- 적절한 질문을 구성할 수 없다면 생성을 중단하고 종료

### 📥 입력 데이터
**제목**: ${title}

**원문**: ${content}

위 내용을 바탕으로 핵심 요약을 파악한 후, 프로그래밍 개념 중심의 면접 질문을 순차적으로 생성해주세요:`;

        console.log('🚀 [Question] 스트림 처리 시작');

        // 스트림 응답 설정
        const encoder = new TextEncoder();
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
                    let chunkCount = 0;
                    const processedJsonBlocks = new Set<string>(); // 중복 처리 방지

                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        if (chunkText) {
                            chunkCount++;
                            buffer += chunkText;

                            console.log('📨 [Question] 청크 수신:', {
                                chunkNumber: chunkCount,
                                chunkLength: chunkText.length,
                                bufferLength: buffer.length,
                                questionCount,
                                preview: chunkText.substring(0, 100) + '...'
                            });

                            // JSON 블록 추출 시도 - 개선된 정규식
                            const jsonMatches = [...buffer.matchAll(/```json\s*(\{[\s\S]*?\})\s*```/g)];

                            if (jsonMatches.length > 0) {
                                console.log(`🔍 [Question] ${jsonMatches.length}개 JSON 블록 발견 (청크 ${chunkCount})`);

                                for (const match of jsonMatches) {
                                    const fullMatch = match[0];
                                    const jsonContent = match[1].trim();

                                    // 이미 처리된 JSON 블록은 건너뛰기
                                    if (processedJsonBlocks.has(jsonContent)) {
                                        console.log('⏭️ [Question] 이미 처리된 JSON 블록 건너뛰기');
                                        continue;
                                    }

                                    try {
                                        const questionData = JSON.parse(jsonContent);

                                        if (questionData.question && questionData.answer) {
                                            questionCount++;
                                            processedJsonBlocks.add(jsonContent); // 처리된 블록으로 표시

                                            console.log(`✨ [Question] ${questionCount}번째 질문 전송:`, {
                                                question: questionData.question.substring(0, 50) + '...',
                                                answer: questionData.answer.substring(0, 30) + '...',
                                                jsonLength: jsonContent.length,
                                                bufferLength: buffer.length
                                            });

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
                                            error: parseError instanceof Error ? parseError.message : parseError
                                        });
                                    }
                                }
                            }

                            // 6개 질문이 생성되면 조기 종료 (최대 허용)
                            if (questionCount >= 6) {
                                console.log('🎯 [Question] 최대 질문 수(6개) 달성, 스트림 종료');
                                break;
                            }
                        } else {
                            console.log('📭 [Question] 빈 청크 수신');
                        }
                    }

                    // 스트림 종료 후 상태 확인
                    console.log(`✅ [Question] 스트림 완료 - 총 ${questionCount}개 질문 생성 (권장: 2-6개)`);
                    console.log(`📊 [Question] 처리 통계:`, {
                        totalChunks: chunkCount,
                        questionsGenerated: questionCount,
                        uniqueJsonBlocks: processedJsonBlocks.size,
                        bufferRemaining: buffer.length
                    });

                    // 질문이 하나도 생성되지 않은 경우 경고
                    if (questionCount === 0) {
                        console.warn(`⚠️ [Question] 질문이 생성되지 않음 - 콘텐츠에 적절한 프로그래밍 개념이 없을 수 있음`);
                        console.warn(`🔍 [Question] 전체 버퍼 내용:`, buffer.substring(0, 500));
                    }

                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();

                } catch (error: any) {
                    console.error('❌ [Question] 스트림 오류:', error);

                    // 429 에러 특별 처리
                    if (error?.status === 429) {
                        const errorMessage = 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
                        controller.enqueue(encoder.encode(`data: {"error": "${errorMessage}"}\n\n`));
                    } else {
                        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
                        controller.enqueue(encoder.encode(`data: {"error": "${errorMessage}"}\n\n`));
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