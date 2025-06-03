'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useTechSetCache } from '@/domains/techset/hooks/useTechSetCache';

// Context 생성
const TechSetCacheContext = createContext<ReturnType<typeof useTechSetCache> | null>(null);

interface TechSetCacheProviderProps {
    children: ReactNode;
}

/**
 * 기술 스택 캐시를 애플리케이션 전체에서 사용할 수 있도록 제공하는 Provider
 * 앱 시작 시 한 번만 초기화되어 모든 컴포넌트에서 캐시된 데이터 사용
 */
export function TechSetCacheProvider({ children }: TechSetCacheProviderProps) {
    const cacheState = useTechSetCache();

    // 개발 환경에서만 로그 출력
    if (process.env.NODE_ENV === 'development') {
        console.log('🎯 [TechSetCacheProvider] 상태:', {
            status: cacheState.status,
            error: cacheState.error
        });
    }

    return (
        <TechSetCacheContext.Provider value={cacheState}>
            {children}
        </TechSetCacheContext.Provider>
    );
}

/**
 * TechSetCacheProvider에서 제공하는 캐시 상태를 사용하는 Hook
 */
export function useTechSetCacheContext() {
    const context = useContext(TechSetCacheContext);
    if (!context) {
        throw new Error('useTechSetCacheContext는 TechSetCacheProvider 내부에서만 사용할 수 있습니다.');
    }
    return context;
} 