/**
 * 간단한 메모리 캐시 구현
 * API 호출을 줄여 rate limiting 문제를 완화
 */

interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiresIn: number;
}

class MemoryCache {
    private cache: Map<string, CacheItem<any>> = new Map();

    // 캐시에 데이터 저장
    set<T>(key: string, data: T, expiresInMs: number = 5 * 60 * 1000): void {
        const item: CacheItem<T> = {
            data,
            timestamp: Date.now(),
            expiresIn: expiresInMs
        };

        this.cache.set(key, item);
        console.log(`💾 [Cache] 저장됨: ${key} (${expiresInMs}ms 후 만료)`);
    }

    // 캐시에서 데이터 조회
    get<T>(key: string): T | null {
        const item = this.cache.get(key);

        if (!item) {
            console.log(`📭 [Cache] 캐시 미스: ${key}`);
            return null;
        }

        // 만료 체크
        const now = Date.now();
        if (now - item.timestamp > item.expiresIn) {
            console.log(`⏰ [Cache] 만료된 캐시 삭제: ${key}`);
            this.cache.delete(key);
            return null;
        }

        console.log(`✅ [Cache] 캐시 히트: ${key}`);
        return item.data as T;
    }

    // 특정 키의 캐시 삭제
    delete(key: string): void {
        this.cache.delete(key);
        console.log(`🗑️ [Cache] 삭제됨: ${key}`);
    }

    // 전체 캐시 클리어
    clear(): void {
        this.cache.clear();
        console.log(`🧹 [Cache] 전체 캐시 클리어`);
    }

    // 만료된 캐시 항목들 정리
    cleanup(): void {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.expiresIn) {
                this.cache.delete(key);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            console.log(`🧹 [Cache] ${cleanedCount}개 만료된 캐시 정리`);
        }
    }

    // 캐시 상태 정보
    getStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// 싱글톤 인스턴스
export const memoryCache = new MemoryCache();

// 정기적으로 만료된 캐시 정리 (5분마다) - 클라이언트에서만 실행
if (typeof window !== 'undefined' && typeof setInterval !== 'undefined') {
    setInterval(() => {
        memoryCache.cleanup();
    }, 5 * 60 * 1000);
}

// 캐시 키 생성 헬퍼
export function createCacheKey(prefix: string, ...args: (string | number)[]): string {
    const hash = args.join('|');
    return `${prefix}:${hash}`;
}

// API 응답 캐싱을 위한 헬퍼 함수
export async function withCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    expiresInMs: number = 5 * 60 * 1000
): Promise<T> {
    // 캐시에서 먼저 확인
    const cached = memoryCache.get<T>(key);
    if (cached !== null) {
        return cached;
    }

    // 캐시 미스인 경우 새로 fetch
    const data = await fetcher();
    memoryCache.set(key, data, expiresInMs);

    return data;
} 