'use client';

import { useBlogBasicInfo } from "@/domains/blog/providers/BlogBasicInfoProvider";
import { PlaceHolder } from "@/components/view/PlaceHolder/PlaceHolder"
import { originBlogView, noLinkMessage, noLinkText, originLinkContainer, originLinkTitle, originDescription, originLinkButton } from "./OriginBlog.css"
import { WebsiteStructuredData } from "@/components/SEO";

export default function OriginBlog() {
    const { state } = useBlogBasicInfo();

    // 로딩 중이거나 에러일 때
    if (state.status === 'loading') {
        return (
            <WebsiteStructuredData />
        );
    }

    if (state.status === 'error') {
        return (
            <section className={originBlogView}>
                <div className={noLinkMessage}>
                    <p className={noLinkText}>블로그를 불러올 수 없습니다.</p>
                </div>
            </section>
        );
    }

    const { linkUrl, title } = state.data;

    // 링크가 없을 때
    if (!linkUrl) {
        return (
            <section className={originBlogView}>
                <div className={noLinkMessage}>
                    <p className={noLinkText}>블로그 링크가 제공되지 않습니다.</p>
                </div>
            </section>
        );
    }

    return (
        <section className={originBlogView}>
            <div className={originLinkContainer}>
                <h2 className={originLinkTitle}>📖 블로그 보기</h2>
                <p className={originDescription}>
                    테크톡은 여러분의 학습을 위한 다양한 기능을 준비중에 있습니다.
                </p>

                <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={originLinkButton}
                >
                    🔗 블로그 보러가기
                </a>
            </div>
        </section>
    );
}           