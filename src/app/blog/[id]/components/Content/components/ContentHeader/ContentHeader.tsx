import React from 'react';
import { Gap } from "@/components/gap/Gap";
import { title } from "./ContentHeader.css";
import { RoundedOutlinedChip } from "@/components/chip/RoundedOutlined/RoundedOutlinedChip";
import { TechSetList } from './nested-component/TechSetList';
import { ThumbnailImage } from '@/components/Image/Thumbnail/ThumbnailImage';

const dummyTags = [
    'Flutter',
    'Swift',
    'Java',
    '프론트엔드 개발자',
    'React',
    'Kotlin',
    'iOS',
    'Android',
    'TypeScript',
    '백엔드 개발자',
];

export default function ContentHeader() {
    return (
        <div>
            <h1 className={title}>[AI Summary]Flutter Project Structure: Feature-first or Layer-first?</h1>
            <Gap size={12} />
            <TechSetList tags={dummyTags.slice(0, 10)} />
            <Gap size={20} />
            <ThumbnailImage
                src="https://velog.velcdn.com/images/ximya_hf/post/bc534064-ab10-4768-a01d-e98648fb94ac/image.png"
                alt="Thumbnail"
                aspectRatio={672 / 369}
            />
        </div>
    )
}


