import { SkillEntity, JobGroupEntity } from '../types/entities';

// 현재 로케일 타입 정의
type Locale = 'ko' | 'en';

// 캐시 상태 타입 정의
type CacheStatus = 'empty' | 'loading' | 'loaded' | 'error';

// 임시 하드코딩된 매핑 테이블 (테스트용)
const TEMP_SKILL_MAPPING: Record<string, string> = {
    'python': 'Python',
    'tensorflow': 'TensorFlow',
    'pytorch': 'PyTorch',
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'react': 'React',
    'flutter': 'Flutter',
    'swift': 'Swift',
    'kotlin': 'Kotlin',
    'java': 'Java'
};

const TEMP_JOB_GROUP_MAPPING: Record<string, string> = {
    'machine-learning-engineer': '머신러닝 엔지니어',
    'python-developer': 'Python 개발자',
    'data-scientist': '데이터 사이언티스트',
    'software-engineer': '소프트웨어 엔지니어',
    'frontend-developer': '프론트엔드 개발자',
    'backend-developer': '백엔드 개발자',
    'mobile-developer': '모바일 개발자'
};

/**
 * TechSet 데이터를 캐싱하는 싱글톤 저장소
 * Flutter의 techSetRepository를 참고하여 구현
 */
class TechSetCacheRepository {
    private static instance: TechSetCacheRepository;

    // 캐시된 데이터
    private skillsCache = new Map<string, SkillEntity>();
    private jobGroupsCache = new Map<string, JobGroupEntity>();

    // 캐시 상태
    private cacheStatus: CacheStatus = 'empty';
    private currentLocale: Locale = 'ko';

    // 싱글톤 패턴
    private constructor() { }

    static getInstance(): TechSetCacheRepository {
        if (!TechSetCacheRepository.instance) {
            TechSetCacheRepository.instance = new TechSetCacheRepository();
        }
        return TechSetCacheRepository.instance;
    }

    // 현재 로케일 설정/조회
    setLocale(locale: Locale): void {
        this.currentLocale = locale;
    }

    getLocale(): Locale {
        return this.currentLocale;
    }

    // 캐시 상태 조회
    getCacheStatus(): CacheStatus {
        return this.cacheStatus;
    }

    setCacheStatus(status: CacheStatus): void {
        this.cacheStatus = status;
    }

    // 스킬 데이터 관리
    setSkills(skills: SkillEntity[]): void {
        this.skillsCache.clear();
        skills.forEach(skill => {
            this.skillsCache.set(skill.id, skill);
        });
        console.log('🔍 [DEBUG] 스킬 캐시 저장 완료. 저장된 스킬 IDs:', Array.from(this.skillsCache.keys()));
    }

    getSkillById(id: string): SkillEntity {
        const skill = this.skillsCache.get(id);
        if (!skill) {
            return this.createUndefinedSkill(id);
        }
        return skill;
    }

    getAllSkills(): SkillEntity[] {
        return Array.from(this.skillsCache.values());
    }

    // 직군 데이터 관리
    setJobGroups(jobGroups: JobGroupEntity[]): void {
        this.jobGroupsCache.clear();
        jobGroups.forEach(jobGroup => {
            this.jobGroupsCache.set(jobGroup.id, jobGroup);
        });
        console.log('🔍 [DEBUG] 직군 캐시 저장 완료. 저장된 직군 IDs:', Array.from(this.jobGroupsCache.keys()));
    }

    getJobGroupById(id: string): JobGroupEntity {
        const jobGroup = this.jobGroupsCache.get(id);
        if (!jobGroup) {
            return this.createUndefinedJobGroup(id);
        }
        return jobGroup;
    }

    getAllJobGroups(): JobGroupEntity[] {
        return Array.from(this.jobGroupsCache.values());
    }

    // Flutter의 TechSetEntity.mappedFromId와 동일한 로직
    mappedFromId(id: string): { type: 'skill' | 'jobGroup'; name: string } {
        console.log(`🔍 [DEBUG] mappedFromId 호출: "${id}"`);
        console.log(`🔍 [DEBUG] 현재 로케일: ${this.currentLocale}`);
        console.log(`🔍 [DEBUG] 캐시 상태: ${this.cacheStatus}`);

        // 임시 하드코딩 매핑 먼저 시도 (테스트용)
        if (TEMP_SKILL_MAPPING[id]) {
            console.log(`🔍 [DEBUG] 임시 스킬 매핑 성공: "${id}" -> "${TEMP_SKILL_MAPPING[id]}"`);
            return { type: 'skill', name: TEMP_SKILL_MAPPING[id] };
        }

        if (TEMP_JOB_GROUP_MAPPING[id]) {
            console.log(`🔍 [DEBUG] 임시 직군 매핑 성공: "${id}" -> "${TEMP_JOB_GROUP_MAPPING[id]}"`);
            return { type: 'jobGroup', name: TEMP_JOB_GROUP_MAPPING[id] };
        }

        // 1. 스킬에서 먼저 찾기
        const skill = this.skillsCache.get(id);
        console.log(`🔍 [DEBUG] 스킬 캐시에서 "${id}" 검색 결과:`, skill);

        if (skill && skill.id !== 'undefined') {
            const displayName = this.currentLocale === 'ko' ? skill.koName : skill.name;
            console.log(`🔍 [DEBUG] 스킬 매핑 성공: "${id}" -> "${displayName}"`);
            return { type: 'skill', name: displayName };
        }

        // 2. 직군에서 찾기
        const jobGroup = this.jobGroupsCache.get(id);
        console.log(`🔍 [DEBUG] 직군 캐시에서 "${id}" 검색 결과:`, jobGroup);

        if (jobGroup && jobGroup.id !== 'undefined') {
            const displayName = this.currentLocale === 'ko' ? jobGroup.koName : jobGroup.name;
            console.log(`🔍 [DEBUG] 직군 매핑 성공: "${id}" -> "${displayName}"`);
            return { type: 'jobGroup', name: displayName };
        }

        // 3. 찾지 못한 경우 id 그대로 반환
        console.log(`🔍 [DEBUG] 매핑 실패: "${id}" -> "${id}" (원본 그대로)`);
        return { type: 'skill', name: id };
    }

    // 캐시 초기화
    clearCache(): void {
        this.skillsCache.clear();
        this.jobGroupsCache.clear();
        this.cacheStatus = 'empty';
    }

    // undefined 엔티티 생성 (Flutter 코드 참고) - 원본 ID 유지
    private createUndefinedSkill(id: string): SkillEntity {
        return {
            id: id, // 원본 ID 유지
            name: id, // 원본 ID를 이름으로 사용
            koName: id, // 원본 ID를 한국어 이름으로 사용
            category: 'unknown',
            youtubeContentCount: 0,
            youtubeContentCountKo: 0,
            blogContentCount: 0,
            blogContentCountKo: 0,
        };
    }

    private createUndefinedJobGroup(id: string): JobGroupEntity {
        return {
            id: id, // 원본 ID 유지
            name: id, // 원본 ID를 이름으로 사용
            koName: id, // 원본 ID를 한국어 이름으로 사용
            youtubeContentCount: 0,
            youtubeContentCountKo: 0,
            blogContentCount: 0,
            blogContentCountKo: 0,
        };
    }
}

// 싱글톤 인스턴스 export
export const techSetRepository = TechSetCacheRepository.getInstance(); 