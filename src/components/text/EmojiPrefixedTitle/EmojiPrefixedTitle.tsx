import React from 'react';
import * as styles from './EmojiPrefixedTitle.css';

interface EmojiPrefixedTitleProps {
    emoji: string;
    title: string;
}

export function EmojiPrefixedTitle({ emoji, title }: EmojiPrefixedTitleProps) {
    return (
        <div className={styles.container}>
            <span className={styles.emoji}>{emoji}</span>
            <span className={styles.title}>{title}</span>
        </div>
    );
}       