// CSS 스타일링을 위한 vanilla-extract 유틸리티 임포트
import { style } from '@vanilla-extract/css';

// 기본 스타일 정의
// Placeholder 컴포넌트의 기본적인 스타일을 설정
export const container = style({
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

// X 표시를 위한 스타일 정의
export const xMarkStyle = style({
    position: 'relative',
    width: '100%',
    height: '100%',
    // X 표시를 위한 가상 요소 생성
    '::before': {
        content: '""',
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'linear-gradient(to bottom right, transparent calc(50% - 2px), #000, transparent calc(50% + 2px))',
    },
    '::after': {
        content: '""',
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'linear-gradient(to bottom left, transparent calc(50% - 2px), #000, transparent calc(50% + 2px))',
    }
});