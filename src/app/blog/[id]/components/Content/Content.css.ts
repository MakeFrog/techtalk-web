import { style } from '@vanilla-extract/css';
import { SizeConfig } from '@/styles/SizeConfig';

export const container = style({
    margin: '0 auto',
    width: '100%',
    maxWidth: '672px',
    boxSizing: 'border-box',
    paddingLeft: '16px',
    paddingRight: '16px',
    // '@media': {
    //     [`screen and (min-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
    //         paddingLeft: '6.67vw',
    //         paddingRight: '6.67vw',
    //     },
    // },
});                             