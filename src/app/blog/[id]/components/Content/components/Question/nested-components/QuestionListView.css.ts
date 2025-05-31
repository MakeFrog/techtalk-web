import { style, globalStyle, keyframes } from '@vanilla-extract/css';
import { textStyles } from '@/styles/TextStyles';

// 스핀 애니메이션 (레거시 지원용)
const spin = keyframes({
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
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
    gap: '8px', // 아이템 간 간격 더 줄임
});

// 개별 질문 아이템 스타일 (컴팩트하고 현대적인 디자인)
export const listItem = style({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px', // 번호와 질문 사이 간격
    padding: '14px 16px', // 패딩 줄임
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    marginBottom: '0',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',

    // 호버 효과 개선
    ':hover': {
        backgroundColor: '#f8fafc',
        borderColor: '#c7d2fe',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
});

// 질문 번호 스타일 (하이라이트된 일반 번호)
export const questionNumber = style({
    ...textStyles.body1,
    color: '#6366f1',
    fontWeight: '700',
    fontSize: '14px',
    minWidth: 'auto',
    flexShrink: 0,
    marginTop: '1px', // 텍스트와 정렬 맞춤
    marginRight: '2px', // 점과의 간격
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

// 질문 컨테이너 내 마크다운 요소 간격 조정
globalStyle(`${questionContent} > div`, {
    margin: '0',
    display: 'inline',
});

globalStyle(`${questionContent} br`, {
    display: 'none', // 불필요한 줄바꿈 제거
}); 