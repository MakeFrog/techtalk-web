import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

// 서버용 블로그 데이터 타입
interface ServerBlogData {
    title: string;
    thumbnailUrl?: string; // 선택적 썸네일 URL
    relatedTechSets: Array<{
        id: string;
        name: string;
        type: 'skill' | 'jobGroup';
    }>;
}

// 문서 존재 여부 체크 결과 타입
export interface DocumentCheckResult {
    exists: boolean;
    data?: ServerBlogData;
}

// Firestore 데이터 타입 정의
interface SkillFirestoreData {
    blog_content_count_ko: number;
    category: string;
    ko_name: string;
    name: string;
    youtube_content_count: number;
    youtube_content_count_ko: number;
}

interface JobGroupFirestoreData {
    blog_content_count_ko: number;
    id: string;
    ko_name: string;
    name: string;
    youtube_content_count: number;
    youtube_content_count_ko: number;
}

// 상수 정의
const BLOGS_COLLECTION = 'Blogs';
const SKILLS_COLLECTION = 'Skill';
const JOB_GROUPS_COLLECTION = 'JobGroup';

// 현재 로케일 (서버에서는 일단 한국어로 고정)
const CURRENT_LOCALE = 'ko';

/**
 * URL 유효성을 검사하는 함수
 */
function isValidUrl(urlString: string): boolean {
    if (!urlString || urlString.trim() === '') {
        return false;
    }

    try {
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Firestore에서 Skill과 JobGroup 매핑 테이블을 생성하는 함수
 */
async function createTechSetMappings(): Promise<{
    skillsMap: Map<string, string>;
    jobGroupsMap: Map<string, string>;
}> {
    try {
        // Skill과 JobGroup 데이터를 병렬로 가져오기
        const [skillsSnapshot, jobGroupsSnapshot] = await Promise.all([
            getDocs(collection(firestore, SKILLS_COLLECTION)),
            getDocs(collection(firestore, JOB_GROUPS_COLLECTION))
        ]);

        // 스킬 매핑 테이블 생성
        const skillsMap = new Map<string, string>();
        skillsSnapshot.forEach((doc) => {
            const data = doc.data() as SkillFirestoreData;
            const displayName = CURRENT_LOCALE === 'ko' ? data.ko_name : data.name;
            skillsMap.set(doc.id, displayName);
        });

        // 직군 매핑 테이블 생성
        const jobGroupsMap = new Map<string, string>();
        jobGroupsSnapshot.forEach((doc) => {
            const data = doc.data() as JobGroupFirestoreData;
            const displayName = CURRENT_LOCALE === 'ko' ? data.ko_name : data.name;
            // data.id를 키로 사용 (문서 ID가 아닌 데이터 내부의 id 필드)
            jobGroupsMap.set(data.id, displayName);
        });

        console.log(`✅ [서버] 스킬 매핑 로드 완료: ${skillsMap.size}개`);
        console.log(`✅ [서버] 직군 매핑 로드 완료: ${jobGroupsMap.size}개`);

        return { skillsMap, jobGroupsMap };
    } catch (error) {
        console.error('❌ [서버] TechSet 매핑 테이블 생성 실패:', error);
        return {
            skillsMap: new Map(),
            jobGroupsMap: new Map()
        };
    }
}

/**
 * ID를 실제 이름으로 매핑하는 함수
 */
function mapIdToName(
    id: string,
    skillsMap: Map<string, string>,
    jobGroupsMap: Map<string, string>
): { type: 'skill' | 'jobGroup'; name: string } {
    // 스킬에서 먼저 찾기
    const skillName = skillsMap.get(id);
    if (skillName) {
        return { type: 'skill', name: skillName };
    }

    // 직군에서 찾기
    const jobGroupName = jobGroupsMap.get(id);
    if (jobGroupName) {
        return { type: 'jobGroup', name: jobGroupName };
    }

    // 매핑 실패시 ID 그대로 반환
    console.warn(`⚠️ [서버] 매핑 실패: "${id}" -> ID 그대로 반환`);
    return { type: 'skill', name: id };
}

/**
 * Firestore 문서 존재 여부만 체크하는 함수
 * page.tsx에서 404 처리를 위해 사용
 */
export async function checkDocumentExists(documentId: string): Promise<boolean> {
    try {
        console.log(`🔍 [서버] 문서 존재 여부 체크: ${documentId}`);

        const docRef = doc(firestore, BLOGS_COLLECTION, documentId);
        const docSnap = await getDoc(docRef);

        const exists = docSnap.exists();
        console.log(`${exists ? '✅' : '❌'} [서버] 문서 존재 여부: ${exists}`);

        return exists;
    } catch (error) {
        console.error('❌ [서버] 문서 존재 여부 체크 실패:', error);
        return false;
    }
}

/**
 * 서버 컴포넌트에서 사용할 블로그 데이터 페칭 함수
 * 실제 Firestore의 Skill, JobGroup 컬렉션을 사용하여 ID를 이름으로 매핑
 */
export async function fetchBlogData(documentId: string): Promise<ServerBlogData> {
    try {
        console.log(`🚀 [서버] 블로그 데이터 페칭 시작: ${documentId}`);

        // 블로그 데이터와 TechSet 매핑을 병렬로 가져오기 (성능 최적화)
        const [blogDocSnap, { skillsMap, jobGroupsMap }] = await Promise.all([
            getDoc(doc(firestore, BLOGS_COLLECTION, documentId)),
            createTechSetMappings()
        ]);

        if (!blogDocSnap.exists()) {
            throw new Error(`Blog document does not exist: ${documentId}`);
        }

        const blogData = blogDocSnap.data();
        console.log('📖 [서버] 블로그 데이터:', {
            title: blogData.title,
            skillIds: blogData.related_skill_ids || [],
            jobGroupIds: blogData.related_job_group_ids || []
        });

        if (typeof blogData.title !== 'string') {
            throw new Error('Invalid blog title');
        }

        // TechSet ID들을 이름으로 매핑
        const relatedTechSets: Array<{
            id: string;
            name: string;
            type: 'skill' | 'jobGroup';
        }> = [];

        // 스킬 ID 매핑
        const skillIds = blogData.related_skill_ids || [];
        skillIds.forEach((id: string) => {
            const mapped = mapIdToName(id, skillsMap, jobGroupsMap);
            relatedTechSets.push({
                id,
                name: mapped.name,
                type: 'skill'
            });
            console.log(`🔧 [서버] 스킬 매핑: "${id}" -> "${mapped.name}"`);
        });

        // 직군 ID 매핑
        const jobGroupIds = blogData.related_job_group_ids || [];
        jobGroupIds.forEach((id: string) => {
            const mapped = mapIdToName(id, skillsMap, jobGroupsMap);
            relatedTechSets.push({
                id,
                name: mapped.name,
                type: 'jobGroup'
            });
            console.log(`👥 [서버] 직군 매핑: "${id}" -> "${mapped.name}"`);
        });

        console.log(`✅ [서버] 블로그 데이터 페칭 완료: ${relatedTechSets.length}개 TechSet 매핑`);

        // 썸네일 URL 유효성 검사
        const thumbnailUrl = blogData.thumbnail_url;
        const validThumbnailUrl = thumbnailUrl && isValidUrl(thumbnailUrl) ? thumbnailUrl : undefined;

        if (thumbnailUrl) {
            console.log(`🖼️ [서버] 썸네일 URL 체크: "${thumbnailUrl}" -> ${validThumbnailUrl ? '유효' : '무효'}`);
        }

        return {
            title: blogData.title,
            thumbnailUrl: validThumbnailUrl,
            relatedTechSets
        };

    } catch (error) {
        console.error('❌ [서버] 블로그 데이터 페칭 실패:', error);
        // 에러 발생시 기본값 반환
        return {
            title: 'Blog Title Loading Failed',
            relatedTechSets: [],
            thumbnailUrl: undefined
        };
    }
} 