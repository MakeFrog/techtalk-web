// Pretendard 폰트 기반 텍스트 스타일 토큰 정의 (Flutter AppTextStyle 참고)
export const FONT_FAMILY = 'Pretendard, sans-serif';

export const textStyles = {
    highlight: {
        fontFamily: FONT_FAMILY,
        fontWeight: 700,
        fontSize: '32px',
        lineHeight: '36px',
        letterSpacing: '-0.64px', // -2/100 * 32
    },
    headline1: {
        fontFamily: FONT_FAMILY,
        fontWeight: 700,
        fontSize: '24px',
        lineHeight: '33px',
        letterSpacing: '-0.48px',
    },
    headline2: {
        fontFamily: FONT_FAMILY,
        fontWeight: 700,
        fontSize: '20px',
        lineHeight: '27px',
        letterSpacing: '-0.4px',
    },
    headline3: {
        fontFamily: FONT_FAMILY,
        fontWeight: 600,
        fontSize: '18px',
        lineHeight: '24px',
        letterSpacing: '-0.36px',
    },
    // Web headline styles
    headline1Web: {
        fontFamily: FONT_FAMILY,
        fontWeight: 700,
        fontSize: '36px',
        lineHeight: '44px', // 36 * 1.22 ≈ 44
        letterSpacing: '-0.72px', // -2/100 * 36
    },
    headline2Web: {
        fontFamily: FONT_FAMILY,
        fontWeight: 700,
        fontSize: '28px',
        lineHeight: '36px', // 28 * 1.29 ≈ 36
        letterSpacing: '-0.56px', // -2/100 * 28
    },
    headline3Web: {
        fontFamily: FONT_FAMILY,
        fontWeight: 600,
        fontSize: '22px',
        lineHeight: '28px', // 22 * 1.27 ≈ 28
        letterSpacing: '-0.44px', // -2/100 * 22
    },
    title1: {
        fontFamily: FONT_FAMILY,
        fontWeight: 700,
        fontSize: '16px',
        lineHeight: '22px',
        letterSpacing: '-0.32px',
    },
    title2: {
        fontFamily: FONT_FAMILY,
        fontWeight: 600,
        fontSize: '16px',
        lineHeight: '22px',
        letterSpacing: '-0.32px',
    },
    title3: {
        fontFamily: FONT_FAMILY,
        fontWeight: 700,
        fontSize: '14px',
        lineHeight: '20px',
        letterSpacing: '-0.28px',
    },
    body1: {
        fontFamily: FONT_FAMILY,
        fontWeight: 600,
        fontSize: '14px',
        lineHeight: '20px',
        letterSpacing: '-0.28px',
    },
    newBody: {
        fontFamily: FONT_FAMILY,
        fontWeight: 600,
        fontSize: '15px',
        lineHeight: '22px',
        letterSpacing: '-0.3px',
    },
    body2: {
        fontFamily: FONT_FAMILY,
        fontWeight: 500,
        fontSize: '14px',
        lineHeight: '20px',
        letterSpacing: '-0.28px',
    },
    body3: {
        fontFamily: FONT_FAMILY,
        fontWeight: 500,
        fontSize: '13px',
        lineHeight: '18px',
        letterSpacing: '-0.26px',
    },
    alert1: {
        fontFamily: FONT_FAMILY,
        fontWeight: 600,
        fontSize: '12px',
        lineHeight: '17px',
        letterSpacing: '-0.24px',
    },
    alert2: {
        fontFamily: FONT_FAMILY,
        fontWeight: 400,
        fontSize: '12px',
        lineHeight: '17px',
        letterSpacing: '-0.24px',
    },
}; 