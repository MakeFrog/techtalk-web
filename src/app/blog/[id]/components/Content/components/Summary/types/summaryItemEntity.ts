export interface SummaryItemEntity {
    id: number;
    title: string; // 이모지 포함된 전체 제목
    content: string[];
}

/**
 * 제목에서 앵커 ID를 생성하는 유틸 함수
 * @param title 섹션 제목
 * @param id 섹션 번호
 * @returns 앵커 ID 문자열
 */
export const generateAnchorId = (title: string, id: number): string => {
    // 한글과 특수문자를 제거하고 영문만 남기거나, 숫자 기반 ID 생성
    return `section-${id}`;
};

/**
 * 공통 Summary 데이터
 * TableOfContents와 SummaryListView에서 공유
 */
export const SUMMARY_DATA: SummaryItemEntity[] = [
    {
        id: 1,
        title: '🔧 프로젝트 구조 선택: 기능 우선 vs 레이어 우선',
        content: [
            '큰 `Flutter`앱을 구축할 때, 프로젝트 구조를 결정하는 것이 중요하며, 이는 팀 전체가 명확한 규칙을 따르고 일관되게 기능을 추가할 수 있게 한다.',
            '기능우선(`feature-first`) 접근 방식과 레이어우선(`layer-first`) 접근 방식 두 가지를 탐구하고, 실제 앱에서의 일반적인 함정과 이들 각각의 장단점을 알아본다.',
            '앱 아키텍처를 결정한 후에야 프로젝트 구조를 선택할 수 있으며, 아키텍처는 명확한 경계를 가진 개별 레이어를 정의하게 된다.',
            '다음은 기본적인 Flutter 앱 구조의 예시입니다:',
            '```dart\nclass MyApp extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      title: \'Flutter Demo\',\n      theme: ThemeData(\n        primarySwatch: Colors.blue,\n      ),\n      home: const MyHomePage(title: \'Flutter Demo Home Page\'),\n    );\n  }\n}\n\nclass FeatureRepository {\n  final ApiService _apiService;\n  final DatabaseService _databaseService;\n  \n  FeatureRepository(this._apiService, this._databaseService);\n  \n  Future<List<FeatureModel>> getFeatures() async {\n    try {\n      final data = await _apiService.fetchFeatures();\n      return data.map((json) => FeatureModel.fromJson(json)).toList();\n    } catch (e) {\n      return _databaseService.getCachedFeatures();\n    }\n  }\n}```'
        ]
    },
    {
        id: 2,
        title: '📁 레이어-우선 접근법의 구조',
        content: [
            '레이어-우선(`layer-first`)접근법을 통해 프로젝트 구조를 설정하면, 두 개의 기능을 가진 앱의 경우 구조는 위와 같이 될 수 있다.',
            '이 접근법에서는 각 레이어안에 폴더를 생성하여 기능을 분리시킴으로써 `Dart 파일`을 직접 각 레이어에 넣지 않고 관리한다.',
            '모든 관련 `Dart 파일`은 각 기능별디어 추가되어 적절한 레이어에 속함을 보장한다. 예를 들어, 위젯과 컨트롤러는 `presentation` 레이어에 위치한다.',
            '새로운 기능(`feature3`)을 추가할 경우, 모든 레이어안에 `feature3` 폴더를 만들어야 하며, 이 과정은 필요할 때마다 반복된다.',
            '이 구조는 각 레이어별로 분명한 기능분리와 관리 용이성을 제공한다.',
            '레이어 구조의 예시:',
            '```dart\n// presentation/widgets/user_profile_widget.dart\nclass UserProfileWidget extends StatelessWidget {\n  final User user;\n  \n  const UserProfileWidget({Key? key, required this.user}) : super(key: key);\n  \n  @override\n  Widget build(BuildContext context) {\n    return Card(\n      child: Column(\n        children: [\n          CircleAvatar(\n            backgroundImage: NetworkImage(user.avatarUrl),\n          ),\n          Text(user.name),\n          Text(user.email),\n        ],\n      ),\n    );\n  }\n}```'
        ]
    },
    {
        id: 3,
        title: '🌟 레이어 우선 접근법의 단점',
        content: [
            '레이어 우선 접근법은 여러 단점을 가지고 있다.',
            '각 기능을 추가할 때마다 여러 레이어에 폴더를 생성해야 하는 번거로움이 있다.',
            '기능별 응집도가 떨어져 관련 파일들이 흩어져 있다.',
            'Clean Architecture의 창시자 Robert C. Martin은 이에 대해 다음과 같이 말했습니다:',
            '> 좋은 아키텍처는 결정을 연기하는 것이다. 프레임워크, 데이터베이스, 웹 서버, 기타 환경적 이슈와 도구에 대한 결정을 최대한 늦추는 것이다.',
            '> 이러한 결정들은 시스템의 핵심 비즈니스 로직에 영향을 주지 않아야 한다.',
            '또한 Martin Fowler는 마이크로서비스 아키텍처에 대해 다음과 같이 경고했습니다:',
            '> 마이크로서비스는 복잡성을 해결하지 않고 단지 다른 곳으로 옮길 뿐이다. 분산 시스템의 복잡성을 다룰 준비가 되어있지 않다면 모놀리스를 유지하라.',
            '이러한 관점에서 볼 때, 프로젝트 구조 선택 역시 신중해야 합니다.'
        ]
    },
    {
        id: 4,
        title: '📝 코딩 코드 및 프로젝트 구조의 중요성',
        content: [
            '좋은 프로젝트 구조는 개발 생산성과 유지보수성에 직접적인 영향을 미친다.',
            '팀 협업 시 일관된 구조는 개발자들이 빠르게 코드를 이해할 수 있게 돕는다.',
            '다음은 TypeScript로 작성된 모듈 구조의 예시입니다:',
            '```typescript\n// utils/apiClient.ts\ninterface ApiResponse<T> {\n  data: T;\n  status: number;\n  message: string;\n}\n\nclass ApiClient {\n  private baseUrl: string;\n  \n  constructor(baseUrl: string) {\n    this.baseUrl = baseUrl;\n  }\n  \n  async get<T>(endpoint: string): Promise<ApiResponse<T>> {\n    const response = await fetch(`${this.baseUrl}${endpoint}`);\n    return response.json();\n  }\n  \n  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {\n    const response = await fetch(`${this.baseUrl}${endpoint}`, {\n      method: \'POST\',\n      headers: {\n        \'Content-Type\': \'application/json\',\n      },\n      body: JSON.stringify(data),\n    });\n    return response.json();\n  }\n}\n\nexport default ApiClient;```',
            'Python으로 작성된 유사한 구조:',
            '```python\nfrom typing import TypeVar, Generic, Dict, Any\nfrom dataclasses import dataclass\nimport requests\n\nT = TypeVar(\'T\')\n\n@dataclass\nclass ApiResponse(Generic[T]):\n    data: T\n    status: int\n    message: str\n\nclass ApiClient:\n    def __init__(self, base_url: str):\n        self.base_url = base_url\n        self.session = requests.Session()\n    \n    def get(self, endpoint: str) -> Dict[str, Any]:\n        response = self.session.get(f"{self.base_url}{endpoint}")\n        response.raise_for_status()\n        return response.json()\n    \n    def post(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:\n        response = self.session.post(\n            f"{self.base_url}{endpoint}",\n            json=data,\n            headers={\'Content-Type\': \'application/json\'}\n        )\n        response.raise_for_status()\n        return response.json()```'
        ]
    },
    {
        id: 5,
        title: '🚀 프로젝트 구조: 기능 우선 접근 방식',
        content: [
            '기능 우선 접근 방식은 관련 파일들을 기능별로 묶어 관리한다.',
            '각 기능 폴더에는 해당 기능과 관련된 모든 레이어의 파일들이 포함된다.',
            '이는 높은 응집도와 낮은 결합도를 달성할 수 있는 방법이다.',
            'Domain-Driven Design의 아버지 Eric Evans는 다음과 같이 말했습니다:',
            '> 도메인 모델이 코드와 직접 연결되어야 한다. 모델과 구현 사이의 간격이 클수록 모델이 쓸모없어진다.',
            '실제로 많은 개발자들이 기능 우선 구조에 대해 긍정적으로 평가합니다:',
            '> 기능별로 파일이 모여있으니 관련된 코드를 찾기가 훨씬 쉬워졌어요. 새로운 팀원도 빠르게 코드를 이해할 수 있습니다.',
            '다음은 React.js의 기능 우선 구조 예시입니다:',
            '```javascript\n// features/user-profile/components/UserProfile.jsx\nimport React, { useState, useEffect } from \'react\';\nimport { getUserProfile, updateUserProfile } from \'../services/userService\';\nimport { ProfileForm } from \'./ProfileForm\';\nimport { LoadingSpinner } from \'@/shared/components/LoadingSpinner\';\n\nexport const UserProfile = ({ userId }) => {\n  const [user, setUser] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    const fetchUser = async () => {\n      try {\n        setLoading(true);\n        const userData = await getUserProfile(userId);\n        setUser(userData);\n      } catch (err) {\n        setError(err.message);\n      } finally {\n        setLoading(false);\n      }\n    };\n\n    if (userId) {\n      fetchUser();\n    }\n  }, [userId]);\n\n  const handleProfileUpdate = async (formData) => {\n    try {\n      const updatedUser = await updateUserProfile(userId, formData);\n      setUser(updatedUser);\n    } catch (err) {\n      setError(err.message);\n    }\n  };\n\n  if (loading) return <LoadingSpinner />;\n  if (error) return <div className="error">Error: {error}</div>;\n  if (!user) return <div>User not found</div>;\n\n  return (\n    <div className="user-profile">\n      <h1>{user.name}\'s Profile</h1>\n      <ProfileForm \n        user={user} \n        onSubmit={handleProfileUpdate} \n      />\n    </div>\n  );\n};```',
            '하지만 주의할 점도 있습니다:',
            '> 기능 우선 구조도 만능은 아닙니다. 기능들 간의 의존성이 복잡해지면 오히려 관리가 어려워질 수 있으니 주의하세요.'
        ]
    }
]; 