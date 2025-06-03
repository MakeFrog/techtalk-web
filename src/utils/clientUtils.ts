/**
 * 클라이언트 사이드 유틸리티 함수들
 * Hydration 오류 방지와 모바일 최적화를 위한 함수들
 */

/**
 * 브라우저 환경인지 안전하게 확인
 */
export function isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * 모바일 디바이스인지 확인
 */
export function isMobileDevice(): boolean {
    if (!isBrowser()) return false;

    try {
        // User Agent 기반 모바일 감지
        const userAgent = navigator.userAgent;
        const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        const isMobileUA = mobileRegex.test(userAgent);

        // 화면 크기 기반 모바일 감지
        const isMobileScreen = window.innerWidth <= 768;

        // Touch 지원 여부
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        return isMobileUA || (isMobileScreen && isTouchDevice);
    } catch {
        return false;
    }
}

/**
 * 안전한 sessionStorage 접근
 */
export function safeSessionStorage() {
    if (!isBrowser()) {
        return {
            getItem: () => null,
            setItem: () => { },
            removeItem: () => { },
            clear: () => { },
        };
    }

    try {
        // sessionStorage 사용 가능 여부 테스트
        const testKey = '__test__';
        sessionStorage.setItem(testKey, 'test');
        sessionStorage.removeItem(testKey);

        return sessionStorage;
    } catch {
        // sessionStorage 사용 불가능한 경우 fallback
        return {
            getItem: () => null,
            setItem: () => { },
            removeItem: () => { },
            clear: () => { },
        };
    }
}

/**
 * 안전한 localStorage 접근
 */
export function safeLocalStorage() {
    if (!isBrowser()) {
        return {
            getItem: () => null,
            setItem: () => { },
            removeItem: () => { },
            clear: () => { },
        };
    }

    try {
        // localStorage 사용 가능 여부 테스트
        const testKey = '__test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);

        return localStorage;
    } catch {
        // localStorage 사용 불가능한 경우 fallback
        return {
            getItem: () => null,
            setItem: () => { },
            removeItem: () => { },
            clear: () => { },
        };
    }
}

/**
 * 안전한 document 이벤트 리스너 추가
 */
export function safeAddEventListener(
    element: Document | Window | Element | null,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
): (() => void) | null {
    if (!isBrowser() || !element || typeof element.addEventListener !== 'function') {
        return null;
    }

    try {
        element.addEventListener(event, handler, options);

        // cleanup 함수 반환
        return () => {
            if (element && typeof element.removeEventListener === 'function') {
                element.removeEventListener(event, handler, options);
            }
        };
    } catch {
        return null;
    }
}

/**
 * 안전한 window.location 접근
 */
export function safeGetLocation() {
    if (!isBrowser()) {
        return {
            href: '',
            hash: '',
            pathname: '',
            search: '',
            host: '',
            hostname: '',
            port: '',
            protocol: '',
        };
    }

    try {
        return {
            href: window.location.href,
            hash: window.location.hash,
            pathname: window.location.pathname,
            search: window.location.search,
            host: window.location.host,
            hostname: window.location.hostname,
            port: window.location.port,
            protocol: window.location.protocol,
        };
    } catch {
        return {
            href: '',
            hash: '',
            pathname: '',
            search: '',
            host: '',
            hostname: '',
            port: '',
            protocol: '',
        };
    }
}

/**
 * 안전한 스크롤 동작
 */
export function safeScrollTo(options: ScrollToOptions | number, y?: number): void {
    if (!isBrowser()) return;

    try {
        if (typeof options === 'number') {
            window.scrollTo(options, y || 0);
        } else {
            window.scrollTo(options);
        }
    } catch (error) {
        console.warn('스크롤 동작 실패:', error);
    }
}

/**
 * 안전한 요소 스크롤
 */
export function safeScrollIntoView(
    elementId: string,
    options?: ScrollIntoViewOptions
): void {
    if (!isBrowser()) return;

    try {
        const element = document.getElementById(elementId);
        if (element && typeof element.scrollIntoView === 'function') {
            element.scrollIntoView(options);
        }
    } catch (error) {
        console.warn(`요소 스크롤 실패 (${elementId}):`, error);
    }
} 