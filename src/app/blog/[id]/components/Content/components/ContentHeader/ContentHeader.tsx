'use client';

import React from 'react';
import { title } from "./ContentHeader.css";
import { TechSetList } from './nested-component/TechSetList';
import { useBlogBasicInfo } from '@/domains/blog/providers/BlogBasicInfoProvider';
import { ThumbnailImage } from '@/components/Image/Thumbnail/ThumbnailImage';
import { isMobileDevice } from '@/utils/clientUtils';

export default function ContentHeader() {
    const { state } = useBlogBasicInfo();

    // 로딩 중일 때
    if (state.status === 'loading') {
        return (
            <div>
                <h1 className={title}>로딩 중...</h1>
                <TechSetList skillIds={[]} jobGroupIds={[]} />
            </div>
        );
    }

    // 에러일 때
    if (state.status === 'error') {
        return (
            <div>
                <h1 className={title}>데이터 로드 실패</h1>
                <p style={{ color: '#ef4444', fontSize: '14px' }}>Error: {state.error}</p>
            </div>
        );
    }

    // 성공적으로 데이터를 가져온 경우 - 직접 destructuring으로 데이터 접근
    const { title: blogTitle, skillIds, jobGroupIds, thumbnailUrl } = state.data;

    // 썸네일이 있을 때만 디버깅 로그 출력
    if (thumbnailUrl) {
        console.log('🖼️ [ContentHeader] 썸네일 URL 발견:', thumbnailUrl);
    }

    // 모바일 여부에 따라 aspectRatio 결정
    const isMobile = isMobileDevice();
    const aspectRatio = isMobile ? "16/8.5" : "12/6";

    return (
        <div>
            <h1 className={title}>{blogTitle}</h1>

            <TechSetList skillIds={skillIds} jobGroupIds={jobGroupIds} />

            {thumbnailUrl && (
                <ThumbnailImage
                    src={thumbnailUrl}
                    alt={blogTitle}
                    aspectRatio={aspectRatio}
                    borderRadius={12}
                    style={{ marginBottom: '20px' }}
                />
            )}
        </div>
    );
}


