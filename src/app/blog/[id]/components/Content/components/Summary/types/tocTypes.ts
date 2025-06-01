export interface TocResponse {
    toc: string[];
}

export interface TocItem {
    id: number;
    title: string;
}

export interface TocRequest {
    title: string;
    text: string;
} 