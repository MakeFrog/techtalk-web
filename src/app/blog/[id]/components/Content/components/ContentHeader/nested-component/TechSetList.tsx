import React from 'react';
import { RoundedOutlinedChip } from '@/components/chip/RoundedOutlined/RoundedOutlinedChip';

interface TechSetListProps {
    tags: string[];
}

export const TechSetList = React.memo(function TechSetList({ tags }: TechSetListProps) {
    return (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tags.map((tag, idx) => (
                <RoundedOutlinedChip key={tag + idx}>{tag}</RoundedOutlinedChip>
            ))}
        </div>
    );
});
