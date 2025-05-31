'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { techSetRepository } from '@/domains/techset/repositories/TechSetCacheRepository';

// 블로그 기본 정보 데이터 타입
interface BlogBasicInfoData {
    title: string;
    content: string;
    thumbnailUrl?: string;
    relatedTechSets: Array<{
        id: string;
        name: string;
        type: 'skill' | 'jobGroup';
    }>;
}

// 블로그 기본 정보 상태 타입 (Discriminated Union)
type BlogBasicInfoState =
    | { status: 'loading' }
    | { status: 'success'; data: BlogBasicInfoData }
    | { status: 'error'; error: string };

// Context 값 타입
interface BlogBasicInfoContextValue {
    state: BlogBasicInfoState;
    documentId: string;
}

// Provider Props 타입
interface BlogBasicInfoProviderProps {
    children: ReactNode;
    documentId: string;
}

// Context 생성
const BlogBasicInfoContext = createContext<BlogBasicInfoContextValue | null>(null);

// Firestore 블로그 데이터 타입
interface BlogFirestoreData {
    title: string;
    thumbnail_url?: string;
    related_skill_ids?: string[];
    related_job_group_ids?: string[];
}

// TechSet ID를 이름으로 매핑하는 유틸리티 함수
function mapIdsToTechSetItems(
    skillIds: string[],
    jobGroupIds: string[]
): Array<{ id: string; name: string; type: 'skill' | 'jobGroup' }> {
    const result: Array<{ id: string; name: string; type: 'skill' | 'jobGroup' }> = [];

    console.log('🔄 [TechSet 매핑] 입력 데이터:', { skillIds, jobGroupIds });

    // TechSet 캐시 상태 확인 (캐시가 없어도 ID로 표시)
    const cacheStatus = techSetRepository.getCacheStatus();
    const isCacheReady = cacheStatus === 'loaded';

    console.log('🔍 [TechSet 매핑] 캐시 상태:', cacheStatus, '준비 여부:', isCacheReady);

    if (!isCacheReady) {
        console.log('📚 [BlogBasicInfoProvider] TechSet 캐시 미준비, ID로 표시:', cacheStatus);
    }

    // 캐시가 준비된 경우 실제 데이터 확인
    if (isCacheReady) {
        const allSkills = techSetRepository.getAllSkills();
        const allJobGroups = techSetRepository.getAllJobGroups();
        console.log('📊 [TechSet 매핑] 캐시된 스킬 수:', allSkills.length);
        console.log('📊 [TechSet 매핑] 캐시된 직군 수:', allJobGroups.length);

        if (allSkills.length > 0) {
            console.log('📊 [TechSet 매핑] 첫 번째 스킬 예시:', allSkills[0]);
        }
        if (allJobGroups.length > 0) {
            console.log('📊 [TechSet 매핑] 첫 번째 직군 예시:', allJobGroups[0]);
        }
    }

    // 스킬 매핑
    skillIds.forEach(id => {
        console.log(`🔧 [TechSet 매핑] 스킬 ID 처리: "${id}"`);
        if (isCacheReady) {
            const skill = techSetRepository.getSkillById(id);
            console.log(`🔧 [TechSet 매핑] 스킬 검색 결과 (${id}):`, skill);
            if (skill && skill.name) {
                result.push({
                    id,
                    name: skill.name,
                    type: 'skill'
                });
                console.log(`✅ [TechSet 매핑] 스킬 "${id}" → "${skill.name}" 성공`);
                return;
            }
        }

        // 캐시가 없거나 찾지 못하면 ID 그대로 사용
        console.log(`⚠️ [TechSet 매핑] 스킬 ${id} 매핑 실패, ID "${id}" 그대로 사용`);
        result.push({
            id,
            name: id,
            type: 'skill'
        });
    });

    // 직군 매핑
    jobGroupIds.forEach(id => {
        console.log(`👥 [TechSet 매핑] 직군 ID 처리: "${id}"`);
        if (isCacheReady) {
            const jobGroup = techSetRepository.getJobGroupById(id);
            console.log(`👥 [TechSet 매핑] 직군 검색 결과 (${id}):`, jobGroup);
            if (jobGroup && jobGroup.name) {
                result.push({
                    id,
                    name: jobGroup.name,
                    type: 'jobGroup'
                });
                console.log(`✅ [TechSet 매핑] 직군 "${id}" → "${jobGroup.name}" 성공`);
                return;
            }
        }

        // 캐시가 없거나 찾지 못하면 ID 그대로 사용
        console.log(`⚠️ [TechSet 매핑] 직군 ${id} 매핑 실패, ID "${id}" 그대로 사용`);
        result.push({
            id,
            name: id,
            type: 'jobGroup'
        });
    });

    console.log('✅ [TechSet 매핑] 완료 결과:', result);
    return result;
}

