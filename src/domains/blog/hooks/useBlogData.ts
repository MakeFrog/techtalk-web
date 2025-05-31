'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { techSetRepository } from '@/domains/techset/repositories/TechSetCacheRepository';

// 블로그 데이터 결과 타입
type BlogDataResult =
    | { status: 'loading'; data: null; error: null }
    | { status: 'success'; data: BlogData; error: null }
    | { status: 'error'; data: null; error: string };

// 블로그 데이터 인터페이스
interface BlogData {
    title: string;
    relatedTechSets: TechSetDisplayItem[];
}

// 표시용 TechSet 아이템
interface TechSetDisplayItem {
    id: string;
    name: string;
    type: 'skill' | 'jobGroup';
}

// Firestore 블로그 문서 타입
interface BlogFirestoreData {
    title: string;
    related_skill_ids?: string[];
    related_job_group_ids?: string[];
}

// 블로그 컬렉션 및 문서 상수 정의
const BLOGS_COLLECTION = 'Blogs';
const TARGET_DOCUMENT_ID = 'd2_naver_com_helloworld_5871868';

// ID 배열을 TechSet 표시 아이템으로 매핑하는 함수
function mapIdsToTechSetItems(
    skillIds: string[] = [],
    jobGroupIds: string[] = []
): TechSetDisplayItem[] {
    const items: TechSetDisplayItem[] = [];

    console.log('🔍 [DEBUG] 매핑 시작');
    console.log('🔍 [DEBUG] skill IDs:', skillIds);
    console.log('🔍 [DEBUG] jobGroup IDs:', jobGroupIds);
    console.log('🔍 [DEBUG] 캐시 상태:', techSetRepository.getCacheStatus());
    console.log('🔍 [DEBUG] 캐시된 스킬 수:', techSetRepository.getAllSkills().length);
    console.log('🔍 [DEBUG] 캐시된 직군 수:', techSetRepository.getAllJobGroups().length);

    // 스킬 ID들 매핑
    skillIds.forEach(id => {
        console.log(`🔍 [DEBUG] 스킬 ID "${id}" 매핑 시도`);
        const mapped = techSetRepository.mappedFromId(id);
        console.log(`🔍 [DEBUG] 스킬 ID "${id}" 매핑 결과:`, mapped);
        items.push({
            id,
            name: mapped.name,
            type: 'skill'
        });
    });

    // 직군 ID들 매핑
    jobGroupIds.forEach(id => {
        console.log(`🔍 [DEBUG] 직군 ID "${id}" 매핑 시도`);
        const mapped = techSetRepository.mappedFromId(id);
        console.log(`🔍 [DEBUG] 직군 ID "${id}" 매핑 결과:`, mapped);
        items.push({
            id,
            name: mapped.name,
            type: 'jobGroup'
        });
    });

    console.log('🔍 [DEBUG] 최종 매핑 결과:', items);
    return items;
}

/**
 * 블로그 데이터(제목 + 관련 기술스택)를 가져오는 훅
 * TechSet 캐시를 사용하여 ID를 실제 이름으로 매핑
 */
export function useBlogData(): BlogDataResult {
    const [result, setResult] = useState<BlogDataResult>({
        status: 'loading',
        data: null,
        error: null,
    });

    useEffect(() => {
        async function fetchBlogData() {
            try {
                setResult({ status: 'loading', data: null, error: null });

                // TechSet 캐시가 로드되지 않은 경우 기다리기
                const cacheStatus = techSetRepository.getCacheStatus();
                console.log('🔍 [DEBUG] TechSet 캐시 상태:', cacheStatus);

                if (cacheStatus !== 'loaded') {
                    // 캐시가 로딩 중이면 잠시 기다렸다가 다시 시도
                    if (cacheStatus === 'loading') {
                        console.log('🔍 [DEBUG] 캐시 로딩 중, 500ms 후 재시도');
                        setTimeout(() => fetchBlogData(), 500);
                        return;
                    }
                    // 캐시 로딩 실패면 에러 처리
                    if (cacheStatus === 'error') {
                        setResult({
                            status: 'error',
                            data: null,
                            error: 'TechSet 캐시 로딩 실패'
                        });
                        return;
                    }
                }

                const docRef = doc(firestore, BLOGS_COLLECTION, TARGET_DOCUMENT_ID);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const blogData = docSnap.data() as BlogFirestoreData;
                    console.log('🔍 [DEBUG] Firestore 블로그 데이터:', blogData);

                    if (typeof blogData.title !== 'string') {
                        setResult({
                            status: 'error',
                            data: null,
                            error: 'Title field is not a string'
                        });
                        return;
                    }

                    // TechSet ID들을 표시 이름으로 매핑
                    const relatedTechSets = mapIdsToTechSetItems(
                        blogData.related_skill_ids || [],
                        blogData.related_job_group_ids || []
                    );

                    setResult({
                        status: 'success',
                        data: {
                            title: blogData.title,
                            relatedTechSets
                        },
                        error: null
                    });
                } else {
                    setResult({
                        status: 'error',
                        data: null,
                        error: 'Document does not exist'
                    });
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                console.error('🔍 [DEBUG] useBlogData 에러:', error);
                setResult({ status: 'error', data: null, error: errorMessage });
            }
        }

        fetchBlogData();
    }, []);

    return result;
} 