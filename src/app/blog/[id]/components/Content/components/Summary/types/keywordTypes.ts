export interface ProgrammingKeyword {
    keyword: string;
    description: string;
}

export interface KeywordsResponse {
    keywords: ProgrammingKeyword[];
}

export interface KeywordsRequest {
    title: string;
    text: string;
} 