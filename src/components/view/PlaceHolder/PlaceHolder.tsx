import { HTMLAttributes } from "react";
import * as styles from "./style.css";

/**  
 * Flutter의 'PlaceHolder'과 유사한 컴포넌트
 * 
 * 남은 영역을 'X'모양의 컴포넌트가 반환됨
*/

interface PlaceHolderProps extends HTMLAttributes<HTMLDivElement> {
    width?: string | number;
    height?: string | number;
    color?: string;
}

export function PlaceHolder({
    width = '100%',
    height = '100%',
    color = '#000000',
    style: customStyle,
    ...props
}: PlaceHolderProps) {
    return (
        <div
            className={styles.container}
            style={{
                width,
                height,
                backgroundColor: '#f0f0f0',
                ...customStyle
            }}
            {...props}
        >
            <div className={styles.xMarkStyle} />
        </div>
    );
}       