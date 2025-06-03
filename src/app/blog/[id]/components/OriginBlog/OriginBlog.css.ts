import { style } from '@vanilla-extract/css';
import { textStyles } from '@/styles/textStyles';
import { SizeConfig } from '@/styles/sizeConfig';

export const originBlogView = style({
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    minHeight: '100vh',
    overflow: 'hidden',
    borderLeft: '1px solid #e0e0e0',
});

// 헤더 섹션
export const headerSection = style({
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#ffffff',
    flexShrink: 0,

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            padding: '24px',
        },
    },
});

// 원문 제목
export const originTitle = style({
    ...textStyles.headline3,
    color: '#1a1a1a',
    margin: '0 0 8px 0',
    fontWeight: '700',

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            ...textStyles.headline2,
        },
    },
});

// 원문 URL
export const originUrl = style({
    ...textStyles.body2,
    color: '#666',
    margin: '0',
    wordBreak: 'break-all',
    fontSize: '14px',

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            fontSize: '15px',
        },
    },
});

// 웹뷰 컨테이너
export const webviewContainer = style({
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
});

// 웹뷰 iframe
export const webviewFrame = style({
    width: '100%',
    height: '100%',
    border: 'none',
    flex: '1',
    backgroundColor: '#ffffff',
});

// 링크 없을 때 메시지
export const noLinkMessage = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '300px',
});

// 링크 없을 때 메시지 텍스트
export const noLinkText = style({
    ...textStyles.body1,
    color: '#999',
    textAlign: 'center',
    margin: '0',
});

// 링크 미리보기 컨테이너
export const linkPreviewContainer = style({
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    gap: '24px',

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            padding: '60px 40px',
            gap: '32px',
        },
    },
});

// 링크 정보
export const linkInfo = style({
    textAlign: 'center',
    maxWidth: '500px',
});

// 링크 정보 제목
export const linkInfoTitle = style({
    ...textStyles.headline3,
    color: '#1a1a1a',
    margin: '0 0 16px 0',
    fontWeight: '700',

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            ...textStyles.headline2,
            margin: '0 0 20px 0',
        },
    },
});

// 링크 정보 텍스트
export const linkInfoText = style({
    ...textStyles.body1,
    color: '#666',
    margin: '0 0 8px 0',
    lineHeight: '1.6',
});

// 링크 정보 설명 텍스트
export const linkInfoDescription = style({
    ...textStyles.body1,
    color: '#999',
    fontSize: '14px',
    fontStyle: 'italic',
    margin: '12px 0 0 0',
    lineHeight: '1.6',
});

// 새 탭에서 열기 버튼
export const openLinkButton = style({
    backgroundColor: '#3446EA',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(52, 70, 234, 0.2)',

    ':hover': {
        backgroundColor: '#2a37c7',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 16px rgba(52, 70, 234, 0.3)',
    },

    ':active': {
        transform: 'translateY(0)',
        boxShadow: '0 2px 8px rgba(52, 70, 234, 0.2)',
    },

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            padding: '18px 36px',
            fontSize: '17px',
        },
    },
});

// 원문 링크 컨테이너
export const originLinkContainer = style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
    height: '100%',
    minHeight: '400px',
    gap: '24px',

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            padding: '80px 40px',
            gap: '32px',
        },
    },
});

// 원문 링크 제목
export const originLinkTitle = style({
    ...textStyles.headline2,
    color: '#1a1a1a',
    margin: '0',
    fontWeight: '700',

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            ...textStyles.headline1,
        },
    },
});

// 원문 설명 텍스트
export const originDescription = style({
    ...textStyles.body1,
    color: '#666',
    lineHeight: '1.6',
    margin: '0',
    maxWidth: '400px',

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            ...textStyles.title1,
            maxWidth: '500px',
        },
    },
});

// 원문 링크 버튼
export const originLinkButton = style({
    backgroundColor: '#3446EA',
    color: '#ffffff',
    textDecoration: 'none',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(52, 70, 234, 0.2)',
    display: 'inline-block',

    ':hover': {
        backgroundColor: '#2a37c7',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 16px rgba(52, 70, 234, 0.3)',
    },

    ':active': {
        transform: 'translateY(0)',
        boxShadow: '0 2px 8px rgba(52, 70, 234, 0.2)',
    },

    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            padding: '18px 36px',
            fontSize: '17px',
        },
    },
});     