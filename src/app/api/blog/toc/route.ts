import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        console.log('🔍 [TOC API] 요청 시작');

        const { title, text } = await request.json();
        console.log('📥 [TOC API] 요청 데이터:', {
            titleLength: title?.length,
            textLength: text?.length
        });

        if (!title || !text) {
            console.log('❌ [TOC API] 필수 데이터 누락');
            return NextResponse.json(
                { error: '제목과 본문이 필요합니다.' },
                { status: 400 }
            );
        }

        console.log('🔑 [TOC API] API 키 확인:', !!process.env.GEMINI_API_KEY);

        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ [TOC API] GEMINI_API_KEY 환경변수 없음');
            return NextResponse.json(
                { error: 'API 키가 설정되지 않았습니다.' },
                { status: 500 }
            );
        }

        // Gemini Flash 2.0 모델 설정
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 1.0,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1000,
            }
        });

        const jsonExample = `{
  "toc": [
    "(이모지) (목차1)",
    "(이모지) (목차2)"
  ]
}`;

        const tocPrompt = `
당신은 프로그래밍 강사입니다.
주어진 기술 블로그의 '제목'과 '원문' 내용'을 바탕으로 학생들이 쉽게 학습할 수 있도록 최종 출력 형식에 맞게 **목차**를 생성해야 합니다.

### 목차
- 원문 글의 내용의 흐름과 상관없이 학생이 글을 체계적으로 학습할 수 있도록 논리적인 순서로 목차를 구성합니다.
- 각 목차는 필요에 따라 원문 글에서 다루고 있는 **문제 정의**, **기술적인 고민**, **해결 방법**에 대한 흐름을 적절히 포함할 수 있도록 합니다.
- 각 목차는 핵심 내용과 프로그래밍 개념을 명확히 드러내야 합니다.
- 아래와 같은 내용을 포함하지만 구분자('.' ':' 등)같은 구분자를 절대 사용하지 않습니다.
- 직접 설명하듯이 이어지는 하나의 이어지는 간략한 문장으로 간략하게 구성합니다.


### 작성 규칙   
- 원문을 학습하기 좋은 구조로 재배열한 **새 목차(3~6개)** 를 만든다.
- 각 목차는은 '🏷️ 제목' 형식으로 반환한다.(이모지) (제목) 
  - 🏷️은 글 맥락에 맞는 단일 이모지(🎯🖱️⚙️📱 등)  


### 출력 형식
아래 JSON 형식 그대로, 설명이나 주석 없이 **JSON만** 반환해주세요.
\`\`\`json
${jsonExample}
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

        console.log('🚀 [TOC API] Gemini 호출 시작');
        const result = await model.generateContent(tocPrompt);
        console.log('✅ [TOC API] Gemini 응답 받음');

        const response = await result.response;
        const responseText = response.text();
        console.log('📝 [TOC API] 응답 텍스트 길이:', responseText.length);

        // JSON 추출 (```json과 ``` 사이의 내용)
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (!jsonMatch) {
            console.error('❌ [TOC API] JSON 파싱 실패, 응답:', responseText.substring(0, 200));
            throw new Error('유효한 JSON 응답을 받지 못했습니다.');
        }

        console.log('🎯 [TOC API] JSON 추출 성공');
        const tocData = JSON.parse(jsonMatch[1]);
        console.log('✅ [TOC API] 성공 완료, 목차 수:', tocData.toc?.length);

        return NextResponse.json(tocData);
    } catch (error) {
        console.error('❌ [TOC API] 전체 오류:', error);
        console.error('❌ [TOC API] 오류 상세:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
            { error: '목차 생성 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
} 