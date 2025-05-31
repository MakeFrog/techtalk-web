import React from 'react';
import { spinner, small, medium, large, centerContainer, inlineContainer } from './LoadingSpinner.css';

export interface LoadingSpinnerProps {
    /** 스피너 크기 */
    size?: 'small' | 'medium' | 'large';
    /** 레이아웃 타입 */
    layout?: 'center' | 'inline';
    /** 로딩 메시지 */
    message?: string;
    /** 커스텀 클래스명 */
    className?: string;
}

/**
 * 재사용 가능한 로딩 스피너 컴포넌트
 * 다양한 크기와 레이아웃을 지원하며 메시지 표시 가능
 */
export function LoadingSpinner({
    size = 'medium',
    layout = 'center',
    message,
    className
}: LoadingSpinnerProps) {
    const sizeClass = {
        small,
        medium,
        large,
    }[size];

    const containerClass = layout === 'center' ? centerContainer : inlineContainer;

    const spinnerElement = (
        <div className={`${spinner} ${sizeClass} ${className || ''}`} />
    );

    if (layout === 'inline' && !message) {
        return spinnerElement;
    }

    return (
        <div className={containerClass}>
            {spinnerElement}
            {message && <div>{message}</div>}
        </div>
    );
} 