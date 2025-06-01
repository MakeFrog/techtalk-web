import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        const { title, text } = await request.json();

        if (!title || !text) {
            return NextResponse.json(
                { error: '제목과 본문이 필요합니다.' },
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

        const jsonExample = `{
  "toc": [
    "🤔 (목차1)",
    "🧩 (목차2)"
  ]
}`;

        const tocPrompt = `
당신은 기술 블로그 전문 요약가로서, **제목과 원문**을 바탕으로 학습 최적화된 목차를 생성해야 합니다.

### 🎯 목표
- 독자가 글을 체계적으로 학습할 수 있도록 논리적인 순서로 목차를 구성합니다.
- 각 목차 항목은 핵심 개념과 해결책을 명확히 드러내야 합니다.

### ✅ 작성 규칙
- **5개의 목차 항목**을 제시하되, 상황에 따라 3개에서 10개까지 허용합니다.
- 각 목차는 "(이모지) (제목)" 형식으로 작성합니다.
- 목차 제목은 핵심 개념과 해결방안이 명확히 드러나야 합니다.
- 학습자가 단계별로 이해할 수 있는 논리적 순서를 유지합니다.

### 📝 출력 형식
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

        const result = await model.generateContent(tocPrompt);
        const response = await result.response;
        const responseText = response.text();

        // JSON 추출 (```json과 ``` 사이의 내용)
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (!jsonMatch) {
            throw new Error('유효한 JSON 응답을 받지 못했습니다.');
        }

        const tocData = JSON.parse(jsonMatch[1]);

        return NextResponse.json(tocData);
    } catch (error) {
        console.error('TOC 생성 중 오류:', error);
        return NextResponse.json(
            { error: '목차 생성 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
} 