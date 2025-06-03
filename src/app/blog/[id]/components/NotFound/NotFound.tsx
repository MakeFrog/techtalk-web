import Link from 'next/link';
import { container, iconContainer, title, description, backButton } from './NotFound.css';

interface NotFoundProps {
    documentId: string;
}

/**
 * 블로그 문서를 찾을 수 없을 때 표시되는 세련된 UI 컴포넌트
 */
export default function NotFound({ documentId }: NotFoundProps) {
    return (
        <div className={container}>
            <div className={iconContainer}>
                📄
            </div>

            <h1 className={title}>
                블로그를 찾을 수 없습니다
            </h1>

            <p className={description}>
                요청하신 블로그 문서 '{documentId}'를 찾을 수 없습니다.<br />
                문서가 삭제되었거나 URL이 잘못되었을 수 있습니다.
            </p>

            <Link href="/blog" className={backButton}>
                블로그 목록으로 돌아가기
            </Link>
        </div>
    );
} 