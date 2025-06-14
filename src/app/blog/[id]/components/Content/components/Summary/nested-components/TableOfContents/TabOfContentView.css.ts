import { style, globalStyle } from "@vanilla-extract/css";
import { textStyles } from "@/styles/textStyles";

// 부드러운 스크롤을 위한 글로벌 스타일
globalStyle('html', {
    scrollBehavior: 'smooth',
});

export const container = style({
    marginBottom: 24,
});

export const title = style({
    ...textStyles.title1,
    marginBottom: 16,
    fontWeight: 600,
});

export const orderedList = style({
    margin: 0,
    paddingLeft: 20,
});

export const listItem = style({
    ...textStyles.body2,
    marginBottom: 8,
    lineHeight: 1.5,
    color: '#666',
});

export const linkAnchor = style({
    ...textStyles.body2,
    color: '#666',
    textDecoration: 'none',
    lineHeight: 1.5,
    display: 'block',
    transition: 'all 0.2s ease',
    ':hover': {
        color: '#2937C7',
        transform: 'translateX(4px)',
    },
    ':focus': {
        outline: '2px solid #2937C7',
        outlineOffset: '2px',
        borderRadius: '2px',
    },
    ':active': {
        color: '#1e2a8a',
        transform: 'translateX(2px)',
    },
});

export const loadingState = style({
    ...textStyles.body2,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '20px 0',
});

export const errorState = style({
    ...textStyles.body2,
    color: '#e74c3c',
    textAlign: 'center',
    padding: '20px 0',
    backgroundColor: '#fdf2f2',
    borderRadius: '4px',
    border: '1px solid #fecaca',
});