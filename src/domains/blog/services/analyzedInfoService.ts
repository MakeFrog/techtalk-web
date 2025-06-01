import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { Question } from '@/domains/blog/hooks/useQuestionStream';
import { ProgrammingKeyword } from '@/app/blog/[id]/components/Content/components/Summary/types/keywordTypes';

/**
 * 블로그 분석 정보 통합 관리 서비스
 * 
 * 가이드라인 준수:
 * - 단일 책임: 분석 정보 저장/조회만 담당
 * - 예측 가능성: 함수명과 시그니처로 동작 예측 가능
 * - 숨은 로직 없음: 저장/조회 외 다른 사이드 이펙트 없음
 * - 기존 타입 재사용: 코드 중복 방지 및 일관성 유지
 */

// 기존 타입들을 재사용
export type QnAItem = Question; // 기존 Question 타입 재사용
export type ProgrammingKeywordItem = ProgrammingKeyword; // 기존 ProgrammingKeyword 타입 재사용

// 전체 분석 정보 타입 (기존 구조와 호환)
export interface AnalyzedInfo {
    insight?: string;
    qna?: QnAItem[];
    programming_keywords?: ProgrammingKeywordItem[];
    toc?: string[]; // 순서대로 저장되는 문자열 배열
    summary?: string;
    createdAt?: string;
    updatedAt?: string;
}

// 저장 결과 타입 (Discriminated Union)
export type SaveResult =
    | { success: true; documentPath: string }
    | { success: false; error: string };

// 조회 결과 타입 (Discriminated Union)
export type GetResult =
    | { success: true; data: AnalyzedInfo; exists: true }
    | { success: true; data: null; exists: false }
    | { success: false; error: string; exists: false };

// 필드 존재 확인 결과 타입
export type FieldExistsResult =
    | { exists: true; data: any }
    | { exists: false; data: null };

/**
 * 분석 정보 부분 업데이트
 * 
 * @param documentId 블로그 문서 ID
 * @param partialData 업데이트할 부분 데이터
 * @returns 저장 결과
 */
export async function updateAnalyzedInfo(
    documentId: string,
    partialData: Partial<AnalyzedInfo>
): Promise<SaveResult> {
    try {
        console.log(`💾 [AnalyzedInfo] 부분 업데이트 시작: ${documentId}`);
        console.log('📝 [AnalyzedInfo] 업데이트 필드:', Object.keys(partialData));

        // 입력 데이터 검증
        if (!documentId || typeof documentId !== 'string') {
            throw new Error('유효한 documentId가 필요합니다.');
        }

        // 각 필드별 데이터 검증
        if (partialData.insight !== undefined && typeof partialData.insight !== 'string') {
            throw new Error('insight는 문자열이어야 합니다.');
        }

        if (partialData.summary !== undefined && typeof partialData.summary !== 'string') {
            throw new Error('summary는 문자열이어야 합니다.');
        }

        if (partialData.qna !== undefined && !Array.isArray(partialData.qna)) {
            throw new Error('qna는 배열이어야 합니다.');
        }

        if (partialData.programming_keywords !== undefined && !Array.isArray(partialData.programming_keywords)) {
            throw new Error('programming_keywords는 배열이어야 합니다.');
        }

        if (partialData.toc !== undefined && !Array.isArray(partialData.toc)) {
            throw new Error('toc는 배열이어야 합니다.');
        }

        // Firestore 경로: Blogs/{documentId}/AnalyzedInfo/{documentId}
        const analyzedInfoRef = doc(
            firestore,
            'Blogs',
            documentId,
            'AnalyzedInfo',
            documentId
        );

        const updateData = {
            ...partialData,
            updatedAt: new Date().toISOString(),
        };

        // 처음 생성하는 경우 createdAt 추가
        const existingDoc = await getDoc(analyzedInfoRef);
        if (!existingDoc.exists()) {
            updateData.createdAt = new Date().toISOString();
        }

        await setDoc(analyzedInfoRef, updateData, { merge: true });

        const documentPath = analyzedInfoRef.path;
        console.log(`✅ [AnalyzedInfo] 부분 업데이트 완료: ${documentPath}`);

        return {
            success: true,
            documentPath
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        console.error(`❌ [AnalyzedInfo] 부분 업데이트 실패 (${documentId}):`, error);

        return {
            success: false,
            error: errorMessage
        };
    }
}

/**
 * 분석 정보 조회
 * 
 * @param documentId 블로그 문서 ID
 * @returns 조회 결과
 */
export async function getAnalyzedInfo(documentId: string): Promise<GetResult> {
    try {
        console.log(`🔍 [AnalyzedInfo] 조회 시작: ${documentId}`);

        if (!documentId || typeof documentId !== 'string') {
            throw new Error('유효한 documentId가 필요합니다.');
        }

        const analyzedInfoRef = doc(
            firestore,
            'Blogs',
            documentId,
            'AnalyzedInfo',
            documentId
        );

        const docSnapshot = await getDoc(analyzedInfoRef);

        if (docSnapshot.exists()) {
            const data = docSnapshot.data() as AnalyzedInfo;
            console.log(`✅ [AnalyzedInfo] 조회 성공: ${documentId}`);
            console.log('📋 [AnalyzedInfo] 사용 가능한 필드:', Object.keys(data));

            return {
                success: true,
                data,
                exists: true
            };
        } else {
            console.log(`📭 [AnalyzedInfo] 데이터 없음: ${documentId}`);
            return {
                success: true,
                data: null,
                exists: false
            };
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        console.error(`❌ [AnalyzedInfo] 조회 실패 (${documentId}):`, error);

        return {
            success: false,
            error: errorMessage,
            exists: false
        };
    }
}

/**
 * 특정 필드 존재 여부 확인
 * 
 * @param documentId 블로그 문서 ID
 * @param field 확인할 필드명
 * @returns 필드 존재 여부와 데이터
 */
export async function checkFieldExists(
    documentId: string,
    field: keyof AnalyzedInfo
): Promise<FieldExistsResult> {
    try {
        const result = await getAnalyzedInfo(documentId);

        if (result.success && result.exists) {
            const fieldValue = result.data[field];
            let exists = fieldValue !== undefined && fieldValue !== null;

            // 배열인 경우 길이도 확인
            if (Array.isArray(fieldValue)) {
                exists = exists && fieldValue.length > 0;
            }

            // 문자열인 경우 빈 문자열도 확인
            if (typeof fieldValue === 'string') {
                exists = exists && fieldValue.trim().length > 0;
            }

            if (exists) {
                return { exists: true, data: fieldValue };
            }
        }

        return { exists: false, data: null };
    } catch (error) {
        console.error(`❌ [AnalyzedInfo] 필드 존재 확인 실패 (${documentId}, ${field}):`, error);
        return { exists: false, data: null };
    }
} 