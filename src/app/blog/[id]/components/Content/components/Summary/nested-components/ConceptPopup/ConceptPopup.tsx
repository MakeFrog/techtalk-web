'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as styles from './ConceptPopup.css';

interface ConceptPopupProps {
    keyword: string;
    description: string;
    position: {
        x: number;
        y: number;
    };
    onClose: () => void;
}

export const ConceptPopup: React.FC<ConceptPopupProps> = ({
    keyword,
    description,
    position,
    onClose
}) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(true);

    // 마운트 시 애니메이션 시작
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 10); // 작은 지연으로 트랜지션 트리거

        return () => clearTimeout(timer);
    }, []);

    // ESC 키 핸들러
    useEffect(() => {
        // 브라우저 환경에서만 실행
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return;
        }

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
            if (typeof document !== 'undefined') {
                document.removeEventListener('keydown', handleEscape);
            }
        };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // 애니메이션 완료 후 컴포넌트 제거
        setTimeout(() => {
            setShouldRender(false);
            onClose();
        }, 200); // CSS 트랜지션 시간과 일치
    };

    // 팝업 위치 계산 (화면 경계 고려)
    const calculatePosition = () => {
        if (!popupRef.current) return { top: position.y, left: position.x };

        const popup = popupRef.current;
        const rect = popup.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top = position.y + 15; // 클릭 위치 아래에 표시 (화살표 제거로 여백 조정)
        let left = position.x - rect.width / 2; // 중앙 정렬

        // 오른쪽 경계 체크
        if (left + rect.width > viewportWidth - 20) {
            left = viewportWidth - rect.width - 20;
        }

        // 왼쪽 경계 체크
        if (left < 20) {
            left = 20;
        }

        // 아래쪽 경계 체크 - 공간이 부족하면 위쪽에 표시
        if (top + rect.height > viewportHeight - 20) {
            top = position.y - rect.height - 15;
        }

        return { top, left };
    };

    const { top, left } = calculatePosition();

    if (!shouldRender) return null;

    return (
        <div
            className={`${styles.popupOverlay} ${isVisible ? styles.popupOverlayVisible : ''}`}
            onClick={handleClose}
        >
            <div
                ref={popupRef}
                className={`${styles.popup} ${isVisible ? styles.popupVisible : ''}`}
                style={{ top, left }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 컨텐츠 */}
                <div className={styles.keywordText}>{keyword}</div>
                <div className={styles.descriptionText}>{description}</div>
            </div>
        </div>
    );
}; 