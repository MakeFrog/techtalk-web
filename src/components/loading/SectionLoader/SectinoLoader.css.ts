import { style } from '@vanilla-extract/css';

export const loadingContainer = style({

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