// 스트리밍 관련 타입 정의

export interface InterviewQA {
    question: string;
    answer: string;
}

// 스트리밍 상태를 나타내는 Discriminated Union
export type StreamState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'streaming'; insights: string[]; interviewQA: InterviewQA[] }
    | { status: 'completed'; insights: string[]; interviewQA: InterviewQA[] }
    | { status: 'error'; message: string }; 