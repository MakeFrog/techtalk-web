import React from 'react';

interface GapProps {
    size: number | string;
    direction?: 'horizontal' | 'vertical';
    className?: string;
}

/**
 * <Gap size={8} /> // 기본 vertical
 * <Gap size={16} direction="horizontal" />
 */
export function Gap({ size, direction = 'vertical', className }: GapProps) {
    const style =
        direction === 'vertical'
            ? { display: 'block', height: typeof size === 'number' ? `${size}px` : size, width: '100%' }
            : { display: 'inline-block', width: typeof size === 'number' ? `${size}px` : size, height: '1px' };

    return <span className={className} style={style} aria-hidden />;
}
