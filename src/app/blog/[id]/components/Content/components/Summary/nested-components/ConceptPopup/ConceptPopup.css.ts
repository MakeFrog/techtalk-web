import { style } from '@vanilla-extract/css';
import { ColorSet } from '@/styles/ColorSet';

export const popupOverlay = style({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    cursor: 'default',
    opacity: 0,
    transition: 'opacity 0.2s ease-in-out',
});

export const popupOverlayVisible = style({
    opacity: 1,
});

export const popup = style({
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E0E0E0',
    borderRadius: 12,
    padding: '16px 20px',
    maxWidth: 320,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    zIndex: 1001,
    fontSize: 14,
    lineHeight: 1.5,
    color: '#333333',
    opacity: 0,
    transition: 'opacity 0.2s ease-in-out',
});

export const popupVisible = style({
    opacity: 1,
});

export const keywordText = style({
    fontWeight: 600,
    color: ColorSet.brand3,
    marginBottom: 8,
    fontSize: 15,
});

export const descriptionText = style({
    color: '#555555',
    fontSize: 14,
    lineHeight: 1.5,
});

export const conceptKeyword = style({
    display: 'inline',
    color: '#2563EB',
    textDecoration: 'underline',
    cursor: 'pointer',
    ':hover': {
        textDecoration: 'none',
        backgroundColor: '#EBF4FF',
        borderRadius: 2,
        padding: '1px 2px',
    }
}); 