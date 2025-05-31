'use client';

import React, { useState, useEffect } from 'react';
import { RoundedOutlinedChip } from '@/components/chip/RoundedOutlined/RoundedOutlinedChip';
import { techSetRepository } from '@/domains/techset/repositories/TechSetCacheRepository';

interface TechSetListProps {
    skillIds: string[];
    jobGroupIds: string[];
}

// TechSet 매핑을 위한 커스텀 hook
function useTechSetMapping(skillIds: string[], jobGroupIds: string[]) {
    const [mappedTechSets, setMappedTechSets] = useState<Array<{ id: string; name: string; type: 'skill' | 'jobGroup' }>>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function mapTechSets() {
            console.log('🔄 [TechSetList] 매핑 시작:', { skillIds, jobGroupIds });
            setIsLoading(true);

            // TechSet 캐시가 로딩 중이면 최대 5초까지 기다림
            let retryCount = 0;
            const maxRetries = 10; // 0.5초씩 10번 = 5초

            while (retryCount < maxRetries) {
                const cacheStatus = techSetRepository.getCacheStatus();

                if (cacheStatus === 'loaded') {
                    console.log('✅ [TechSetList] 캐시 로드 완료, 매핑 진행');
                    break;
                } else if (cacheStatus === 'loading') {
                    console.log(`⏳ [TechSetList] 캐시 로딩 중... ${retryCount + 1}/${maxRetries} 재시도`);
                    await new Promise(resolve => setTimeout(resolve, 500)); // 0.5초 대기
                    retryCount++;
                } else {
                    console.log('⚠️ [TechSetList] 캐시 로드 실패 또는 오류, 임시 매핑 사용');
                    break;
                }
            }

            if (retryCount >= maxRetries) {
                console.log('⚠️ [TechSetList] 캐시 로드 시간 초과, 임시 매핑 사용');
            }

            const result: Array<{ id: string; name: string; type: 'skill' | 'jobGroup' }> = [];

            // 스킬 ID들 매핑
            skillIds.forEach(id => {
                const mapped = techSetRepository.mappedFromId(id);
                result.push({
                    id,
                    name: mapped.name,
                    type: 'skill'
                });
                console.log(`🔧 [TechSetList] 스킬 ID "${id}" 매핑: "${mapped.name}"`);
            });

            // 직군 ID들 매핑
            jobGroupIds.forEach(id => {
                const mapped = techSetRepository.mappedFromId(id);
                result.push({
                    id,
                    name: mapped.name,
                    type: 'jobGroup'
                });
                console.log(`👥 [TechSetList] 직군 ID "${id}" 매핑: "${mapped.name}"`);
            });

            console.log('✅ [TechSetList] 매핑 완료:', result);
            setMappedTechSets(result);
            setIsLoading(false);
        }

        if (skillIds.length > 0 || jobGroupIds.length > 0) {
            mapTechSets();
        } else {
            setMappedTechSets([]);
            setIsLoading(false);
        }
    }, [skillIds, jobGroupIds]);

    return { mappedTechSets, isLoading };
}

export const TechSetList = React.memo(function TechSetList({ skillIds, jobGroupIds }: TechSetListProps) {
    const { mappedTechSets, isLoading } = useTechSetMapping(skillIds, jobGroupIds);

    console.log('🏷️ [TechSetList] 렌더링:', { skillIds, jobGroupIds, mappedTechSets, isLoading });

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                gap: 6,
                flexWrap: 'wrap',
                paddingTop: (skillIds.length + jobGroupIds.length > 0) ? 12 : 0,
                paddingBottom: (skillIds.length + jobGroupIds.length > 0) ? 20 : 0
            }}>
                {/* 로딩 중일 때는 ID를 그대로 표시 */}
                {[...skillIds, ...jobGroupIds].map((id, idx) => (
                    <RoundedOutlinedChip key={id + idx}>
                        {id}
                    </RoundedOutlinedChip>
                ))}
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            paddingTop: mappedTechSets.length > 0 ? 12 : 0,
            paddingBottom: mappedTechSets.length > 0 ? 20 : 0
        }}>
            {mappedTechSets.map((techSet, idx) => (
                <RoundedOutlinedChip key={techSet.id + idx}>
                    {techSet.name}
                </RoundedOutlinedChip>
            ))}
        </div>
    );
});
