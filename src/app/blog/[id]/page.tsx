import Content from "./components/Content/Content";
import OriginBlog from "./components/OriginBlog/OriginBlog";
import NotFound from "./components/NotFound/NotFound";
import { BlogDataProvider } from "@/domains/blog/providers/BlogDataProvider";
import { BlogBasicInfoProvider } from "@/domains/blog/providers/BlogBasicInfoProvider";
import { AnalyzedInfoProvider } from "@/domains/blog/providers/AnalyzedInfoProvider";
import { checkDocumentExists } from "@/domains/blog/services/blogDataService";
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

    // 문서가 없으면 404 UI 표시
    if (!documentExists) {
        console.log(`❌ [서버] 문서 없음: ${documentId}`);
        return <NotFound documentId={documentId} />;
    }

    console.log(`✅ [서버] 문서 존재: ${documentId}`);

    // 문서가 있으면 Provider들과 함께 정상 렌더링
    return (
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
    );
}   