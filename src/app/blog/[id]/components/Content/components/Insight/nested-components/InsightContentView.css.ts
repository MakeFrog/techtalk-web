import { textStyles } from '@/styles/TextStyles';
import { style, globalStyle } from '@vanilla-extract/css';
import { SizeConfig } from '@/styles/sizeConfig';

// 컨테이너 스타일 - 자연스러운 배경
export const contentContainer = style({
    ...textStyles.title1,
    fontWeight: 500,
    width: '100%',
    padding: '20px 24px',
    backgroundColor: '#fafafa',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    lineHeight: '1.7',
    // fontSize: '15px',
    color: '#374151',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflow: 'hidden',

    // 모바일/웹뷰에서 여백 줄이기
    '@media': {
        [`screen and (max-width: ${SizeConfig.MOBILE_WIDTH}px)`]: {
            padding: '12px 16px',
            borderRadius: '8px',
        }
    }
});

// 메인 텍스트 컨테이너
export const contentText = style({
    position: 'relative',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
});

// 인라인 코드 스타일
export const inlineCode = style({
    ...textStyles.body2,
    backgroundColor: '#f1f5f9',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    fontWeight: '500',
    color: '#374151',
});

// 일반 텍스트 스타일
export const textSpan = style({
    color: 'inherit',
});

// 코드 블록 스타일
export const codeBlock = style({
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    padding: '16px 20px',
    borderRadius: '8px',
    ...textStyles.body2,
    fontWeight: 700,
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    lineHeight: '1.5',
    margin: '12px 0',
    overflow: 'auto',
});

// 인용구 스타일
export const blockquote = style({
    borderLeft: '4px solid #6366f1',
    paddingLeft: '16px',
    margin: '16px 0',
    fontStyle: 'italic',
    color: '#64748b',
});

// 볼드 텍스트 스타일
export const bold = style({
    fontWeight: '600',
    color: '#1f2937',
});

// 이탤릭 텍스트 스타일
export const italic = style({
    fontStyle: 'italic',
    color: '#64748b',
});

// 에러 컨테이너
export const errorContainer = style({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: '#fef2f2',
    borderRadius: '8px',
    border: '1px solid #fecaca',
});

export const errorIcon = style({
    fontSize: '20px',
    flexShrink: 0,
});

export const errorText = style({
    color: '#dc2626',
    fontSize: '14px',
    lineHeight: '1.5',
    margin: '0',
});

// 빈 상태 컨테이너
export const emptyContainer = style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '40px 20px',
    textAlign: 'center',
});

export const emptyIcon = style({
    fontSize: '32px',
    opacity: 0.6,
});

export const emptyText = style({
    color: '#64748b',
    fontSize: '14px',
    margin: '0',
});

// 전역 스타일 - 부드러운 스크롤
globalStyle('html', {
    scrollBehavior: 'smooth',
});

// 마크다운 요소들의 간격 조정
globalStyle(`${contentText} p`, {
    margin: '0 0 12px 0',
});

globalStyle(`${contentText} p:last-child`, {
    marginBottom: '0',
});

// 새로운 프리셋 기반 마크다운 스타일들
globalStyle('.insight-inline-code', {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace',
    fontWeight: '500',
});

globalStyle('.insight-bold', {
    fontWeight: '600',
    color: '#1f2937',
});

globalStyle('.insight-italic', {
    fontStyle: 'italic',
    color: '#64748b',
});

globalStyle('.insight-text-span', {
    color: 'inherit',
});

globalStyle('.insight-code-block', {
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    padding: '16px 20px',
    borderRadius: '8px',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    lineHeight: '1.5',
    margin: '12px 0',
    overflow: 'auto',
});

globalStyle('.insight-blockquote', {
    borderLeft: '4px solid #6366f1',
    paddingLeft: '16px',
    margin: '16px 0',
    fontStyle: 'italic',
    color: '#64748b',
});

// 인사이트 컨테이너 내 마크다운 요소 간격 조정
globalStyle(`${contentText} > div`, {
    margin: '0',
    display: 'inline',
});

globalStyle(`${contentText} br`, {
    display: 'none', // 불필요한 줄바꿈 제거
}); 