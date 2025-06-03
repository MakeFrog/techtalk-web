import { WebsiteStructuredData } from "@/components/SEO";

/**
 * SEO를 위한 로딩 상태의 구조화 데이터 컴포넌트
 * 
 * 페이지 로딩 중일 때 검색엔진에 기본적인 웹사이트 정보를 제공합니다.
 * 실제 UI에는 표시되지 않으며, HTML의 head 영역에 JSON-LD 형태로 삽입됩니다.
 * 
 * @returns {JSX.Element} 구조화 데이터가 포함된 script 태그
 */
export default function SeoInvisibleLoadingView() {
    return (
        <WebsiteStructuredData
            type="WebPage"
            title="테크톡 - 개발자 면접과 프로그래밍 학습 플랫폼"
            description="개발자 면접 준비와 프로그래밍 학습을 위한 AI 기반 플랫폼. 기술 블로그 큐레이션, 개발자 면접 대비, 코딩 테스트 준비를 지원합니다."
            url={typeof window !== 'undefined' ? window.location.href : undefined}
            isLoading={true}
            additionalData={{
                "keywords": "인프런, 유데미, 잡코리아, 사람인, 원티드, 자바 기술 면접, 리액트 기술면접, 개발자 면접, 프로그래밍 학습, 코딩 테스트, 기술 면접, 소프트웨어 개발, 개발자 교육, IT 기술 블로그, 알고리즘 학습, 프로그래밍 문제 해결, 개발자 스킬업",
                "about": [
                    {
                        "@type": "Thing",
                        "name": "개발자 면접 준비",
                        "description": "기술 면접, 코딩 테스트, 알고리즘 문제 해결"
                    },
                    {
                        "@type": "Thing",
                        "name": "프로그래밍 학습",
                        "description": "소프트웨어 개발, 코딩 스킬, 기술 블로그 학습"
                    }
                ]
            }}
        />
    );
}