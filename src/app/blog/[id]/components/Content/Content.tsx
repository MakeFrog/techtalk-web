'use client';

import { Gap } from "@/components/gap/Gap.tsx";
import ContentHeader from "./components/ContentHeader/ContentHeader.tsx";
import { InsightSectionView } from "./components/Insight/InsightSectionView.tsx";
import { container } from "./Content.css.ts";
import { QuestionSectionView } from "./components/Question/QuestionSectionView.tsx";
import { SummarySectionView } from "./components/Summary/SummarySectionView.tsx";
import { useInsightStream } from "@/domains/blog/hooks/useInsightStream";
import { useBlogBasicInfo } from "@/domains/blog/providers/BlogBasicInfoProvider";
import { useEffect, useRef, useCallback } from "react";

export default function Content() {
    // BlogBasicInfoProvider에서 데이터와 상태 가져오기
    const { state } = useBlogBasicInfo();

    // 인사이트 스트림 상태
    const { state: insightState, startStreaming: startInsightStreaming } = useInsightStream();

    // 스트리밍이 이미 시작되었는지 추적
    const streamingStartedRef = useRef<boolean>(false);

    // 인사이트 스트리밍 시작 콜백
    const handleStartInsightStreaming = useCallback(() => {
        // 데이터가 준비되고 스트리밍이 아직 시작되지 않았을 때만 실행
        const isDataReady = (
            state.status === 'success' &&
            state.data.title &&
            state.data.content.trim()
        );

        const shouldStartStreaming = (
            isDataReady &&
            !streamingStartedRef.current &&
            insightState.status === 'idle'
        );

        if (shouldStartStreaming) {
            streamingStartedRef.current = true;

            const blogInput = {
                title: state.data.title,
                text: state.data.content
            };

            console.log('🚀 [Content] 인사이트 스트리밍 시작:', {
                title: blogInput.title,
                textLength: blogInput.text.length,
                insightState: insightState.status
            });

            startInsightStreaming(blogInput);
        }
    }, [state, insightState.status, startInsightStreaming]);

    // 블로그 데이터가 준비되면 인사이트 스트리밍 시작
    useEffect(() => {
        handleStartInsightStreaming();
    }, [handleStartInsightStreaming]);

    // 데이터가 변경되면 스트리밍 상태 리셋
    useEffect(() => {
        streamingStartedRef.current = false;
    }, [state]);

    // 로딩 상태 표시
    if (state.status === 'loading') {
        return (
            <section className={container}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '200px',
                    color: '#64748b',
                    fontSize: '14px'
                }}>
                    블로그 데이터를 로딩 중입니다...
                </div>
            </section>
        );
    }

    // 에러 상태 표시
    if (state.status === 'error') {
        return (
            <section className={container}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '200px',
                    color: '#ef4444',
                    fontSize: '14px',
                    gap: '8px'
                }}>
                    <span>⚠️</span>
                    <span>블로그 로딩 중 오류가 발생했습니다.</span>
                    <span style={{ fontSize: '12px', opacity: 0.7 }}>
                        {state.error}
                    </span>
                </div>
            </section>
        );
    }

    // 정상적인 콘텐츠 렌더링 (state.status === 'success')
    return (
        <section className={container}>
            <ContentHeader />
            <Gap size={24} />
            <InsightSectionView streamState={insightState} />
            <Gap size={20} />
            <QuestionSectionView />
            <Gap size={24} />
            <SummarySectionView />
        </section>
    );
}   