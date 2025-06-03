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