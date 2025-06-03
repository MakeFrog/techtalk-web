import { style } from '@vanilla-extract/css';
import { SizeConfig } from '@/styles/sizeConfig';

export const container = style({
    margin: '0 auto',
    marginTop: '24px',
    marginBottom: '42px',
    width: '100%',
    maxWidth: '672px',
    boxSizing: 'border-box',
    paddingLeft: '16px',
    paddingRight: '16px',
    overflowX: 'hidden',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    // '@media': {
    //     [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
    //         paddingLeft: '6.67vw',
    //         paddingRight: '6.67vw',
    //     },
    // },
});

// 로딩 상태 컨테이너 스타일 (응집도 향상)
export const loadingContainer = style({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    color: '#64748b',
    fontSize: '14px'
});

// 에러 상태 컨테이너 스타일
export const errorContainer = style({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    color: '#ef4444',
    fontSize: '14px',
    gap: '8px'
});

// 에러 메시지 상세 텍스트 스타일
export const errorDetailText = style({
    fontSize: '12px',
    opacity: 0.7
});