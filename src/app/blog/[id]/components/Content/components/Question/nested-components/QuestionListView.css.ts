import { style } from '@vanilla-extract/css';
import { textStyles } from '@/styles/TextStyles';

export const orderedList = style({
    margin: 0,
    paddingLeft: 20,

});

export const listItem = style({
    ...textStyles.body1,
    marginBottom: 8,
    lineHeight: 1.6,
});

