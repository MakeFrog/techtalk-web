'use client';

import React from 'react';

/**
 * 웹사이트 구조화 데이터 타입
 */
interface WebsiteStructuredDataProps {
    /** 페이지 타입 */
    type?: 'WebSite' | 'WebPage' | 'Organization' | 'BreadcrumbList';
    /** 페이지 제목 */
    title?: string;
    /** 페이지 설명 */
    description?: string;
    /** 현재 페이지 URL */
    url?: string;
    /** 대표 이미지 URL */
    imageUrl?: string;
    /** 로딩 상태 여부 */
    isLoading?: boolean;
    /** 추가 데이터 */
    additionalData?: Record<string, any>;
}

/**
 * 범용 웹사이트 구조화 데이터 컴포넌트
 * 
 * 다양한 페이지 타입에 대응하는 Schema.org 마크업을 제공합니다.
 * 화면에 렌더링되지 않으며, 오직 SEO 목적으로만 사용됩니다.
 */
export function WebsiteStructuredData({
    type = 'WebPage',
    title = '테크톡 - 개발자 면접과 프로그래밍 학습 플랫폼',
    description = '개발자 면접 준비와 프로그래밍 학습을 위한 AI 기반 플랫폼. 코딩테스트, 기술면접, 알고리즘 문제해결을 위한 맞춤형 교육을 제공합니다.',
    url,
    imageUrl,
    isLoading = false,
    additionalData = {}
}: WebsiteStructuredDataProps) {
    if (isLoading) {
        // 로딩 상태에서는 기본 SEO 데이터 제공
        const defaultData = {
            "@context": "https://schema.org",
            "@type": type,
            "name": title,
            "description": description,
            "url": url || "https://techtalk.ai",
            "image": imageUrl || "https://techtalk.ai/logo.png",
            "keywords": [
                // 개발자 면접 관련 키워드
                "개발자 면접", "기술면접", "코딩 면접", "개발자 취업", "개발자 이직", "소프트웨어 개발자 면접",
                "백엔드 개발자 면접", "프론트엔드 개발자 면접", "풀스택 개발자 면접", "개발자 면접 질문",
                "기술 면접 준비", "개발자 면접 준비", "IT 면접", "개발자 채용", "개발자 면접 팁",

                // 프로그래밍 학습 관련 키워드  
                "프로그래밍 학습", "코딩 학습", "개발자 교육", "프로그래밍 강의", "개발자 스킬업",
                "소프트웨어 개발 학습", "코딩 교육", "프로그래밍 트레이닝", "개발자 성장", "코딩 부트캠프",
                "온라인 개발자 교육", "프로그래밍 과정", "개발자 커리어", "IT 교육", "개발자 역량",

                // 코딩테스트 관련 키워드
                "코딩테스트", "코테", "알고리즘", "자료구조", "코딩 테스트 준비", "알고리즘 문제",
                "백준", "프로그래머스", "리트코드", "LeetCode", "코딩테스트 문제", "알고리즘 풀이",
                "코테 준비", "코딩테스트 스터디", "알고리즘 스터디", "문제 해결", "코테 공부",

                // 프로그래밍 언어 관련 키워드
                "Java", "JavaScript", "Python", "React", "Spring", "Node.js", "TypeScript",
                "Spring Boot", "Vue.js", "C++", "Go", "Kotlin", "Swift", "PHP", "Ruby",
                "HTML", "CSS", "SQL", "MongoDB", "MySQL", "PostgreSQL", "Redis", "Docker",

                // 개발 분야별 키워드
                "백엔드 개발", "프론트엔드 개발", "풀스택 개발", "웹 개발", "모바일 앱 개발",
                "안드로이드 개발", "iOS 개발", "게임 개발", "데이터 사이언스", "머신러닝",
                "인공지능", "AI", "빅데이터", "클라우드", "AWS", "DevOps", "마이크로서비스",

                // 취업/커리어 관련 키워드
                "개발자 취업", "신입 개발자", "경력 개발자", "개발자 이직", "IT 취업", "테크 기업",
                "스타트업", "대기업", "포트폴리오", "이력서", "개발자 연봉", "개발자 커리어패스",
                "개발자 직무", "소프트웨어 엔지니어", "시니어 개발자", "주니어 개발자",

                // 기술 트렌드 키워드  
                "클라우드 컴퓨팅", "마이크로서비스", "컨테이너", "쿠버네티스", "CI/CD", "API",
                "REST API", "GraphQL", "웹소켓", "SSR", "SPA", "PWA", "모바일 퍼스트",
                "반응형 웹", "크로스 플랫폼", "하이브리드 앱", "네이티브 앱",

                // 개발 방법론 키워드
                "애자일", "스크럼", "TDD", "DDD", "클린 코드", "리팩토링", "디자인 패턴",
                "객체지향 프로그래밍", "함수형 프로그래밍", "MVC", "MVP", "MVVM", "아키텍처",

                // 학습 플랫폼 관련 키워드
                "온라인 강의", "프로그래밍 강의", "개발자 강의", "코딩 강의", "IT 강의",
                "인프런", "유데미", "노마드코더", "패스트캠퍼스", "코드스쿼드", "부트캠프",
                "국비지원 부트캠프", "코딩 교육", "개발자 교육과정",

                // 기업/취업 관련 키워드
                "네이버", "카카오", "라인", "쿠팡", "배달의민족", "토스", "당근마켓", "우아한형제들",
                "삼성", "LG", "SK", "현대", "Google", "Microsoft", "Amazon", "Facebook", "Apple",

                // 기술 블로그/학습 관련 키워드
                "기술 블로그", "개발 블로그", "IT 블로그", "프로그래밍 블로그", "개발자 블로그",
                "기술 아티클", "개발 지식", "프로그래밍 팁", "개발 노하우", "코딩 팁",

                // 문제 해결 관련 키워드
                "디버깅", "트러블슈팅", "코드 리뷰", "성능 최적화", "버그 수정", "에러 해결",
                "문제 해결 능력", "논리적 사고", "알고리즘적 사고", "창의적 문제해결"
            ].join(", "),
            "about": [
                {
                    "@type": "Thing",
                    "name": "개발자 면접 준비",
                    "description": "기술 면접, 코딩 테스트, 알고리즘 문제 해결, 시스템 설계 면접을 위한 종합적인 준비 과정"
                },
                {
                    "@type": "Thing",
                    "name": "프로그래밍 학습",
                    "description": "Java, JavaScript, Python, React, Spring Boot 등 최신 기술 스택을 활용한 실무 중심 개발 교육"
                },
                {
                    "@type": "Thing",
                    "name": "코딩테스트 대비",
                    "description": "백준, 프로그래머스, LeetCode 문제 풀이를 통한 알고리즘과 자료구조 마스터"
                },
                {
                    "@type": "Thing",
                    "name": "개발자 커리어 성장",
                    "description": "신입부터 시니어까지 단계별 성장을 위한 맞춤형 학습 로드맵과 멘토링"
                },
                {
                    "@type": "Thing",
                    "name": "AI 기반 학습",
                    "description": "개인화된 학습 경험과 실시간 피드백을 제공하는 인공지능 학습 시스템"
                }
            ],
            "mainEntity": {
                "@type": "WebSite",
                "url": url || "https://techtalk.ai",
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": `${url || "https://techtalk.ai"}/search?q={search_term_string}`,
                    "query-input": "required name=search_term_string"
                }
            },
            "publisher": {
                "@type": "Organization",
                "name": "테크톡",
                "url": "https://techtalk.ai",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://techtalk.ai/logo.png"
                },
                "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "Customer Service",
                    "email": "support@techtalk.ai"
                },
                "sameAs": [
                    "https://apps.apple.com/kr/app/id6478161786",
                    "https://play.google.com/store/apps/details?id=com.techtalk.ai"
                ]
            },
            ...additionalData
        };

        return (
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(defaultData, null, 2)
                }}
            />
        );
    }

    // 정상 상태에서는 더 간단한 구조화 데이터 제공
    const structuredData = {
        "@context": "https://schema.org",
        "@type": type,
        "name": title,
        "description": description,
        "url": url,
        "image": imageUrl,
        ...additionalData
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData, null, 2)
            }}
        />
    );
} 