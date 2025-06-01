/**
 * API 요청 관련 유틸리티 함수들
 */

// Rate limiting을 위한 sleep 함수
export async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Exponential backoff를 사용한 재시도 로직
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            // 429 에러인 경우에만 재시도
            if (error?.status === 429 && attempt < maxRetries) {
                // Exponential backoff: 1초, 2초, 4초, 8초...
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`⏳ [RetryBackoff] Rate limit 도달, ${delay}ms 후 재시도 (${attempt + 1}/${maxRetries})`);
                await sleep(delay);
                continue;
            }
            throw error;
        }
    }
    throw new Error('최대 재시도 횟수 초과');
}

// API 에러 응답 생성 헬퍼
export function createApiErrorResponse(error: any, defaultMessage: string = '서버 오류가 발생했습니다') {
    // 429 에러 특별 처리
    if (error?.status === 429) {
        return {
            error: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
            retryAfter: '60초 후 재시도 가능',
            status: 429
        };
    }

    return {
        error: defaultMessage,
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        status: 500
    };
}

// 스트림 에러 메시지 생성
export function createStreamErrorMessage(error: any): string {
    if (error?.status === 429) {
        return 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
    }

    return error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
} 