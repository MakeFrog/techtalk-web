import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { updateAnalyzedInfo, checkFieldExists } from '@/domains/blog/services/analyzedInfoService';
import { generateInsightStream } from '@/domains/blog/services/geminiService';


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

interface InsightRequest {
    title: string;
    text: string;
    documentId?: string; // API 레이어에서 자동 저장을 위한 documentId
}

/**
 * 블로그 인사이트 생성 및 스트리밍 API
 * 
 * 가이드라인 준수:
 * - 단일 책임: 인사이트 생성과 스트리밍만 담당
 * - 예측 가능성: POST 요청으로 인사이트 생성 동작 명확
 * - 숨겨진 로직 없음: documentId가 있으면 저장, 명시적으로 표현
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const { title, text, documentId }: InsightRequest = await request.json();

        console.log('📊 [Insights API] 요청 받음:', {
            title: title?.substring(0, 50) + '...',
            textLength: text?.length,
            hasDocumentId: !!documentId
        });

        // 입력 검증
        if (!title || !text) {
            console.error('❌ [Insights API] 입력 데이터 누락');
            return NextResponse.json(
                { error: 'title과 text는 필수입니다.' },
                { status: 400 }
            );
        }

        // documentId가 있으면 기존 데이터 확인
        if (documentId) {
            console.log('🔍 [Insights API] 기존 인사이트 확인 중:', documentId);

            const existsResult = await checkFieldExists(documentId, 'insight');
            if (existsResult.exists) {
                console.log('✅ [Insights API] 기존 인사이트 발견, 저장된 데이터 반환');

                return NextResponse.json(
                    {
                        message: '기존 저장된 인사이트를 사용합니다.',
                        useExisting: true,
                        data: existsResult.data // 실제 저장된 데이터 포함
                    },
                    { status: 200 }
                );
            }
            console.log('📭 [Insights API] 기존 인사이트 없음, 새로 생성');
        }

        // ReadableStream 생성
        const stream = new ReadableStream({
            async start(controller) {
                let accumulatedContent = '';

                try {
                    console.log('🤖 [Insights API] Gemini 스트림 시작');

                    // Gemini 서비스에서 스트림 생성 및 처리
                    for await (const chunk of generateInsightStream(title, text)) {
                        accumulatedContent += chunk;

                        // 클라이언트로 청크 전송
                        const encoder = new TextEncoder();
                        controller.enqueue(encoder.encode(chunk));

                        console.log('📨 [Insights API] 청크 전송:', {
                            chunkLength: chunk.length,
                            totalLength: accumulatedContent.length
                        });
                    }

                    console.log('✅ [Insights API] 스트림 완료');

                    // documentId가 있으면 Firestore에 저장
                    if (documentId && accumulatedContent.trim()) {
                        console.log('💾 [Insights API] Firestore 저장 시작:', documentId);

                        const saveResult = await updateAnalyzedInfo(documentId, {
                            insight: accumulatedContent.trim()
                        });

                        if (saveResult.success) {
                            console.log('✅ [Insights API] Firestore 저장 성공');
                        } else {
                            console.error('❌ [Insights API] Firestore 저장 실패:', saveResult.error);
                        }
                    }

                } catch (error) {
                    console.error('❌ [Insights API] 스트림 생성 오류:', error);

                    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
                    const encoder = new TextEncoder();
                    controller.enqueue(encoder.encode(`\n\n오류: ${errorMessage}`));
                } finally {
                    controller.close();
                }
            }
        });

        // 스트리밍 응답 반환
        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error('❌ [Insights API] 전체 오류:', error);

        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        return NextResponse.json(
            { error: `서버 오류: ${errorMessage}` },
            { status: 500 }
        );
    }
} 