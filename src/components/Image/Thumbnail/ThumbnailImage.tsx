"use client";
import Image from 'next/image';
import React, { useState } from 'react';
import * as styles from './ThumbnailImage.css';

export interface ThumbnailImageProps {
    src: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
    maxWidth?: string | number;
    maxHeight?: string | number;
    aspectRatio?: string;
    className?: string;
    style?: React.CSSProperties;
    borderRadius?: number;
    priority?: boolean;
}

function parseAspectRatio(ratio?: number | string): number | undefined {
    if (!ratio) return undefined;
    if (typeof ratio === 'number') return ratio;
    if (typeof ratio === 'string' && ratio.includes('/')) {
        const [w, h] = ratio.split('/').map(Number);
        if (!isNaN(w) && !isNaN(h) && h !== 0) return w / h;
    }
    const asNum = Number(ratio);
    return isNaN(asNum) ? undefined : asNum;
}

/**
 * Next.js에서 허용된 도메인인지 확인
 * 현재는 velog.velcdn.com만 허용됨
 */
function isAllowedDomain(src: string): boolean {
    try {
        const url = new URL(src);
        const allowedDomains = ['velog.velcdn.com'];
        return allowedDomains.includes(url.hostname);
    } catch {
        return false;
    }
}

export function ThumbnailImage({
    src,
    alt = '',
    width = '100%',
    aspectRatio,
    maxWidth,
    maxHeight,
    className,
    style,
    borderRadius = 16,
    priority = false,
}: ThumbnailImageProps) {
    const [loaded, setLoaded] = useState(false);
    const isAllowed = isAllowedDomain(src);

    const ratio = parseAspectRatio(aspectRatio);
    let imgWidth: number | undefined = undefined;
    let imgHeight: number | undefined = undefined;
    if (typeof maxWidth === 'number' && ratio) {
        imgWidth = maxWidth;
        imgHeight = Math.round(maxWidth / ratio);
    } else if (typeof maxHeight === 'number' && ratio) {
        imgHeight = maxHeight;
        imgWidth = Math.round(maxHeight * ratio);
    } else if (typeof width === 'number' && ratio) {
        imgWidth = width;
        imgHeight = Math.round(width / ratio);
    }

    const wrapperStyle: React.CSSProperties = {
        width,
        borderRadius,
        ...style,
        ...(ratio && { aspectRatio: ratio }),
        ...(maxWidth && { maxWidth }),
        ...(maxHeight && { maxHeight }),
        position: 'relative',
    };

    return (
        <div
            className={[styles.wrapper, className].filter(Boolean).join(' ')}
            style={wrapperStyle}
        >
            {/* Placeholder with fade-out transition */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#E2E2E2',
                    borderRadius,
                    zIndex: 1,
                    opacity: loaded ? 0 : 1,
                    pointerEvents: 'none',
                    transition: 'opacity 0.4s cubic-bezier(0.4,0,0.2,1)',
                }}
            />

            {/* 허용된 도메인이면 Next.js Image, 아니면 일반 img 태그 사용 */}
            {isAllowed ? (
                <Image
                    src={src}
                    alt={alt}
                    className={styles.image}
                    style={{
                        borderRadius,
                        transition: 'opacity 0.3s',
                        border: '0.5px solid #E0E0E0'
                    }}
                    width={imgWidth || 672}
                    height={imgHeight || 378}
                    loading="lazy"
                    sizes="100vw"
                    draggable={false}
                    onLoadingComplete={() => setLoaded(true)}
                    priority={priority}
                />
            ) : (
                <img
                    src={src}
                    alt={alt}
                    className={styles.image}
                    style={{
                        borderRadius,
                        transition: 'opacity 0.3s',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        border: '0.5px solid #E0E0E0'
                    }}
                    loading="lazy"
                    draggable={false}
                    onLoad={() => setLoaded(true)}
                />
            )}
        </div>
    );
}
