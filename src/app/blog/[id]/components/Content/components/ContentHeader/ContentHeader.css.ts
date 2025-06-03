import { style } from '@vanilla-extract/css';
import { SizeConfig } from '@/styles/sizeConfig';
import { textStyles } from '@/styles/textStyles';

export const container = style({
    width: '100%',
    marginBottom: '24px',
    paddingTop: '8px',
});

export const headerSection = style({
    display: 'flex',
    flexDirection: 'column',
});

export const titleContainer = style({
    marginBottom: '0px',
});

export const title = style({
    // 모바일 기본 스타일 (headline1)
    ...textStyles.headline1,
    margin: 0,

    // 웹 화면에서는 headline1Web 사용
    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            ...textStyles.headline1Web,
        },
    },
});

export const loadingContainer = style({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100px',
    color: '#6b7280',
});

export const errorContainer = style({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100px',
    color: '#ef4444',
    fontSize: '14px',
});     