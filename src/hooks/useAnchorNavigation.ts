import { useCallback } from 'react';

/**
 * 앵커 네비게이션을 위한 커스텀 훅
 */
export const useAnchorNavigation = () => {
    /**
     * 특정 앵커로 부드럽게 스크롤하고 URL hash를 업데이트
     * @param anchorId 이동할 앵커 ID
     */
    const scrollToAnchor = useCallback((anchorId: string) => {
        const element = document.getElementById(anchorId);

        if (element) {
            // URL hash 업데이트
            window.history.pushState(null, '', `#${anchorId}`);

            // 부드러운 스크롤
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, []);

    /**
     * 현재 URL의 hash로 초기 스크롤 실행
     */
    const scrollToCurrentHash = useCallback(() => {
        const hash = window.location.hash.slice(1); // '#' 제거
        if (hash) {
            // 약간의 지연 후 스크롤 (DOM 렌더링 완료 보장)
            setTimeout(() => {
                scrollToAnchor(hash);
            }, 100);
        }
    }, [scrollToAnchor]);

    return {
        scrollToAnchor,
        scrollToCurrentHash,
    };
}; 