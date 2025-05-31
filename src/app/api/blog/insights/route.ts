import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
        const prompt = `다음 블로그 글을 분석하여 3-4줄의 핵심 인사이트를 한국어로 작성해주세요. 
마크다운 형식을 사용하여 중요한 부분은 **굵게**, 코드나 기술 용어는 \`백틱\`으로 표시해주세요.

제목: ${title}

내용: ${text}

요구사항:
- 3-4줄의 간결한 핵심 요약
- 기술적 내용의 핵심 포인트 강조    
- 실용적인 가이드라인이나 베스트 프랙티스 언급
- 한국어로 자연스럽게 작성`;

        console.log('🚀 [Gemini Insights] Flash 2.0 스트리밍 시작');

        // 스트리밍 응답 생성
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    console.log('🔄 [Gemini Insights] 스트림 처리 시작');

                    // Gemini 스트리밍 요청
                    const result = await model.generateContentStream(prompt);

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
                } catch (error) {
                    console.error('❌ [Gemini Insights] 스트림 오류:', error);
                    controller.error(error);
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

    } catch (error) {
        console.error('❌ [Gemini Insights API] 전체 오류:', error);
        console.error('❌ [Gemini Insights API] 오류 스택:', error instanceof Error ? error.stack : 'Unknown');

        return NextResponse.json(
            {
                error: '인사이트 생성에 실패했습니다.',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 