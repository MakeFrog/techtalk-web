import { NextRequest, NextResponse } from 'next/server';
import { getAnalyzedInfo } from '@/domains/blog/services/analyzedInfoService';

/**
 * 블로그 분석 정보 조회 API
 * 
 * 가이드라인 준수:
 * - 단일 책임: 분석 정보 조회만 담당
 * - 예측 가능성: GET 요청으로 조회 동작 명확
 * - 표준화된 응답: 일관된 응답 타입
 */

interface AnalyzedInfoResponse {
    success: boolean;
    data?: any;
    exists: boolean;
    message?: string;
    error?: string;
}

export async function GET(
    request: NextRequest,
    { params }: { params: { documentId: string } }
): Promise<NextResponse<AnalyzedInfoResponse>> {
    try {
        const { documentId } = params;

        console.log('🔍 [Analyzed Info API] 조회 요청:', { documentId });

        if (!documentId) {
            console.error('❌ [Analyzed Info API] documentId가 없습니다.');
            return NextResponse.json(
                {
                    success: false,
                    exists: false,
                    message: 'documentId가 필요합니다.',
                    error: 'Missing documentId'
                },
                { status: 400 }
            );
        }

        // 분석 정보 조회
        const result = await getAnalyzedInfo(documentId);

        if (result.success) {
            if (result.exists) {
                console.log('✅ [Analyzed Info API] 조회 성공:', {
                    documentId,
                    fields: Object.keys(result.data)
                });

                return NextResponse.json(
                    {
                        success: true,
                        data: result.data,
                        exists: true,
                        message: '분석 정보를 성공적으로 조회했습니다.'
                    },
                    { status: 200 }
                );
            } else {
                console.log('📭 [Analyzed Info API] 데이터 없음:', { documentId });

                return NextResponse.json(
                    {
                        success: true,
                        data: null,
                        exists: false,
                        message: '저장된 분석 정보가 없습니다.'
                    },
                    { status: 200 }
                );
            }
        } else {
            console.error('❌ [Analyzed Info API] 조회 실패:', result.error);

            return NextResponse.json(
                {
                    success: false,
                    exists: false,
                    message: '분석 정보 조회에 실패했습니다.',
                    error: result.error
                },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('❌ [Analyzed Info API] 전체 오류:', error);

        return NextResponse.json(
            {
                success: false,
                exists: false,
                message: '서버 오류가 발생했습니다.',
                error: error instanceof Error ? error.message : '알 수 없는 오류'
            },
            { status: 500 }
        );
    }
} 