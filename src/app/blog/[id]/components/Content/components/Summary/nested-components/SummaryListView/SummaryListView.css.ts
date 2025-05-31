import { style } from "@vanilla-extract/css";
import { textStyles } from "@/styles/TextStyles";
import { ColorSet } from "@/styles/ColorSet";

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
    marginBottom: 16,
    borderRadius: 8,
    // SyntaxHighlighter가 내부적으로 스타일링을 담당하므로 컨테이너 역할만
});

export const blockquote = style({
    borderLeft: '4px solid #007bff',
    paddingLeft: 16,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 16,
    backgroundColor: '#f8f9ff',
    padding: '12px 16px',
    borderRadius: '0 4px 4px 0',
    fontStyle: 'italic',
    color: '#495057',
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