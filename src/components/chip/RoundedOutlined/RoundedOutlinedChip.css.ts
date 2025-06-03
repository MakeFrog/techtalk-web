import { style } from '@vanilla-extract/css';
import { textStyles } from '@/styles/textStyles';

export const chip = style({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '4px 8px',
    border: '1px solid #ECECF2',
    borderRadius: '8px',
    background: '#FFF',
    color: '#45454C',
    ...textStyles.body3,
    boxSizing: 'border-box',
    cursor: 'default',
    userSelect: 'none',
});