/**
 * 블로그 기본 정보(메타데이터 + 본문)를 자식 컴포넌트들에게 제공하는 Provider
 * 
 * 기능:
 * - 블로그 메타데이터 (제목, 기술스택) 로딩
 * - 블로그 본문 콘텐츠 로딩
 * - 로딩 상태 및 에러 처리
 * - TechSet 캐시와 연동
 */
export function BlogBasicInfoProvider({ children, documentId }: BlogBasicInfoProviderProps) {
    const [state, setState] = useState<BlogBasicInfoState>({ status: 'loading' });

    useEffect(() => {
        let isCancelled = false;

        async function loadBlogContent() {
            console.log('📚 [BlogBasicInfoProvider] 데이터 로딩 시작:', documentId);
            setState({ status: 'loading' });

            try {
                // 병렬로 메타데이터와 콘텐츠 로딩
                const blogDocRef = doc(firestore, 'Blogs', documentId);
                const contentDocRef = doc(firestore, 'Blogs', documentId, 'Content', 'content');

                console.log('📚 [BlogBasicInfoProvider] 메타데이터 가져오기 시작:', blogDocRef.path);

                const [blogDoc, contentDoc] = await Promise.all([
                    getDoc(blogDocRef),
                    getDoc(contentDocRef)
                ]);

                console.log('📚 [BlogBasicInfoProvider] 메타데이터 로딩 완료:', blogDoc.exists());
                console.log('📚 [BlogBasicInfoProvider] 콘텐츠 로딩 완료:', contentDoc.exists());

                // 메타데이터 검증
                if (!blogDoc.exists()) {
                    throw new Error(`블로그 메타데이터를 찾을 수 없습니다: ${documentId}`);
                }

                // 콘텐츠 검증
                if (!contentDoc.exists()) {
                    throw new Error(`블로그 콘텐츠를 찾을 수 없습니다: ${documentId}`);
                }

                const blogData = blogDoc.data() as BlogFirestoreData;
                const contentData = contentDoc.data();
                const content = contentData.text || '';

                // 썸네일 URL이 있을 때만 로그 출력
                if (blogData.thumbnail_url) {
                    console.log('📚 [BlogBasicInfoProvider] 썸네일 URL 발견:', blogData.thumbnail_url);
                }

                console.log('📚 [BlogBasicInfoProvider] Firestore 데이터:', {
                    skillIds: blogData.related_skill_ids,
                    jobGroupIds: blogData.related_job_group_ids,
                    hasThumbnail: !!blogData.thumbnail_url
                });

                // TechSet ID들을 이름으로 매핑
                const relatedTechSets = mapIdsToTechSetItems(
                    blogData.related_skill_ids || [],
                    blogData.related_job_group_ids || []
                );

                const data: BlogBasicInfoData = {
                    title: blogData.title,
                    content,
                    thumbnailUrl: blogData.thumbnail_url,
                    relatedTechSets
                };

                setState({ status: 'success', data });

                console.log('📚 [BlogBasicInfoProvider] 데이터 로딩 완료:', {
                    title: data.title,
                    contentLength: data.content.length,
                    techSetsCount: data.relatedTechSets.length,
                    hasThumbnail: !!data.thumbnailUrl
                });

            } catch (error) {
                if (isCancelled) return;

                const errorMessage = error instanceof Error ? error.message : '블로그 데이터 로딩 실패';
                console.error('📚 [BlogBasicInfoProvider] 로딩 오류:', error);
                setState({ status: 'error', error: errorMessage });
            }
        }

        loadBlogContent();

        return () => {
            isCancelled = true;
        };
    }, [documentId]);

    const contextValue: BlogBasicInfoContextValue = {
        state,
        documentId
    };

    return (
        <BlogBasicInfoContext.Provider value={contextValue}>
            {children}
        </BlogBasicInfoContext.Provider>
    );
}

/**
 * BlogBasicInfoProvider에서 제공하는 값을 사용하는 Hook
 * 
 * toss-frontend 가이드라인 준수:
 * - 불필요한 추상화 제거
 * - 단일 데이터 소스에서 직접 접근
 * - 성능 최적화 (단일 context 구독)
 */
export function useBlogBasicInfo(): BlogBasicInfoContextValue {
    const context = useContext(BlogBasicInfoContext);
    if (!context) {
        throw new Error('useBlogBasicInfo는 BlogBasicInfoProvider 내부에서만 사용할 수 있습니다.');
    }
    return context;
} 