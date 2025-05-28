import ContentHeader from "./components/ContentHeader/ContentHeader.tsx";
import { container } from "./Content.css.ts";

export default function Content() {
    return (
        <section className={container}>
            <ContentHeader />
        </section>
    );
}   