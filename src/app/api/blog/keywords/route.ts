import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        console.log('🔍 [Keywords API] 요청 시작');

        const { title, text } = await request.json();
        console.log('📥 [Keywords API] 요청 데이터:', {
            titleLength: title?.length,
            textLength: text?.length
        });

        if (!title || !text) {
            console.log('❌ [Keywords API] 필수 데이터 누락');
            return NextResponse.json(
                { error: '제목과 본문이 필요합니다.' },
                { status: 400 }
            );
        }

        console.log('🔑 [Keywords API] API 키 확인:', !!process.env.GEMINI_API_KEY);

        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ [Keywords API] GEMINI_API_KEY 환경변수 없음');
            return NextResponse.json(
                { error: 'API 키가 설정되지 않았습니다.' },
                { status: 500 }
            );
        }

        // Gemini Flash 2.0 모델 설정
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2000,
            }
        });

        const keywordsJsonExample = `{
  "keywords": [
    {
      "keyword": "(키워드)",
      "description": "(키워드 설명)"
    }
  ]
}`;

        const keywordsPrompt = `
당신은 기술 블로그 전문 요약가로서, **제목과 원문**을 바탕으로 프로그래밍 개념 키워드와 설명을 추출해야 합니다.

### 🎯 목표
- 글에서 다루는 핵심 프로그래밍 개념(키워드)들을 식별합니다.
- 각 개념에 대해 독자가 쉽게 이해할 수 있도록 명확한 설명을 제공합니다.

### ✅ 작성 규칙
- 글에 맥락에 따라 최대 12개 까지의 핵심 프로그래밍 개념 키워드를 추출합니다.
- 각 개념은 keyword와 description으로 구성됩니다.
- keyword는 정확한 기술 용어를 사용합니다.
- description은 1-2문장으로 개념의 핵심을 명확히 설명합니다.
- 필요에 따라 글의 맥락에서 해당 개념이 어떻게 사용되는지 포함합니다.

### 📝 출력 형식
아래 JSON 형식 그대로, 설명이나 주석 없이 **JSON만** 반환해주세요.
\`\`\`json
${keywordsJsonExample}
\`\`\`

### 📥 입력 데이터
제목: ${title}

원문:   
${text}

### ⚠️ 중요
- 반드시 JSON 형식으로만 응답하세요.
- 다른 설명이나 텍스트는 포함하지 마세요.
- \`\`\`json과 \`\`\` 사이에 JSON만 포함되어야 합니다.
`;

        console.log('🚀 [Keywords API] Gemini 호출 시작');
        const result = await model.generateContent(keywordsPrompt);
        console.log('✅ [Keywords API] Gemini 응답 받음');

        const response = await result.response;
        const responseText = response.text();
        console.log('📝 [Keywords API] 응답 텍스트 길이:', responseText.length);

        // JSON 추출 (```json과 ``` 사이의 내용)
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (!jsonMatch) {
            console.error('❌ [Keywords API] JSON 파싱 실패, 응답:', responseText.substring(0, 200));
            throw new Error('유효한 JSON 응답을 받지 못했습니다.');
        }

        console.log('🎯 [Keywords API] JSON 추출 성공');
        const keywordsData = JSON.parse(jsonMatch[1]);
        console.log('✅ [Keywords API] 성공 완료, 키워드 수:', keywordsData.keywords?.length);

        return NextResponse.json(keywordsData);
    } catch (error) {
        console.error('❌ [Keywords API] 전체 오류:', error);
        console.error('❌ [Keywords API] 오류 상세:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
            { error: '프로그래밍 키워드 추출 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
} 