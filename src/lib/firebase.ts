import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase 설정 객체 - 최소 설정으로 테스트
const firebaseConfig = {
    projectId: 'techtalk-prod-32', // .firebaserc에서 확인된 프로젝트 ID
};

// Firebase 앱 초기화
const firebaseApp = initializeApp(firebaseConfig);

// Firestore 인스턴스 생성
export const firestore = getFirestore(firebaseApp);

export default firebaseApp; 