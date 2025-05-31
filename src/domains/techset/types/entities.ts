// 기본 TechSet 엔티티 인터페이스
interface BaseTechSetEntity {
    id: string;
    name: string;
    koName: string;
    youtubeContentCount: number;
    youtubeContentCountKo: number;
    blogContentCount: number;
    blogContentCountKo: number;
}

// 스킬 엔티티
export interface SkillEntity extends BaseTechSetEntity {
    category: string;
}

// 직군 엔티티  
export interface JobGroupEntity extends BaseTechSetEntity { }

// 통합 TechSet 엔티티 (Union Type)
export type TechSetEntity =
    | { type: 'skill'; data: SkillEntity }
    | { type: 'jobGroup'; data: JobGroupEntity };

// Firestore 원시 데이터 타입
export interface SkillFirestoreData {
    blog_content_count_ko: number;
    category: string;
    ko_name: string;
    name: string;
    youtube_content_count: number;
    youtube_content_count_ko: number;
}

export interface JobGroupFirestoreData {
    blog_content_count_ko: number;
    id: string;
    ko_name: string;
    name: string;
    youtube_content_count: number;
    youtube_content_count_ko: number;
} 