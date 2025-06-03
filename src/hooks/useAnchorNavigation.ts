import { useCallback, useEffect, useState } from 'react';
import { isBrowser, safeGetLocation, safeScrollIntoView } from '@/utils/clientUtils';

/**
 * 앵커 네비게이션을 위한 커스텀 훅
 */
export const useAnchorNavigation = () => {
    const [isClient, setIsClient] = useState(false);

    // 클라이언트 사이드에서만 실행되도록 보장
    useEffect(() => {
        setIsClient(true);
    }, []);

    /**
     * 특정 앵커로 부드럽게 스크롤하고 URL hash를 업데이트
     * @param anchorId 이동할 앵커 ID
     */
    const scrollToAnchor = useCallback((anchorId: string) => {
        if (!isClient || !isBrowser()) return;

        try {
            // URL hash 업데이트 (안전하게)
            if (window.history && window.history.pushState) {
                window.history.pushState(null, '', `#${anchorId}`);
            }

            // 안전한 스크롤
            safeScrollIntoView(anchorId, {
                behavior: 'smooth',
                block: 'start',
            });
        } catch (error) {
            console.warn('앵커 스크롤 실패:', error);
        }
    }, [isClient]);

    /**
     * 현재 URL의 hash로 초기 스크롤 실행
     */
    const scrollToCurrentHash = useCallback(() => {
        if (!isClient || !isBrowser()) return;

        try {
            const location = safeGetLocation();
            const hash = location.hash.slice(1); // '#' 제거

            if (hash) {
                // 약간의 지연 후 스크롤 (DOM 렌더링 완료 보장)
                setTimeout(() => {
                    scrollToAnchor(hash);
                }, 100);
            }
        } catch (error) {
            console.warn('초기 hash 스크롤 실패:', error);
        }
    }, [scrollToAnchor, isClient]);

    return {
        scrollToAnchor,
        scrollToCurrentHash,
        isClient, // 클라이언트 상태 노출
    };
}; 