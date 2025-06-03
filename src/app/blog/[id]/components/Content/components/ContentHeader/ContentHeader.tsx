'use client';

import React from "react";
import { Gap } from "@/components/gap/Gap.tsx";
import { useBlogBasicInfo } from "@/domains/blog/providers/BlogBasicInfoProvider";
import { LoadingSpinner } from '@/components/loading/LoadingSpinner/LoadingSpinner';
import { ThumbnailImage } from "@/components/Image/Thumbnail/ThumbnailImage";
import { TechSetList } from './nested-component/TechSetList';
import {
    container,
    headerSection,
    titleContainer,
    title,
    loadingContainer,
    errorContainer
} from "./ContentHeader.css";

const ContentHeader = React.memo(() => {
    const { state } = useBlogBasicInfo();

    // 로딩 상태 최적화 - 빠른 피드백
    if (state.status === 'loading') {
        return (
            <div className={container}>
                <div className={loadingContainer}>
                    <LoadingSpinner size="small" layout="center" />
                </div>
            </div>
        );
    }

    // 에러 상태
    if (state.status === 'error') {
        return (
            <div className={container}>
                <div className={errorContainer}>
                    블로그 정보를 불러올 수 없습니다.
                </div>
            </div>
        );
    }

    const { title: blogTitle, skillIds, jobGroupIds, thumbnailUrl } = state.data;

    // 썸네일이 있을 때만 디버깅 로그 출력
    if (thumbnailUrl && process.env.NODE_ENV === 'development') {
        console.log('🖼️ [ContentHeader] 썸네일 URL 발견:', thumbnailUrl);
    }

    return (
        <header className={container}>
            <section className={headerSection}>
                <div className={titleContainer}>
                    <h1 className={title}>{blogTitle}</h1>
                </div>

                <Gap size={12} />

                {/* 기술 스택 섹션 - 기존 TechSetList 컴포넌트 사용 */}
                <TechSetList skillIds={skillIds} jobGroupIds={jobGroupIds} />

                {/* 썸네일 표시 - 있을 때만 */}
                {thumbnailUrl && (
                    <>
                        <Gap size={8} />
                        <ThumbnailImage
                            src={thumbnailUrl}
                            alt={blogTitle}
                            aspectRatio="16/9"
                            borderRadius={12}
                            priority={true} // 중요한 이미지로 우선 로딩
                        />
                    </>
                )}
            </section>
        </header>
    );
});

ContentHeader.displayName = 'ContentHeader';

export default ContentHeader;


