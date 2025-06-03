import { style } from '@vanilla-extract/css';
import { textStyles } from '@/styles/textStyles';
import { SizeConfig } from '@/styles/sizeConfig';

// 메인 컨테이너
export const container = style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '40px 20px',
    backgroundColor: '#ffffff',
    textAlign: 'center',

    // 데스크톱에서 최대 너비 제한
    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            padding: '60px 40px',
            maxWidth: '800px',
            margin: '0 auto',
        },
    },
});

// 제목 섹션
export const titleSection = style({
    marginBottom: '40px',

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            marginBottom: '50px',
        },
    },
});

// 메인 제목
export const title = style({
    ...textStyles.headline1,
    color: '#3446EA',
    marginBottom: '12px',
    fontWeight: '700',

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            ...textStyles.headline1Web,
            marginBottom: '16px',
        },
    },
});

// 부제목
export const subtitle = style({
    ...textStyles.title1,
    color: '#666',
    fontWeight: '500',

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            ...textStyles.headline3,
            fontWeight: '500',
        },
    },
});

// 일러스트 섹션
export const illustrationSection = style({
    marginBottom: '40px',
    display: 'flex',
    justifyContent: 'center',

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            marginBottom: '50px',
        },

        // 모바일에서 이미지 크기 조정
        [`screen and (max-width: ${SizeConfig.MOBILE_WIDTH - 1}px)`]: {
            transform: 'scale(0.8)',
        },
    },
});

// CTA 섹션
export const ctaSection = style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '32px',

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            gap: '40px',
        },
    },
});

// CTA 텍스트
export const ctaText = style({
    ...textStyles.title1,
    color: '#374151',
    lineHeight: '1.6',
    margin: '0',

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            ...textStyles.headline3,
            lineHeight: '1.5',
        },
    },
});

// 버튼 행
export const buttonRow = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
    maxWidth: '260px',

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            flexDirection: 'row',
            gap: '14px',
            maxWidth: '360px',
        },
    },
});

// 스토어 버튼
export const storeButton = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
    backgroundColor: '#000000',
    color: '#ffffff',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    minHeight: '48px',
    flex: '1',
    border: '2px solid #000000',
    overflow: 'hidden',

    ':hover': {
        backgroundColor: '#333333',
        borderColor: '#333333',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    },

    ':active': {
        transform: 'translateY(0)',
        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
    },

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            minHeight: '52px',
            borderRadius: '10px',
        },
    },
});

// 스토어 버튼 내용 컨테이너
export const storeButtonContent = style({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    width: '100%',

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            gap: '12px',
            padding: '12px 20px',
        },
    },
});

// 스토어 로고 래퍼
export const storeLogoWrapper = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '24px',
    height: '24px',

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            width: '28px',
            height: '28px',
        },
    },
});

// 스토어 버튼 텍스트
export const storeButtonText = style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    lineHeight: '1.2',
    flex: '1',
});

// 스토어 버튼 작은 텍스트 (상단)
export const storeButtonSmallText = style({
    fontSize: '10px',
    color: '#cccccc',
    fontWeight: '400',
    marginBottom: '1px',

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            fontSize: '12px',
        },
    },
});

// 스토어 버튼 큰 텍스트 (하단)
export const storeButtonLargeText = style({
    fontSize: '16px',
    color: '#ffffff',
    fontWeight: '600',
    whiteSpace: 'nowrap',

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            fontSize: '17px',
            fontWeight: '700',
        },
    },
}); 