import { NextRequest, NextResponse } from 'next/server';
import { getAnalyzedInfo } from '@/domains/blog/services/analyzedInfoService';

interface RouteParams {
    params: { documentId: string };
}

/**
 * 블로그 분석 정보 조회 API
 * GET /api/blog/analyzed-info/[documentId]
 */
export async function GET(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse> {
    try {
        const { documentId } = params;

        console.log(`🔍 [AnalyzedInfo API] 조회 요청: ${documentId}`);

        // 입력 검증
        if (!documentId || typeof documentId !== 'string') {
            return NextResponse.json(
                {
                    success: false,
                    error: '유효한 documentId가 필요합니다.'
                },
                { status: 400 }
            );
        }

        // Firestore에서 분석 정보 조회
        const result = await getAnalyzedInfo(documentId);

        if (!result.success) {
            console.error(`❌ [AnalyzedInfo API] 조회 실패: ${documentId}`, result.error);
            return NextResponse.json(
                {
                    success: false,
                    error: result.error,
                    exists: false
                },
                { status: 500 }
            );
        }

        if (!result.exists) {
            console.log(`📭 [AnalyzedInfo API] 데이터 없음: ${documentId}`);
            return NextResponse.json({
                success: true,
                exists: false,
                data: null
            });
        }

        console.log(`✅ [AnalyzedInfo API] 조회 성공: ${documentId}`);
        console.log('📋 [AnalyzedInfo API] 사용 가능한 필드:', Object.keys(result.data));

        return NextResponse.json({
            success: true,
            exists: true,
            data: result.data
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        console.error(`❌ [AnalyzedInfo API] 처리 중 오류:`, error);

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
                exists: false
            },
            { status: 500 }
        );
    }
} 