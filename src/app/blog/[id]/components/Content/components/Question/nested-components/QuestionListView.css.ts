import { style, globalStyle, keyframes } from '@vanilla-extract/css';
import { textStyles } from '@/styles/textStyles';

// 스핀 애니메이션 (레거시 지원용)
const spin = keyframes({
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
});

// 답변 영역 확장 애니메이션
const expandAnimation = keyframes({
    '0%': {
        opacity: '0',
        maxHeight: '0',
        transform: 'translateY(-10px)',
    },
    '100%': {
        opacity: '1',
        maxHeight: '1000px',
        transform: 'translateY(0)',
    }
});

// 레거시 스피너 클래스 (하위 호환성)
export const spinner = style({
    display: 'inline-block',
    width: '20px',
    height: '20px',
    border: '2px solid #e5e7eb',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    marginBottom: '12px',
    animation: `${spin} 1s linear infinite`,
});

// 상태별 컨테이너 스타일들
export const loadingContainer = style({
    padding: '40px',
    textAlign: 'center',
    color: '#6b7280',
});

export const errorContainer = style({
    padding: '20px',
    textAlign: 'center',
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    borderRadius: '8px',
    border: '1px solid #fecaca',
});

export const emptyContainer = style({
    padding: '40px',
    textAlign: 'center',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
});

// 순서 있는 리스트 스타일
export const orderedList = style({
    listStyle: 'none',
    padding: '0',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
});

// 개별 질문 아이템 스타일 (클릭 가능하도록 개선)
export const listItem = style({
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    marginBottom: '0',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',

    // 호버 효과
    ':hover': {
        borderColor: '#c7d2fe',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
});

// 질문 헤더 (클릭 가능한 영역)
export const questionHeader = style({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px 18px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',

    ':hover': {
        backgroundColor: '#f8fafc',
    },

    ':active': {
        backgroundColor: '#f1f5f9',
    },
});

// 질문 번호 스타일
export const questionNumber = style({
    ...textStyles.body1,
    color: '#6366f1',
    fontWeight: '700',
    fontSize: '14px',
    minWidth: 'auto',
    flexShrink: 0,
    marginTop: '2px',
    marginRight: '2px',
    lineHeight: '1.65',
    selectors: {
        '&::after': {
            content: '"."',
            marginLeft: '1px',
        }
    }
});

// 질문 내용 컨테이너
export const questionContent = style({
    ...textStyles.newBody,
    flex: '1',
    color: '#374151',
    letterSpacing: '-0.01em',
    lineHeight: '1.65',
    marginTop: '0',
});

// 토글 아이콘 컨테이너
export const toggleIcon = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    backgroundColor: '#f1f5f9',
    color: '#6366f1',
    fontSize: '14px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    flexShrink: 0,
    marginTop: '1px',
});

// 토글 아이콘 (확장된 상태)
export const toggleIconExpanded = style({
    transform: 'rotate(180deg)',
    backgroundColor: '#e0e7ff',
});

// 답변 영역 컨테이너
export const answerContainer = style({
    maxHeight: '0',
    opacity: '0',
    overflow: 'hidden',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
});

// 답변 영역 (확장됨)
export const answerExpanded = style({
    maxHeight: '1000px',
    opacity: '1',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
});

// 답변 내용
export const answerContent = style({
    padding: '12px 16px 12px 24px', // 상:12px 우:12px 하:18px 좌:24px
    borderTop: '1px solid #f1f5f9',
    backgroundColor: '#fafbff',
    transform: 'translateY(-10px)',
    transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1) 0.01s',
});

// 답변 내용 (확장된 상태)
export const answerContentExpanded = style({
    transform: 'translateY(0)',
});

// 답변 레이블
export const answerLabel = style({
    ...textStyles.body1,
    color: '#6366f1',
    fontWeight: '600',
    fontSize: '13px',
    marginBottom: '8px',
    display: 'block',
});

// 답변 텍스트
export const answerText = style({
    ...textStyles.newBody,
    color: '#4b5563',
    lineHeight: '1.7',
    letterSpacing: '-0.01em',
});

// 레거시 호환성을 위한 별칭
export const questionText = questionContent;

// 마크다운 요소들의 글로벌 스타일
globalStyle('.question-inline-code', {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace',
    fontWeight: '500',
});

globalStyle('.question-bold', {
    fontWeight: '600',
    color: '#1f2937',
});

globalStyle('.question-italic', {
    fontStyle: 'italic',
    color: '#64748b',
});

globalStyle('.question-text-span', {
    color: 'inherit',
});

// 답변 영역의 마크다운 스타일
globalStyle('.answer-inline-code', {
    backgroundColor: '#e0e7ff',
    color: '#4338ca',
    padding: '3px 8px',
    borderRadius: '5px',
    fontSize: '13px',
    fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace',
    fontWeight: '500',
});

globalStyle('.answer-bold', {
    fontWeight: '600',
    color: '#374151',
});

globalStyle('.answer-italic', {
    fontStyle: 'italic',
    color: '#6b7280',
});

globalStyle('.answer-text-span', {
    color: 'inherit',
});

// 질문 컨테이너 내 마크다운 요소 간격 조정
globalStyle(`${questionContent} > div`, {
    margin: '0',
    display: 'inline',
});

globalStyle(`${questionContent} br`, {
    display: 'none',
});

// 답변 영역 내 마크다운 요소 간격 조정
globalStyle(`${answerText} > div`, {
    margin: '4px 0',
});

globalStyle(`${answerText} p`, {
    margin: '0 0 8px 0',
});

globalStyle(`${answerText} br`, {
    display: 'block',
    marginBottom: '4px',
}); 