'use client';

import { createContext, useContext, ReactNode } from 'react';

// Discriminated Union 타입으로 상태 정의
type BlogDataState =
    | { status: 'loading' }
    | { status: 'success'; documentId: string }
    | { status: 'not-found' }
    | { status: 'error'; error: string };

interface BlogDataContextValue {
    state: BlogDataState;
    documentId: string | null;
}

const BlogDataContext = createContext<BlogDataContextValue | null>(null);

interface BlogDataProviderProps {
    children: ReactNode;
    documentId: string;
    documentExists: boolean;
}

/**
 * 블로그 documentId와 문서 존재 여부를 자식 컴포넌트들에게 제공하는 Provider
 * toss-frontend 가이드라인: Discriminated Union과 단일 책임 원칙 준수
 */
export function BlogDataProvider({
    children,
    documentId,
    documentExists
}: BlogDataProviderProps) {
    const state: BlogDataState = documentExists
        ? { status: 'success', documentId }
        : { status: 'not-found' };

    const contextValue: BlogDataContextValue = {
        state,
        documentId: documentExists ? documentId : null
    };

    return (
        <BlogDataContext.Provider value={contextValue}>
            {children}
        </BlogDataContext.Provider>
    );
}

/**
 * BlogDataContext를 사용하는 훅
 * 예측 가능한 반환 타입과 안전한 접근 보장
 */
export function useBlogData(): BlogDataContextValue {
    const context = useContext(BlogDataContext);

    if (context === null) {
        throw new Error('useBlogData must be used within BlogDataProvider');
    }

    return context;
} 