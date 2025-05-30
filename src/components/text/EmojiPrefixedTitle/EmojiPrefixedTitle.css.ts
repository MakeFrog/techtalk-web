import { textStyles } from '@/styles/TextStyles';
import { style } from '@vanilla-extract/css';

export const container = style({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
});

export const emoji = style({
    ...textStyles.headline1,
});

export const title = style({
    ...textStyles.headline1,
});