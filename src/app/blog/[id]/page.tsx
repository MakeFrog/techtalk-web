import Content from "./components/Content/Content";
import OriginBlog from "./components/OriginBlog/OriginBlog";
import { container } from "./page.css";

export default function BlogDetailPage({ params }: { params: { id: string, deatilId: string } }) {
    return <div className={container}>
        <Content />
        <OriginBlog />
    </div>

}   