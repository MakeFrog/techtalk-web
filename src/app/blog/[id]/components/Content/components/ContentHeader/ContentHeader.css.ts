import { style } from '@vanilla-extract/css';
import { SizeConfig } from '@/styles/sizeConfig';
import { textStyles } from '@/styles/textStyles';

export const title = style({
    // 모바일 기본 스타일 (headline1)
    ...textStyles.headline1,

    // 웹 화면에서는 headline1Web 사용
    '@media': {
        [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            ...textStyles.headline1Web,
        },
    },
});     