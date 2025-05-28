import React from 'react';
import * as styles from './RoundedOutlinedChip.css';

interface RoundedOutlinedChipProps {
    children: React.ReactNode;
    className?: string;
}

export function RoundedOutlinedChip({ children, className }: RoundedOutlinedChipProps) {
    return (
        <span className={[styles.chip, className].filter(Boolean).join(' ')}>
            {children}
        </span>
    );
}
