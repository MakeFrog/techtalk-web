import { style, keyframes, globalStyle } from "@vanilla-extract/css";
import { textStyles } from "@/styles/TextStyles";
import { ColorSet } from "@/styles/ColorSet";

// 스피너 애니메이션
const spin = keyframes({
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
});

export const container = style({
    marginBottom: 32,
});

export const sectionTitle = style({
    ...textStyles.headline3,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
});

export const sectionContent = style({
    marginBottom: 24,
});

export const bulletList = style({
    margin: 0,
    paddingLeft: 20,
    marginBottom: 24,
});

export const listItem = style({
    ...textStyles.body1,
    marginBottom: 16,
    lineHeight: 1.6,
    color: '#333',
});

export const listItemNoBullet = style({
    ...textStyles.body1,
    marginBottom: 16,
    lineHeight: 1.6,
    color: '#333',
    listStyle: 'none',
});

export const inlineCode = style({
    ...textStyles.body1,
    background: 'rgba(52, 70, 234, 0.08)',
    borderRadius: 4,
    padding: '0.2em 0.4em',
    color: '#2937C7',
    fontSize: '0.85em',
    fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace',
    fontWeight: 600,
    border: '1px solid rgba(52, 70, 234, 0.12)',
});

export const codeBlock = style({
    marginBottom: 4,
    borderRadius: 8,
    // SyntaxHighlighter가 내부적으로 스타일링을 담당하므로 컨테이너 역할만
});

export const blockquote = style({
    borderLeft: '4px solid #007bff',
    paddingLeft: 16,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#f8f9ff',
    padding: '16px 20px',
    borderRadius: '0 8px 8px 0',
    fontStyle: 'normal',
    color: '#495057',
    fontSize: '14px',
    lineHeight: '1.6',
    boxShadow: '0 2px 4px rgba(0, 123, 255, 0.1)',
});

// 인용문 내부의 강조 텍스트 스타일링
globalStyle(`${blockquote} strong`, {
    fontWeight: 700,
    color: '#2c5aa0',
});

export const bold = style({
    fontWeight: 700,
});

export const italic = style({
    fontStyle: 'italic',
});

export const textSpan = style({
    // 일반 텍스트용 스타일
});

export const conceptKeyword = style({
    display: 'inline',
    color: 'inherit',
    textDecoration: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationColor: ColorSet.gray3,
    textUnderlineOffset: '3px',
    textDecorationThickness: '1.5px',
    cursor: 'pointer',
    fontWeight: 500,
    ':hover': {
        textDecoration: 'none',
        backgroundColor: '#EBF4FF',
        borderRadius: 2,
        padding: '1px 2px',
    }
});

// 새로운 요약 시스템을 위한 스타일들
export const buttonContainer = style({
    display: 'flex',
    justifyContent: 'center',
    padding: '20px 0',
});

export const generateButton = style({
    ...textStyles.body2,
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'all 0.2s ease',
    ':hover': {
        backgroundColor: '#0056b3',
        transform: 'translateY(-1px)',
    },
    ':active': {
        transform: 'translateY(0)',
    }
});

export const loadingContainer = style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
    gap: 12,
    color: '#666',
    fontSize: 14,
});

export const loadingSpinner = style({
    width: 24,
    height: 24,
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #007bff',
    borderRadius: '50%',
    animation: `${spin} 1s linear infinite`,
});

export const summaryContent = style({
    marginTop: 16,
    lineHeight: 1.7,
});

export const errorContainer = style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: '20px',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    border: '1px solid #fecaca',
});

export const errorText = style({
    ...textStyles.body2,
    color: '#dc2626',
    textAlign: 'center',
});

export const retryButton = style({
    ...textStyles.body2,
    backgroundColor: 'transparent',
    color: '#dc2626',
    border: '1px solid #dc2626',
    borderRadius: 6,
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: 13,
    ':hover': {
        backgroundColor: '#dc2626',
        color: 'white',
    }
});

// Summary 마크다운 스타일 (글로벌)
globalStyle('.summary-inline-code', {
    backgroundColor: 'rgba(52, 70, 234, 0.08)',
    color: '#2937C7',
    padding: '0.2em 0.4em',
    borderRadius: '4px',
    fontSize: '0.85em',
    fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace',
    fontWeight: 600,
    border: '1px solid rgba(52, 70, 234, 0.12)',
});

globalStyle('.summary-code-block', {
    marginBottom: '16px',
    borderRadius: '8px',
});

globalStyle('.summary-blockquote', {
    borderLeft: '4px solid #007bff',
    paddingLeft: '16px',
    margin: '16px 0',
    backgroundColor: '#f8f9ff',
    padding: '12px 16px',
    borderRadius: '0 4px 4px 0',
    fontStyle: 'italic',
    color: '#495057',
});

globalStyle('.summary-bold', {
    fontWeight: '700',
    color: '#1f2937',
});

globalStyle('.summary-italic', {
    fontStyle: 'italic',
    color: '#64748b',
});

globalStyle('.summary-text-span', {
    color: 'inherit',
});

globalStyle('.summary-concept-keyword', {
    display: 'inline',
    color: 'inherit',
    textDecoration: 'underline',
    textDecorationStyle: 'dotted',
    textUnderlineOffset: '3px',
    textDecorationThickness: '1.5px',
    cursor: 'pointer',
    fontWeight: '500',
});

globalStyle('.summary-concept-keyword:hover', {
    textDecoration: 'none',
    backgroundColor: '#EBF4FF',
    borderRadius: '2px',
    padding: '1px 2px',
});   