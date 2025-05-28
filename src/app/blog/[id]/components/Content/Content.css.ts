import { style } from '@vanilla-extract/css';
import { MOBILE_WIDTH, PC_WIDTH } from '@/styles/SizeConfig';

export const container = style({
    backgroundColor: '#95C8D8',
    margin: '0 auto',
    width: '100%',
    maxWidth: `${PC_WIDTH}px`,
    boxSizing: 'border-box',
    paddingLeft: '16px',
    paddingRight: '16px',
    '@media': {
        [`screen and (min-width: ${MOBILE_WIDTH}px)`]: {
            paddingLeft: '6.67vw',
            paddingRight: '6.67vw',
        },
    },
});                         