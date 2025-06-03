'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

// 블로그 기본 정보 데이터 타입
interface BlogBasicInfoData {
    title: string;
    content: string;
    thumbnailUrl?: string;
    linkUrl?: string;
    skillIds: string[];
    jobGroupIds: string[];
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
    link_url?: string;
    related_skill_ids?: string[];
    related_job_group_ids?: string[];
}

/**
 * 블로그 기본 정보(메타데이터 + 본문)를 자식 컴포넌트들에게 제공하는 Provider
 * 
 * 기능:
 * - 블로그 메타데이터 (제목, 기술스택) 로딩
 * - 블로그 본문 콘텐츠 로딩
 * - 로딩 상태 및 에러 처리
 */
export function BlogBasicInfoProvider({ children, documentId }: BlogBasicInfoProviderProps) {
    const [state, setState] = useState<BlogBasicInfoState>({ status: 'loading' });

    useEffect(() => {
        let isCancelled = false;

        async function loadBlogContent() {
            const startTime = Date.now();
            console.log('📚 [BlogBasicInfoProvider] 🚀 로딩 시작:', documentId);
            setState({ status: 'loading' });

            try {
                // 병렬로 메타데이터와 콘텐츠 로딩
                const blogRef = doc(firestore, 'Blogs', documentId);
                const contentRef = doc(firestore, 'Blogs', documentId, 'Content', 'content');

                console.log('📚 [BlogBasicInfoProvider] 메타데이터 가져오기 시작:', blogRef.path);
                const metadataStart = Date.now();

                const [blogDoc, contentDoc] = await Promise.all([
                    getDoc(blogRef),
                    getDoc(contentRef)
                ]);

                const metadataEnd = Date.now();
                const metadataTime = metadataEnd - metadataStart;
                console.log('📚 [BlogBasicInfoProvider] 메타데이터 로딩 완료:', `${metadataTime}ms`);
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

                const data: BlogBasicInfoData = {
                    title: blogData.title,
                    content,
                    thumbnailUrl: blogData.thumbnail_url,
                    linkUrl: blogData.link_url,
                    skillIds: blogData.related_skill_ids || [],
                    jobGroupIds: blogData.related_job_group_ids || []
                };

                setState({ status: 'success', data });

                const endTime = Date.now();
                const totalTime = endTime - startTime;
                console.log('📚 [BlogBasicInfoProvider] 🚀 전체 로딩 완료:', {
                    title: data.title,
                    contentLength: data.content.length,
                    techSetsCount: data.skillIds.length + data.jobGroupIds.length,
                    hasThumbnail: !!data.thumbnailUrl,
                    totalLoadingTime: `${totalTime}ms` // 성능 지표
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