'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useTechSetCache } from '../../techset/hooks/useTechSetCache';
import { techSetRepository } from '../../techset/repositories/TechSetCacheRepository';

// 클라이언트용 블로그 데이터 타입 (서버와 동일)
interface ClientBlogData {
    title: string;
    thumbnailUrl?: string; // 선택적 썸네일 URL
    relatedTechSets: Array<{
        id: string;
        name: string;
        type: 'skill' | 'jobGroup';
    }>;
}

// 훅 반환 타입 (Discriminated Union)
type UseBlogDataResult =
    | { status: 'loading' }
    | { status: 'success'; data: ClientBlogData }
    | { status: 'error'; error: string };

/**
 * URL 유효성을 검사하는 함수
 */
function isValidUrl(urlString: string): boolean {
    if (!urlString || urlString.trim() === '') {
        return false;
    }

    try {
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * 클라이언트에서 특정 문서의 블로그 데이터를 페칭하는 훅
 * TechSet 캐시를 사용하여 ID를 이름으로 매핑
 */
export function useClientBlogData(documentId: string): UseBlogDataResult {
    const [result, setResult] = useState<UseBlogDataResult>({ status: 'loading' });
    const cacheResult = useTechSetCache();

    useEffect(() => {
        // 캐시가 로딩 중이면 대기
        if (cacheResult.status === 'loading') {
            return;
        }

        // 캐시 로드에 실패했으면 에러 반환
        if (cacheResult.status === 'error') {
            setResult({ status: 'error', error: cacheResult.error });
            return;
        }

        let isCancelled = false;

        async function fetchBlogData() {
            try {
                console.log(`🚀 [클라이언트] 블로그 데이터 페칭: ${documentId}`);

                const docRef = doc(firestore, 'Blogs', documentId);
                const docSnap = await getDoc(docRef);

                if (isCancelled) return;

                if (!docSnap.exists()) {
                    throw new Error(`Document not found: ${documentId}`);
                }

                const blogData = docSnap.data();

                if (typeof blogData.title !== 'string') {
                    throw new Error('Invalid blog title');
                }

                // TechSet ID들을 이름으로 매핑
                const relatedTechSets: Array<{
                    id: string;
                    name: string;
                    type: 'skill' | 'jobGroup';
                }> = [];

                // 스킬 ID 매핑
                const skillIds = blogData.related_skill_ids || [];
                skillIds.forEach((id: string) => {
                    const mapped = techSetRepository.mappedFromId(id);
                    relatedTechSets.push({
                        id,
                        name: mapped.name,
                        type: 'skill'
                    });
                });

                // 직군 ID 매핑
                const jobGroupIds = blogData.related_job_group_ids || [];
                jobGroupIds.forEach((id: string) => {
                    const mapped = techSetRepository.mappedFromId(id);
                    relatedTechSets.push({
                        id,
                        name: mapped.name,
                        type: 'jobGroup'
                    });
                });

                if (isCancelled) return;

                // 썸네일 URL 유효성 검사
                const thumbnailUrl = blogData.thumbnail_url;
                const validThumbnailUrl = thumbnailUrl && isValidUrl(thumbnailUrl) ? thumbnailUrl : undefined;

                if (thumbnailUrl) {
                    console.log(`🖼️ [클라이언트] 썸네일 URL 체크: "${thumbnailUrl}" -> ${validThumbnailUrl ? '유효' : '무효'}`);
                }

                setResult({
                    status: 'success',
                    data: {
                        title: blogData.title,
                        thumbnailUrl: validThumbnailUrl,
                        relatedTechSets
                    }
                });

                console.log(`✅ [클라이언트] 블로그 데이터 페칭 완료: ${relatedTechSets.length}개 TechSet`);

            } catch (error) {
                if (isCancelled) return;

                console.error('❌ [클라이언트] 블로그 데이터 페칭 실패:', error);
                setResult({
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        fetchBlogData();

        return () => {
            isCancelled = true;
        };
    }, [documentId, cacheResult]);

    return result;
} 