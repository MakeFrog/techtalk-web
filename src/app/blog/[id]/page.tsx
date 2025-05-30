import Content from "./components/Content/Content";
import OriginBlog from "./components/OriginBlog/OriginBlog";
import { container, contentSection, originBlogSection } from "./page.css";

export default function BlogDetailPage({ params }: { params: { id: string, deatilId: string } }) {
    return (
        <div className={container}>
            <div className={contentSection}>
                <Content />
            </div>

            <div className={originBlogSection}>
                <OriginBlog />
            </div>
        </div>
    );
}   