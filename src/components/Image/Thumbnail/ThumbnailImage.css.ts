import { style } from '@vanilla-extract/css';

export const wrapper = style({
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
    background: '#F6F6F9',
});

export const placeholder = style({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    background: '#F6F6F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    filter: 'blur(8px)',
    transition: 'opacity 0.3s',
    zIndex: 1,
});

export const image = style({
    objectFit: 'cover',
    width: '100%',
    height: '100%',
    opacity: 1,
    transition: 'opacity 0.3s',
    borderRadius: 16,
}); 