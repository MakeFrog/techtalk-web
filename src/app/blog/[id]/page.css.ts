import { style } from '@vanilla-extract/css';

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
});

export const originBlogSection = style({
    width: '39%',
    height: '100vh',
    overflowY: 'auto',
});