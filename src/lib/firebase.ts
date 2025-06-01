import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// 환경별 Firebase 프로젝트 ID 설정
const getFirebaseProjectId = (): string => {
    const env = process.env.NODE_ENV;
    const firebaseEnv = process.env.NEXT_PUBLIC_FIREBASE_ENV || 'prod';

    console.log(`🔥 [Firebase] 환경: ${env}, Firebase 환경: ${firebaseEnv}`);

    // 환경에 따른 프로젝트 ID 선택
    switch (firebaseEnv) {
        case 'dev':
        case 'development':
            return 'techtalk-dev-33';
        case 'prod':
        case 'production':
        default:
            return 'techtalk-prod-32';
    }
};

// Firebase 설정 객체
const firebaseConfig = {
    projectId: getFirebaseProjectId(),
};

console.log(`🚀 [Firebase] 연결된 프로젝트: ${firebaseConfig.projectId}`);

// Firebase 앱 초기화
const firebaseApp = initializeApp(firebaseConfig);

// Firestore 인스턴스 생성
export const firestore = getFirestore(firebaseApp);

export default firebaseApp; 