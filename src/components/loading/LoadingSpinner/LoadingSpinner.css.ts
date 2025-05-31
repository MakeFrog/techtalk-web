import { style, keyframes } from '@vanilla-extract/css';

// 스핀 애니메이션
const spin = keyframes({
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
});

// 기본 스피너 스타일
export const spinner = style({
    display: 'inline-block',
    border: '2px solid #e5e7eb',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: `${spin} 1s linear infinite`,
});

// 작은 스피너 (16px)
export const small = style({
    width: '16px',
    height: '16px',
});

// 중간 스피너 (20px) - 기본값
export const medium = style({
    width: '20px',
    height: '20px',
});

// 큰 스피너 (24px)
export const large = style({
    width: '24px',
    height: '24px',
});

// 컨테이너 스타일들
export const centerContainer = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '12px',
});

export const inlineContainer = style({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
}); 