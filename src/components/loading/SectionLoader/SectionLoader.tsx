import { LoadingSpinner } from "../LoadingSpinner";
import { loadingContainer } from "./SectinoLoader.css";

// 로딩 폴백 컴포넌트
export default function SectionLoader() {
    return (
        <div className={loadingContainer}>
            <LoadingSpinner size="medium" layout="center" />
        </div>
    );
}
