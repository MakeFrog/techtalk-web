import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        console.log('🚀 [Question API] 요청 시작');

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

        // 인사이트 생성 모델 - Gemini 2.0 Flash
        const insightsModel = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        });

        // 인사이트 프롬프트
        const insightsPrompt = `
다음 기술 블로그 글에서 핵심 인사이트 3개를 추출하세요.

제목: ${title}
원문: ${content}

각 인사이트는 한 줄로 작성하고, "- "로 시작하세요.
`;

        console.log('💡 [Question] 인사이트 생성 시작');
        const insightsResponse = await insightsModel.generateContent(insightsPrompt);
        const insights = insightsResponse.response.text()
            .trim()
            .split('\n')
            .map(line => line.replace(/^-\s*/, '').trim())
            .filter(line => line.length > 0)
            .slice(0, 3);

        console.log('💡 [Question] 생성된 인사이트:', insights);

        // 질문 생성 모델 - Gemini 2.0 Flash
        const questionModel = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        });

        const jsonExample = `{
   "qnas": [
    { 
      "question": "면접 질문",
      "answer": "모범 답안"
    }
    ]
}`;

        const prompt = `기술 블로그의 제목과 원문을 내용을 바탕으로 기술 면접 질문과 모범답안을 작성하세요.
기술 블로그 글에서 다루는 '프로그래밍 개념'을 독자가 이해했는지 확인하기 위한 질문입니다.

### 📚 핵심 인사이트
${insights.map(insight => `- ${insight}`).join('\n')}

### ✅ 작성 규칙
   - **5개의 면접 질문과 모범답변을**를 제시하되, 상황에 따라 2개에서 6개까지 허용해요.
   - 먼저, 제공된 **제목**과 **원문** 정보를 토대로 **핵심 요약 내용**을 파악하세요.
   - 이 **핵심 요약 내용**에서 **직접 언급되는 프로그래밍 개념을 바탕으로, **실제 면접 사용될 수 있는 심화 질문**을 만들어 주세요.  
   - 위의 **핵심 인사이트**를 참고하여, 각 인사이트와 관련된 심화 질문을 포함해주세요.
   - 독자의 경험을 물어보는 질문 보다는 '프로그래밍 개념'을 물어보는 질문으로 구성되어야 합니다.
   - 각 질문에는 **명확하고 1,2줄 이내의 모범 답안**을 작성하세요
   - \`question\`에는 번호를 매기지 않고 질문 내용으로 구성되어야 합니다.  
   - 질문이 전혀 성립하지 않거나 적절한 질문을 구성할 수 없을 경우, **빈 배열(\`[]\`)**을 반환하세요.

### 📝 출력 형식    
아래 JSON 형식 그대로, 설명이나 주석 없이 **JSON만** 반환해주세요.
\`\`\`json
${jsonExample}
\`\`\`

### 📥 입력 데이터
제목: ${title}

원문:   
${content}

### ⚠️ 중요
- 반드시 JSON 형식으로만 응답하세요.
- 다른 설명이나 텍스트는 포함하지 마세요.
- \`\`\`json과 \`\`\` 사이에 JSON만 포함되어야 합니다.`;

        console.log('🚀 [Question] 질문 생성 시작 (Gemini 2.0 Flash)');
        const result = await questionModel.generateContent(prompt);
        const responseText = result.response.text();

        console.log('📨 [Question] 원본 응답:', responseText);

        // JSON 추출
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (!jsonMatch) {
            throw new Error('JSON 형식을 찾을 수 없습니다');
        }

        const jsonString = jsonMatch[1].trim();
        console.log('🔍 [Question] 추출된 JSON:', jsonString);

        const questionData = JSON.parse(jsonString);
        console.log('✅ [Question] 파싱된 데이터:', questionData);

        return NextResponse.json(questionData);

    } catch (error) {
        console.error('❌ [Question API] 처리 실패:', error);
        return NextResponse.json(
            { error: '면접 질문 생성 실패', details: error instanceof Error ? error.message : '알 수 없는 오류' },
            { status: 500 }
        );
    }
} 