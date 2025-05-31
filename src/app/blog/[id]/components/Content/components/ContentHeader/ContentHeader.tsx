'use client';

import React from 'react';
import { Gap } from "@/components/gap/Gap";
import { title } from "./ContentHeader.css";
import { TechSetList } from './nested-component/TechSetList';
import { useBlogBasicInfo } from '@/domains/blog/providers/BlogBasicInfoProvider';
import { ThumbnailImage } from '@/components/Image/Thumbnail/ThumbnailImage';

export default function ContentHeader() {
    const { state } = useBlogBasicInfo();

    // 로딩 중일 때
    if (state.status === 'loading') {
        return (
            <div>
                <h1 className={title}>로딩 중...</h1>
                <Gap size={12} />
                <TechSetList tags={[]} />
                <Gap size={20} />
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
    const { title: blogTitle, relatedTechSets, thumbnailUrl } = state.data;
    const techSetNames = relatedTechSets.map(item => item.name);

    // 썸네일이 있을 때만 디버깅 로그 출력
    if (thumbnailUrl) {
        console.log('🖼️ [ContentHeader] 썸네일 URL 발견:', thumbnailUrl);
    }

    return (
        <div>
            <h1 className={title}>[AI Summary]{blogTitle || '제목 없음'}</h1>

            <TechSetList tags={techSetNames} />
            <Gap size={20} />

            {/* 썸네일 이미지 표시 */}
            {thumbnailUrl && (
                <>
                    <ThumbnailImage
                        src={thumbnailUrl}
                        alt={blogTitle || '블로그 썸네일'}
                        aspectRatio="12/6"

                        borderRadius={12}
                    />
                    <Gap size={20} />
                </>
            )}
        </div>
    );
}


