<h1 align="center">테크톡 Web</h1>
<p align="center"><img src="https://velog.velcdn.com/images/ximya_hf/post/947cd6f8-d525-4511-a5a5-a84053b1f3d2/image.png"/></p>
<p align="center">
<b>테크톡</b>은 개발자로 첫 취업이나 이직을 준비하는 유저들을 위한 <b>학습 플랫폼</b>입니다.<br/>
AI 모의 면접을 대표 기능으로 하며, 개발자들이 겪는 가장 큰 페인포인트인 <b>"무엇을 어떻게 학습해야 할지 몰라 생기는 막연함과 두려움"</b>을 해결하는 데 집중합니다.<br/><br/>
<b>학습의 진입 장벽을 낮추어</b> 시간이나 장소의 제약 없이 누구나 개발 콘텐츠에 접근하고 쉽게 학습할 수 있는 <b>데일리 학습 플랫폼</b>을 목표로 합니다.<br/>
단순한 면접 준비 서비스를 넘어서, 개발자의 지속적인 <b>'학습'</b> 자체에 신경쓰며 성장을 돕는 서비스입니다.
</p><br>


## 🌟 주요 기능

- **📚 블로그 분석**: AI를 통한 기술 블로그 내용 분석 및 요약
- **🔍 키워드 추출**: 핵심 기술 키워드 자동 추출
- **❓ 질문 생성**: 학습 효과를 높이는 AI 생성 질문
- **💡 인사이트 제공**: 기술 트렌드 및 학습 포인트 분석
- **📋 목차 생성**: 구조화된 콘텐츠 목차 자동 생성

## 시연영상

<table>
  <tr>
    <th align="center">블로그 요약 상세페이지</th>
  </tr>
  <tr>
    <td align="center"><img src="blob:https://velog.io/4b07a996-ba13-4687-bf35-49c956c5719f" width="600"/></td>
  </tr>
</table>
    
## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 15.3.2
- **Language**: TypeScript
- **Styling**: Vanilla Extract CSS
- **UI Components**: React 19

### Backend
- **Runtime**: Node.js 18.x
- **Database**: Firebase Firestore
- **Data Connect**: Firebase Data Connect
- **AI Integration**: Google Generative AI

### Infrastructure
- **Hosting**: Vercel (Production)
- **Database**: Firebase (Production: `techtalk-prod-32`)
- **CI/CD**: Vercel Auto-Deploy

## 📁 프로젝트 구조

```
techtalk_web/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   └── blog/            # 블로그 관련 API
│   │   │       ├── analyzed-info/  # 분석 정보 API
│   │   │       ├── insights/       # 인사이트 API
│   │   │       ├── keywords/       # 키워드 API
│   │   │       ├── questions/      # 질문 API
│   │   │       ├── summary/        # 요약 API
│   │   │       └── toc/           # 목차 API
│   │   ├── blog/                # 블로그 페이지
│   │   ├── layout.tsx           # 루트 레이아웃
│   │   └── page.tsx             # 홈페이지
│   ├── components/              # 재사용 가능한 컴포넌트
│   ├── domains/                 # 도메인별 비즈니스 로직
│   │   ├── blog/               # 블로그 도메인
│   │   └── techset/            # 기술셋 도메인
│   ├── hooks/                   # Custom React Hooks
│   ├── libs/                    # 라이브러리 설정
│   ├── services/                # 외부 서비스 연동
│   ├── store/                   # 상태 관리
│   ├── styles/                  # 스타일 파일
│   ├── types/                   # TypeScript 타입 정의
│   └── utils/                   # 유틸리티 함수
├── dataconnect/                 # Firebase Data Connect 설정
├── public/                      # 정적 파일
├── vercel.json                  # Vercel 배포 설정
├── firebase.json                # Firebase 설정
├── .firebaserc                  # Firebase 프로젝트 설정
└── package.json                 # 프로젝트 의존성
```


## 🎨 코드 스타일
- **가독성**: 매직 넘버 네이밍, 구현 세부사항 추상화
- **예측가능성**: 일관된 반환 타입, 숨겨진 로직 방지
- **응집성**: 기능별 코드 조직, 폼 응집성 고려
- **결합도**: 조기 추상화 방지, 상태 관리 범위 최소화

### 블로그 서머리 분석 페이지
- **경로**: `/blog/[id]`
- **현재 용도**: **테크톡 앱**의 블로그 AI 분석 상세 페이지에서 웹뷰로 사용
- **설명**: AI 기반 블로그 분석 결과를 표시하는 메인 페이지

#### ⚡ 동작 방식
블로그 페이지는 **하이브리드 렌더링** 방식으로 동작합니다:

**📊 분석 정보가 서버에 없는 경우:**
- **Gemini AI**로 실시간 프롬프트 전송
- **스트리밍 방식**으로 분석 결과를 실시간 출력
- 사용자에게 점진적으로 콘텐츠 표시

**💾 분석 정보가 서버에 저장된 경우:**
- **서버 컴포넌트** 형태로 즉시 데이터 렌더링
- Firebase Firestore에서 캐시된 분석 결과 조회
- 빠른 로딩과 SEO 최적화 제공

