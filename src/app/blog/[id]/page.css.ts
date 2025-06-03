import { style } from '@vanilla-extract/css';
import { SizeConfig } from '@/styles/sizeConfig';

export const container = style({
    display: 'flex',
    width: '100vw',
    height: '100vh',
    minHeight: '100vh',
});

export const contentSection = style({
    width: '61%',
    height: '100vh',
    overflowY: 'auto',
    scrollBehavior: 'smooth',

    // 모바일에서는 전체 너비 사용
    '@media': {
        [`screen and (max-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            width: '100%',
        }
    }
});

export const originBlogSection = style({
    width: '39%',
    height: '100vh',
    overflowY: 'auto',

    // 모바일에서는 숨김
    '@media': {
        [`screen and (max-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            display: 'none',
        }
    }
});