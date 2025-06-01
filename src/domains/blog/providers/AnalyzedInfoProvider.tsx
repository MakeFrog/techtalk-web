'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useBlogBasicInfo } from './BlogBasicInfoProvider';
import { AnalyzedInfo } from '../services/analyzedInfoService';

// 개별 필드 상태 타입
type FieldStatus = 'pending' | 'loading' | 'completed' | 'error';

// 전체 분석 정보 상태
interface AnalyzedInfoState {
    // 데이터
    insight?: string;
    qna?: any[];
    toc?: string[];
    programming_keywords?: any[];
    summary?: string;

    // 각 필드별 상태
    fieldStatus: {
        insight: FieldStatus;
        qna: FieldStatus;
        toc: FieldStatus;
        programming_keywords: FieldStatus;
        summary: FieldStatus;
    };

    // 전체 로딩 상태
    isInitialCheckComplete: boolean;
    allFieldsComplete: boolean;
}

interface AnalyzedInfoContextType {
    state: AnalyzedInfoState;

    // 개별 필드 로딩 함수들
    loadInsight: () => Promise<void>;
    loadQuestions: () => Promise<void>;
    loadToc: () => Promise<void>;
    loadKeywords: () => Promise<void>;
    loadSummary: () => Promise<void>;

    // 전체 새로고침
    refreshAll: () => Promise<void>;
}

const AnalyzedInfoContext = createContext<AnalyzedInfoContextType | null>(null);

interface AnalyzedInfoProviderProps {
    children: React.ReactNode;
}

/**
 * 분석 정보 통합 관리 Provider
 * 
 * 기능:
 * - 초기 로드 시 전체 분석 정보 상태 확인
 * - 없는 필드만 부분적으로 로딩
 * - 각 필드별 독립적인 상태 관리
 * - 자동 의존성 해결 (요약은 목차+키워드 필요)
 */
