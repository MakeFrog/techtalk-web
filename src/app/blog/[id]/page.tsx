import Content from "./components/Content/Content";
import OriginBlog from "./components/OriginBlog/OriginBlog";
import NotFound from "./components/NotFound/NotFound";
import { BlogDataProvider } from "@/domains/blog/providers/BlogDataProvider";
import { BlogBasicInfoProvider } from "@/domains/blog/providers/BlogBasicInfoProvider";
import { AnalyzedInfoProvider } from "@/domains/blog/providers/AnalyzedInfoProvider";
import { checkDocumentExists } from "@/domains/blog/services/blogDataService";
import { WebsiteStructuredData } from "@/components/SEO/WebsiteStructuredData";
import { container, contentSection, originBlogSection } from "./page.css";

interface BlogDetailPageProps {
    params: Promise<{ id: string }>;
}

/**
 * 블로그 상세 페이지 서버 컴포넌트
 * ID 기반 라우팅으로 Firestore 문서를 조회하고, 
 * 문서가 없으면 세련된 404 UI를 표시
 */
export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
    const { id: documentId } = await params;

    console.log(`🔗 [서버] 블로그 페이지 접근: ${documentId}`);

    // 문서 존재 여부 체크
    const documentExists = await checkDocumentExists(documentId);

    // 문서가 없으면 404 UI와 기본 SEO 데이터 표시
    if (!documentExists) {
        console.log(`❌ [서버] 문서 없음: ${documentId}`);
        return (
            <>
                <WebsiteStructuredData
                    type="WebPage"
                    title="테크톡 - 페이지를 찾을 수 없습니다"
                    description="요청하신 페이지를 찾을 수 없습니다. 테크톡에서 다른 개발자 학습 콘텐츠를 확인해보세요."
                    url={`https://techtalk.ai/blog/${documentId}`}
                />
                <NotFound documentId={documentId} />
            </>
        );
    }

    console.log(`✅ [서버] 문서 존재: ${documentId}`);

    // 문서가 있으면 Provider들과 함께 정상 렌더링
    return (
        <>
            {/* 서버 컴포넌트에서 SEO 데이터 렌더링 - 검색엔진에 즉시 노출 */}
            <WebsiteStructuredData
                type="WebPage"
                title="테크톡 - 개발자 면접과 프로그래밍 학습 플랫폼"
                description="개발자 면접 준비와 프로그래밍 학습을 위한 AI 기반 플랫폼. 코딩테스트, 기술면접, 알고리즘 문제해결을 위한 맞춤형 교육을 제공합니다."
                url={`https://techtalk.ai/blog/${documentId}`}
                imageUrl="https://techtalk.ai/logo.png"
                isLoading={false} // 서버에서는 항상 로딩이 완료된 상태
            />

            <BlogDataProvider documentId={documentId} documentExists={true}>
                <BlogBasicInfoProvider documentId={documentId}>
                    <AnalyzedInfoProvider>
                        <div className={container}>
                            <div className={contentSection}>
                                <Content />
                            </div>

                            <div className={originBlogSection}>
                                <OriginBlog />
                            </div>
                        </div>
                    </AnalyzedInfoProvider>
                </BlogBasicInfoProvider>
            </BlogDataProvider>
        </>
    );
}   