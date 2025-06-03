import Image from 'next/image';
import { container, titleSection, title, subtitle, illustrationSection, ctaSection, ctaText, buttonRow, storeButton, storeButtonContent, storeLogoWrapper, storeButtonText, storeButtonSmallText, storeButtonLargeText } from './MainLanding.css.ts';

/**
 * 메인 랜딩 공통 컴포넌트
 * 메인 페이지와 블로그 메인 페이지에서 공통으로 사용
 */
export function MainLanding() {
    return (
        <div className={container}>
            {/* 제목 섹션 */}
            <div className={titleSection}>
                <h1 className={title}>테크톡</h1>
                <p className={subtitle}>개발자 학습 커리어 플랫폼</p>
            </div>

            {/* 일러스트 섹션 */}
            <div className={illustrationSection}>
                <Image
                    src="/illustration.svg"
                    alt="테크톡 일러스트"
                    width={328}
                    height={218}
                    priority
                />
            </div>

            {/* CTA 섹션 */}
            <div className={ctaSection}>
                <p className={ctaText}>
                    개발자 기술 면접은<br />
                    <strong>테크톡과 함께!</strong>
                </p>

                {/* 앱 스토어 버튼 행 */}
                <div className={buttonRow}>
                    <a
                        href="https://apps.apple.com/kr/app/id6478161786"
                        className={storeButton}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <div className={storeButtonContent}>
                            <div className={storeLogoWrapper}>
                                <Image
                                    src="/appstore_logo.svg"
                                    alt="App Store"
                                    width={20}
                                    height={24}
                                />
                            </div>
                            <div className={storeButtonText}>
                                <span className={storeButtonSmallText}>다운로드</span>
                                <span className={storeButtonLargeText}>App Store</span>
                            </div>
                        </div>
                    </a>

                    <a
                        href="https://play.google.com/store/apps/details?id=com.techtalk.ai"
                        className={storeButton}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <div className={storeButtonContent}>
                            <div className={storeLogoWrapper}>
                                <Image
                                    src="/playstore_logo.svg"
                                    alt="Google Play"
                                    width={20}
                                    height={24}
                                />
                            </div>
                            <div className={storeButtonText}>
                                <span className={storeButtonSmallText}>다운로드</span>
                                <span className={storeButtonLargeText}>Google Play</span>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
} 