export function AnalyzedInfoProvider({ children }: AnalyzedInfoProviderProps) {
    const { documentId, state: blogState } = useBlogBasicInfo();

    const [state, setState] = useState<AnalyzedInfoState>({
        fieldStatus: {
            insight: 'pending',
            qna: 'pending',
            toc: 'pending',
            programming_keywords: 'pending',
            summary: 'pending',
        },
        isInitialCheckComplete: false,
        allFieldsComplete: false,
    });

    // 전체 분석 정보 초기 확인
    const checkInitialState = useCallback(async () => {
        if (!documentId) return;

        console.log('🔍 [AnalyzedInfo] 초기 상태 확인 시작:', documentId);

        try {
            const response = await fetch(`/api/blog/analyzed-info/${documentId}`);
            const result = await response.json();

            if (result.success && result.exists && result.data) {
                const data: AnalyzedInfo = result.data;

                console.log('✅ [AnalyzedInfo] 기존 데이터 발견:', {
                    hasInsight: !!data.insight,
                    hasQna: !!(data.qna && data.qna.length > 0),
                    hasToc: !!(data.toc && data.toc.length > 0),
                    hasKeywords: !!(data.programming_keywords && data.programming_keywords.length > 0),
                    hasSummary: !!data.summary,
                });

                setState(prev => ({
                    ...prev,
                    insight: data.insight,
                    qna: data.qna,
                    toc: data.toc,
                    programming_keywords: data.programming_keywords,
                    summary: data.summary,
                    fieldStatus: {
                        insight: data.insight ? 'completed' : 'pending',
                        qna: (data.qna && data.qna.length > 0) ? 'completed' : 'pending',
                        toc: (data.toc && data.toc.length > 0) ? 'completed' : 'pending',
                        programming_keywords: (data.programming_keywords && data.programming_keywords.length > 0) ? 'completed' : 'pending',
                        summary: data.summary ? 'completed' : 'pending',
                    },
                    isInitialCheckComplete: true,
                    allFieldsComplete: !!(
                        data.insight &&
                        data.qna && data.qna.length > 0 &&
                        data.toc && data.toc.length > 0 &&
                        data.programming_keywords && data.programming_keywords.length > 0 &&
                        data.summary
                    ),
                }));
            } else {
                console.log('📭 [AnalyzedInfo] 기존 데이터 없음');
                setState(prev => ({
                    ...prev,
                    isInitialCheckComplete: true,
                    allFieldsComplete: false,
                }));
            }
        } catch (error) {
            console.error('❌ [AnalyzedInfo] 초기 확인 실패:', error);
            setState(prev => ({
                ...prev,
                isInitialCheckComplete: true,
                allFieldsComplete: false,
            }));
        }
    }, [documentId]);

    // 인사이트 로딩
    const loadInsight = useCallback(async () => {
        if (!documentId || blogState.status !== 'success') return;
        if (state.fieldStatus.insight !== 'pending') return;

        console.log('🚀 [AnalyzedInfo] 인사이트 로딩 시작');
        setState(prev => ({
            ...prev,
            fieldStatus: { ...prev.fieldStatus, insight: 'loading' }
        }));

        try {
            const response = await fetch('/api/blog/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: blogState.data.title,
                    text: blogState.data.content,
                    documentId
                })
            });

            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType?.includes('application/json')) {
                    // 기존 데이터 사용
                    const result = await response.json();
                    if (result.useExisting && result.data) {
                        setState(prev => ({
                            ...prev,
                            insight: result.data,
                            fieldStatus: { ...prev.fieldStatus, insight: 'completed' }
                        }));
                        return;
                    }
                }

                // 스트리밍 처리 (필요한 경우)
                // 여기서는 기본적으로 기존 데이터만 처리
                setState(prev => ({
                    ...prev,
                    fieldStatus: { ...prev.fieldStatus, insight: 'completed' }
                }));
            } else {
                throw new Error('인사이트 로딩 실패');
            }
        } catch (error) {
            console.error('❌ [AnalyzedInfo] 인사이트 로딩 실패:', error);
            setState(prev => ({
                ...prev,
                fieldStatus: { ...prev.fieldStatus, insight: 'error' }
            }));
        }
    }, [documentId, blogState, state.fieldStatus.insight]);

    // 질문 로딩
    const loadQuestions = useCallback(async () => {
        if (!documentId || blogState.status !== 'success') return;
        if (state.fieldStatus.qna !== 'pending') return;

        console.log('🚀 [AnalyzedInfo] 질문 로딩 시작');
        setState(prev => ({
            ...prev,
            fieldStatus: { ...prev.fieldStatus, qna: 'loading' }
        }));

        try {
            const response = await fetch('/api/blog/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: blogState.data.title,
                    content: blogState.data.content,
                    documentId
                })
            });

            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType?.includes('application/json')) {
                    // 기존 데이터 사용
                    const result = await response.json();
                    if (result.useExisting && result.data) {
                        setState(prev => ({
                            ...prev,
                            qna: result.data,
                            fieldStatus: { ...prev.fieldStatus, qna: 'completed' }
                        }));
                        return;
                    }
                }

                setState(prev => ({
                    ...prev,
                    fieldStatus: { ...prev.fieldStatus, qna: 'completed' }
                }));
            } else {
                throw new Error('질문 로딩 실패');
            }
        } catch (error) {
            console.error('❌ [AnalyzedInfo] 질문 로딩 실패:', error);
            setState(prev => ({
                ...prev,
                fieldStatus: { ...prev.fieldStatus, qna: 'error' }
            }));
        }
    }, [documentId, blogState, state.fieldStatus.qna]);

    // 목차 로딩 (스트리밍 없음, 즉시 처리)
    const loadToc = useCallback(async () => {
        if (!documentId || blogState.status !== 'success') return;
        if (state.fieldStatus.toc !== 'pending') return;

        console.log('🚀 [AnalyzedInfo] 목차 로딩 시작');
        setState(prev => ({
            ...prev,
            fieldStatus: { ...prev.fieldStatus, toc: 'loading' }
        }));

        try {
            const response = await fetch('/api/blog/toc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: blogState.data.title,
                    text: blogState.data.content,
                    documentId
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.useExisting && result.toc) {
                    // 기존 데이터 사용
                    console.log('✅ [AnalyzedInfo] 목차 기존 데이터 사용:', result.toc.length);
                    setState(prev => ({
                        ...prev,
                        toc: result.toc,
                        fieldStatus: { ...prev.fieldStatus, toc: 'completed' }
                    }));
                } else if (result.toc) {
                    // 새로 생성된 데이터
                    console.log('✅ [AnalyzedInfo] 목차 새로 생성됨:', result.toc.length);
                    setState(prev => ({
                        ...prev,
                        toc: result.toc,
                        fieldStatus: { ...prev.fieldStatus, toc: 'completed' }
                    }));
                } else {
                    throw new Error('목차 데이터를 받지 못했습니다');
                }
            } else {
                throw new Error(`목차 API 오류: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ [AnalyzedInfo] 목차 로딩 실패:', error);
            setState(prev => ({
                ...prev,
                fieldStatus: { ...prev.fieldStatus, toc: 'error' }
            }));
        }
    }, [documentId, blogState, state.fieldStatus.toc]);

    // 키워드 로딩
    const loadKeywords = useCallback(async () => {
        if (!documentId || blogState.status !== 'success') return;
        if (state.fieldStatus.programming_keywords !== 'pending') return;

        console.log('🚀 [AnalyzedInfo] 키워드 로딩 시작');
        setState(prev => ({
            ...prev,
            fieldStatus: { ...prev.fieldStatus, programming_keywords: 'loading' }
        }));

        try {
            const response = await fetch('/api/blog/keywords', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: blogState.data.title,
                    text: blogState.data.content,
                    documentId
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.useExisting && result.keywords) {
                    // 기존 데이터 사용
                    console.log('✅ [AnalyzedInfo] 키워드 기존 데이터 사용:', result.keywords.length);
                    setState(prev => ({
                        ...prev,
                        programming_keywords: result.keywords,
                        fieldStatus: { ...prev.fieldStatus, programming_keywords: 'completed' }
                    }));
                } else if (result.keywords) {
                    // 새로 생성된 데이터
                    console.log('✅ [AnalyzedInfo] 키워드 새로 생성됨:', result.keywords.length);
                    setState(prev => ({
                        ...prev,
                        programming_keywords: result.keywords,
                        fieldStatus: { ...prev.fieldStatus, programming_keywords: 'completed' }
                    }));
                } else {
                    throw new Error('키워드 데이터를 받지 못했습니다');
                }
            } else {
                throw new Error(`키워드 API 오류: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ [AnalyzedInfo] 키워드 로딩 실패:', error);
            setState(prev => ({
                ...prev,
                fieldStatus: { ...prev.fieldStatus, programming_keywords: 'error' }
            }));
        }
    }, [documentId, blogState, state.fieldStatus.programming_keywords]);

    // 요약 로딩 (목차와 키워드 필요)
    const loadSummary = useCallback(async () => {
        if (!documentId || blogState.status !== 'success') return;
        if (state.fieldStatus.summary !== 'pending') return;
        if (!state.toc || !state.programming_keywords) return; // 의존성 확인

        console.log('🚀 [AnalyzedInfo] 요약 로딩 시작');
        setState(prev => ({
            ...prev,
            fieldStatus: { ...prev.fieldStatus, summary: 'loading' }
        }));

        try {
            const response = await fetch('/api/blog/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: blogState.data.title,
                    text: blogState.data.content,
                    toc: state.toc,
                    keywords: state.programming_keywords,
                    documentId
                })
            });

            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType?.includes('application/json')) {
                    // 기존 데이터 사용
                    const result = await response.json();
                    if (result.useExisting && result.summary) {
                        console.log('✅ [AnalyzedInfo] 요약 기존 데이터 사용');
                        setState(prev => ({
                            ...prev,
                            summary: result.summary,
                            fieldStatus: { ...prev.fieldStatus, summary: 'completed' }
                        }));
                        return;
                    }
                }

                // 스트리밍 응답 처리 (새로 생성하는 경우)
                if (response.body) {
                    console.log('📡 [AnalyzedInfo] 요약 스트리밍 시작');
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let accumulatedContent = '';

                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;

                            const chunk = decoder.decode(value, { stream: true });
                            accumulatedContent += chunk;

                            // 실시간 업데이트 - fieldStatus는 'loading' 유지
                            setState(prev => ({
                                ...prev,
                                summary: accumulatedContent.trim(),
                                fieldStatus: { ...prev.fieldStatus, summary: 'loading' } // 스트리밍 중에는 loading 유지
                            }));

                            console.log('📨 [AnalyzedInfo] 요약 청크 수신:', {
                                chunkLength: chunk.length,
                                totalLength: accumulatedContent.length
                            });
                        }

                        console.log('✅ [AnalyzedInfo] 요약 스트리밍 완료');
                        setState(prev => ({
                            ...prev,
                            summary: accumulatedContent.trim(),
                            fieldStatus: { ...prev.fieldStatus, summary: 'completed' }
                        }));
                    } catch (streamError) {
                        console.error('❌ [AnalyzedInfo] 요약 스트리밍 오류:', streamError);
                        throw streamError;
                    } finally {
                        reader.releaseLock();
                    }
                } else {
                    throw new Error('요약 응답 본문이 없습니다');
                }
            } else {
                throw new Error(`요약 API 오류: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ [AnalyzedInfo] 요약 로딩 실패:', error);
            setState(prev => ({
                ...prev,
                fieldStatus: { ...prev.fieldStatus, summary: 'error' }
            }));
        }
    }, [documentId, blogState, state.fieldStatus.summary, state.toc, state.programming_keywords]);

    // 전체 새로고침
    const refreshAll = useCallback(async () => {
        setState(prev => ({
            ...prev,
            fieldStatus: {
                insight: 'pending',
                qna: 'pending',
                toc: 'pending',
                programming_keywords: 'pending',
                summary: 'pending',
            },
            isInitialCheckComplete: false,
            allFieldsComplete: false,
        }));

        await checkInitialState();
    }, [checkInitialState]);

    // 초기 상태 확인
    useEffect(() => {
        if (documentId && blogState.status === 'success' && !state.isInitialCheckComplete) {
            checkInitialState();
        }
    }, [documentId, blogState.status, state.isInitialCheckComplete, checkInitialState]);

    // 자동 로딩 (필요한 것만)
    useEffect(() => {
        if (!state.isInitialCheckComplete || blogState.status !== 'success') {
            console.log('🔍 [AnalyzedInfo] 자동 로딩 조건 확인:', {
                isInitialCheckComplete: state.isInitialCheckComplete,
                blogStatus: blogState.status
            });
            return;
        }

        console.log('🔍 [AnalyzedInfo] 필드 상태 확인:', {
            insight: state.fieldStatus.insight,
            qna: state.fieldStatus.qna,
            toc: state.fieldStatus.toc,
            programming_keywords: state.fieldStatus.programming_keywords,
            summary: state.fieldStatus.summary
        });

        // 병렬로 독립적인 항목들 로딩
        if (state.fieldStatus.insight === 'pending') {
            console.log('🚀 [AnalyzedInfo] 인사이트 로딩 예약');
            loadInsight();
        }
        if (state.fieldStatus.qna === 'pending') {
            console.log('🚀 [AnalyzedInfo] 질문 로딩 예약');
            loadQuestions();
        }
        if (state.fieldStatus.toc === 'pending') {
            console.log('🚀 [AnalyzedInfo] 목차 로딩 예약');
            loadToc();
        }
        if (state.fieldStatus.programming_keywords === 'pending') {
            console.log('🚀 [AnalyzedInfo] 키워드 로딩 예약');
            loadKeywords();
        }

        // 요약은 목차와 키워드가 완료된 후에만
        if (state.fieldStatus.summary === 'pending' &&
            state.fieldStatus.toc === 'completed' &&
            state.fieldStatus.programming_keywords === 'completed') {
            console.log('🚀 [AnalyzedInfo] 요약 로딩 예약 (의존성 완료)');
            loadSummary();
        } else if (state.fieldStatus.summary === 'pending') {
            console.log('⏳ [AnalyzedInfo] 요약 로딩 대기 중 (의존성 미완료):', {
                tocStatus: state.fieldStatus.toc,
                keywordsStatus: state.fieldStatus.programming_keywords
            });
        }
    }, [
        state.isInitialCheckComplete,
        state.fieldStatus,
        blogState,
        loadInsight,
        loadQuestions,
        loadToc,
        loadKeywords,
        loadSummary
    ]);

    const contextValue: AnalyzedInfoContextType = {
        state,
        loadInsight,
        loadQuestions,
        loadToc,
        loadKeywords,
        loadSummary,
        refreshAll,
    };

    return (
        <AnalyzedInfoContext.Provider value={contextValue}>
            {children}
        </AnalyzedInfoContext.Provider>
    );
}

export function useAnalyzedInfo(): AnalyzedInfoContextType {
    const context = useContext(AnalyzedInfoContext);
    if (!context) {
        throw new Error('useAnalyzedInfo must be used within AnalyzedInfoProvider');
    }
    return context;
} 