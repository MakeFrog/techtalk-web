'use client';

import React from 'react';
import { useTechSetCache } from '@/domains/techset/hooks/useTechSetCache';

interface TechSetCacheProviderProps {
    children: React.ReactNode;
}

/**
 * TechSet 캐시를 백그라운드에서 초기화하는 프로바이더
 * 
 * toss-frontend 가이드라인에 따른 개선:
 * - 로딩 상태는 사용자에게 보여주지 않음 (백그라운드 로딩)
 * - 캐시 실패해도 웹사이트 동작에 영향 없음
 * - 예측 가능한 상태 관리 (Discriminated Union)
 */
export function TechSetCacheProvider({ children }: TechSetCacheProviderProps) {
    // 백그라운드에서 캐시 초기화 (UI에 영향 없음)
    const cacheResult = useTechSetCache();

    // 개발 환경에서만 콘솔에 상태 로깅
    if (process.env.NODE_ENV === 'development') {
        if (cacheResult.status === 'error') {
            console.warn('⚠️ [TechSetCache] 캐시 로딩 실패:', cacheResult.error);
            console.warn('⚠️ [TechSetCache] TechSet 이름이 ID로 표시됩니다.');
        } else if (cacheResult.status === 'success') {
            console.log('✅ [TechSetCache] 캐시 로딩 완료');
        }
    }

    // 캐시 상태와 관계없이 항상 자식 컴포넌트 렌더링
    // TechSet 실패해도 웹사이트는 정상 동작
    return <>{children}</>;
} 