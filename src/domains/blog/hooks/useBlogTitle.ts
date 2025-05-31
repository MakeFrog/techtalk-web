'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

// 일관된 반환 타입 정의 (Discriminated Union)
type BlogTitleResult =
    | { status: 'loading'; data: null; error: null }
    | { status: 'success'; data: string; error: null }
    | { status: 'error'; data: null; error: string };

// 블로그 컬렉션 및 문서 상수 정의
const BLOGS_COLLECTION = 'Blogs';
const TARGET_DOCUMENT_ID = 'd2_naver_com_helloworld_5871868';

/**
 * 특정 블로그 문서의 title을 가져오는 훅
 * @returns BlogTitleResult - 로딩, 성공, 에러 상태와 데이터를 포함한 객체
 */
export function useBlogTitle(): BlogTitleResult {
    const [result, setResult] = useState<BlogTitleResult>({
        status: 'loading',
        data: null,
        error: null,
    });

    useEffect(() => {
        async function fetchBlogTitle() {
            try {
                setResult({ status: 'loading', data: null, error: null });

                const docRef = doc(firestore, BLOGS_COLLECTION, TARGET_DOCUMENT_ID);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const blogData = docSnap.data();
                    const title = blogData.title;

                    if (typeof title === 'string') {
                        setResult({ status: 'success', data: title, error: null });
                    } else {
                        setResult({
                            status: 'error',
                            data: null,
                            error: 'Title field is not a string'
                        });
                    }
                } else {
                    setResult({
                        status: 'error',
                        data: null,
                        error: 'Document does not exist'
                    });
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                setResult({ status: 'error', data: null, error: errorMessage });
            }
        }

        fetchBlogTitle();
    }, []);

    return result;
} 