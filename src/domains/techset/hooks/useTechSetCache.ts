'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { techSetRepository } from '../repositories/TechSetCacheRepository';
import {
    SkillEntity,
    JobGroupEntity,
    SkillFirestoreData,
    JobGroupFirestoreData
} from '../types/entities';

// 캐시 초기화 결과 타입
type TechSetCacheResult =
    | { status: 'loading'; error: null }
    | { status: 'success'; error: null }
    | { status: 'error'; error: string };

const SKILLS_COLLECTION = 'Skills';
const JOB_GROUPS_COLLECTION = 'JobGroups';

// 세션 스토리지 키
const CACHE_SESSION_KEY = 'techset-cache-loaded';
const CACHE_EXPIRY_KEY = 'techset-cache-expiry';
const CACHE_DURATION = 30 * 60 * 1000; // 30분

/**
 * 브라우저 세션 캐시 확인
 */
function isSessionCacheValid(): boolean {
    if (typeof window === 'undefined') return false;

    try {
        const cached = sessionStorage.getItem(CACHE_SESSION_KEY);
        const expiry = sessionStorage.getItem(CACHE_EXPIRY_KEY);

        if (!cached || !expiry) return false;

        const expiryTime = parseInt(expiry, 10);
        return Date.now() < expiryTime;
    } catch {
        return false;
    }
}

/**
 * 세션 캐시 설정
 */
function setSessionCache(): void {
    if (typeof window === 'undefined') return;

    try {
        const expiryTime = Date.now() + CACHE_DURATION;
        sessionStorage.setItem(CACHE_SESSION_KEY, 'true');
        sessionStorage.setItem(CACHE_EXPIRY_KEY, expiryTime.toString());
    } catch {
        // 세션 스토리지 실패해도 무시
    }
}

/**
 * Firestore 스킬 데이터를 엔티티로 매핑
 */
function mapSkillFromFirestore(id: string, data: SkillFirestoreData): SkillEntity {
    return {
        id,
        name: data.name || id,
        koName: data.ko_name || data.name || id,
        category: data.category || 'unknown',
        youtubeContentCount: data.youtube_content_count || 0,
        youtubeContentCountKo: data.youtube_content_count_ko || 0,
        blogContentCount: data.blog_content_count_ko || 0,
        blogContentCountKo: data.blog_content_count_ko || 0,
    };
}

/**
 * Firestore 직군 데이터를 엔티티로 매핑
 */
function mapJobGroupFromFirestore(id: string, data: JobGroupFirestoreData): JobGroupEntity {
    return {
        id: data.id || id,
        name: data.name || id,
        koName: data.ko_name || data.name || id,
        youtubeContentCount: data.youtube_content_count || 0,
        youtubeContentCountKo: data.youtube_content_count_ko || 0,
        blogContentCount: data.blog_content_count_ko || 0,
        blogContentCountKo: data.blog_content_count_ko || 0,
    };
}

/**
 * TechSet 캐시를 초기화하는 훅
 * 
 * 개선사항:
 * - 세션 스토리지 기반 캐싱으로 중복 로드 방지
 * - 실패해도 웹사이트 동작에 영향 없음
 * - 백그라운드 로딩으로 사용자 경험 개선
 */
export function useTechSetCache(): TechSetCacheResult {
    const [result, setResult] = useState<TechSetCacheResult>({
        status: 'loading',
        error: null,
    });

    useEffect(() => {
        async function initializeTechSetCache() {
            // 이미 캐시가 로드되어 있으면 스킵
            const currentStatus = techSetRepository.getCacheStatus();
            if (currentStatus === 'loaded') {
                console.log('✅ [TechSetCache] 메모리 캐시 이미 로드됨');
                setResult({ status: 'success', error: null });
                return;
            }

            // 세션 캐시가 유효하면 성공으로 처리 (실제 데이터는 없어도 됨)
            if (isSessionCacheValid()) {
                console.log('✅ [TechSetCache] 세션 캐시 유효함, Firestore 호출 생략');
                techSetRepository.setCacheStatus('loaded');
                setResult({ status: 'success', error: null });
                return;
            }

            try {
                console.log('🔄 [TechSetCache] Firestore에서 데이터 로딩 시작');
                setResult({ status: 'loading', error: null });
                techSetRepository.setCacheStatus('loading');

                // 병렬로 Skill과 JobGroup 데이터 가져오기
                const [skillsSnapshot, jobGroupsSnapshot] = await Promise.all([
                    getDocs(collection(firestore, SKILLS_COLLECTION)),
                    getDocs(collection(firestore, JOB_GROUPS_COLLECTION))
                ]);

                console.log(`📊 [TechSetCache] Skill 문서: ${skillsSnapshot.size}개`);
                console.log(`📊 [TechSetCache] JobGroup 문서: ${jobGroupsSnapshot.size}개`);

                // Skill 데이터 매핑
                const skills: SkillEntity[] = [];
                skillsSnapshot.forEach((doc) => {
                    const data = doc.data() as SkillFirestoreData;
                    const skill = mapSkillFromFirestore(doc.id, data);
                    skills.push(skill);
                });

                // JobGroup 데이터 매핑
                const jobGroups: JobGroupEntity[] = [];
                jobGroupsSnapshot.forEach((doc) => {
                    const data = doc.data() as JobGroupFirestoreData;
                    const jobGroup = mapJobGroupFromFirestore(doc.id, data);
                    jobGroups.push(jobGroup);
                });

                // 캐시에 저장
                techSetRepository.setSkills(skills);
                techSetRepository.setJobGroups(jobGroups);
                techSetRepository.setCacheStatus('loaded');

                // 세션 캐시 설정
                setSessionCache();

                console.log('✅ [TechSetCache] 초기화 완료');
                setResult({ status: 'success', error: null });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'TechSet 캐시 초기화 실패';
                console.warn('⚠️ [TechSetCache] 로딩 실패:', error);
                console.warn('⚠️ [TechSetCache] TechSet 이름이 ID로 표시됩니다.');

                // 실패해도 에러 상태로 설정하지 않고 성공으로 처리
                // 웹사이트는 정상 동작해야 함
                techSetRepository.setCacheStatus('error');
                setResult({ status: 'success', error: null });
            }
        }

        initializeTechSetCache();
    }, []);

    return result;
} 