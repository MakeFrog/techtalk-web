'use client';

import { Gap } from "@/components/gap/Gap.tsx";
import ContentHeader from "./components/ContentHeader/ContentHeader.tsx";
import { InsightSectionView } from "./components/Insight/InsightSectionView.tsx";
import { container, loadingContainer, errorContainer, errorDetailText } from "./Content.css.ts";
import { QuestionSectionView } from "./components/Question/QuestionSectionView.tsx";
import { SummarySectionView } from "./components/Summary/SummarySectionView.tsx";
import { useInsightStream } from "@/domains/blog/hooks/useInsightStream";
import { useBlogBasicInfo } from "@/domains/blog/providers/BlogBasicInfoProvider";
import { useEffect } from "react";

export default function Content() {
    // BlogBasicInfoProvider에서 데이터와 상태 가져오기
    const { state } = useBlogBasicInfo();

    // 인사이트 스트림 상태
    const { state: insightState, startStreaming: startInsightStreaming } = useInsightStream();

    // 블로그 데이터가 준비되면 인사이트 스트리밍 시작
    useEffect(() => {
        if (state.status === 'success' && insightState.status === 'idle') {
            const { title, content } = state.data;

            console.log('⚡ [Content] 인사이트 스트리밍 시작:', {
                title: title.substring(0, 50) + '...',
                contentLength: content.length,
                insightState: insightState.status
            });

            startInsightStreaming({
                title: title,
                text: content
            });
        }
    }, [state, insightState.status, startInsightStreaming]);

    // 로딩 상태 표시
    if (state.status === 'loading') {
        return (
            <section className={container}>
                <div className={loadingContainer}>
                    {/* 블로그 데이터를 로딩 중입니다... */}
                </div>
            </section>
        );
    }

    // 에러 상태 표시
    if (state.status === 'error') {
        return (
            <section className={container}>
                <div className={errorContainer}>
                    <span>⚠️</span>
                    <span>블로그 로딩 중 오류가 발생했습니다.</span>
                    <span className={errorDetailText}>
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