# TechTalk Web

TechTalk 웹 애플리케이션

## 🔥 Firebase 환경 설정

### 환경별 프로젝트
- **개발 환경**: `techtalk-dev-33`
- **프로덕션 환경**: `techtalk-prod-32`

### CLI 명령어

#### 개발 서버 실행
```bash
# 기본 (prod 환경)
npm run dev

# dev Firebase 프로젝트 사용
npm run dev:firebase-dev

# prod Firebase 프로젝트 사용
npm run dev:firebase-prod
```

#### 빌드
```bash
# dev 환경으로 빌드
npm run build:dev

# prod 환경으로 빌드
npm run build:prod
```

#### 서버 시작
```bash
# dev 환경으로 시작
npm run start:dev

# prod 환경으로 시작
npm run start:prod
```

### Firebase CLI 명령어

#### 프로젝트 사용
```bash
# dev 환경 사용
firebase use dev

# prod 환경 사용
firebase use prod

# 기본 환경 사용
firebase use default
```

#### 배포
```bash
# dev 환경에 배포
firebase use dev && firebase deploy

# prod 환경에 배포
firebase use prod && firebase deploy
```

### 환경변수 설정

`.env.local` 파일을 생성하여 로컬 개발 환경 설정:

```env
# Firebase 환경 설정
NEXT_PUBLIC_FIREBASE_ENV=dev
```

또는 명령어 실행 시 직접 설정:

```bash
NEXT_PUBLIC_FIREBASE_ENV=dev npm run dev
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
