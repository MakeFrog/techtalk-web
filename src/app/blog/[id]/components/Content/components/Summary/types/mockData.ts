// API 응답 타입 정의
export interface ProgrammingConcept {
    keyword: string;
    description: string;
}

export interface InterviewQA {
    question: string;
    answer: string;
}

export interface BlogAnalysisData {
    insights: string[];
    interview_qa: InterviewQA[];
    programming_concepts: ProgrammingConcept[];
    toc: string[];
    summary: string;
}

// 목 데이터
export const MOCK_BLOG_DATA: BlogAnalysisData = {
    insights: [
        "전역 Provider의 편리함 뒤에 숨겨진 위험, 즉 어디서든 접근 가능하다는 점 때문에 발생하는 사이드 이펙트를 Mixin Class로 구조화하여 Provider 사용 범위를 명확히 하고 추적을 용이하게 만들어 코드의 안정성을 높일 수 있다는 것을 알게 될 거예요.",
        "깊은 위젯 구조에서도 Argument 인자를 효과적으로 전달하고 관리하는 방법을 배우고, WidgetRef에 직접 접근하기 어려운 상황에서 Provider에 접근하는 노하우를 익혀 Riverpod 사용의 유연성을 확보할 수 있어요.",
        "Async Provider에서 값을 참조할 때 흔히 발생하는 StateError나 null 오류를 방지하고, ConsumerWidget을 유틸리티 클래스 형태로 모듈화하여 각 페이지에서 더 쉽고 편리하게 사용하는 방법을 통해 개발 효율성을 극대화할 수 있어요."
    ],
    interview_qa: [
        {
            question: "Riverpod에서 Provider를 전역 상태로 관리할 때 발생할 수 있는 잠재적인 문제점과, 이를 해결하기 위해 Mixin Class를 사용하는 이유를 설명해주세요.",
            answer: "전역 Provider는 어디서든 접근 가능하여 side effect를 유발할 수 있습니다. Mixin Class를 사용하면 Provider 사용 범위를 명확히 구분하고 추적하기 쉬워집니다."
        },
        {
            question: "Mixin Class를 사용하여 상태와 이벤트를 분리했을 때 얻을 수 있는 이점은 무엇인가요?",
            answer: "코드 가독성이 높아지고, 복잡도가 줄어들며, 코드 재사용성이 향상됩니다."
        },
        {
            question: "만약 여러 페이지에서 동일한 이벤트를 공유하고 재사용해야 하는 경우, Mixin Class를 활용한 해결 방안을 설명해주세요.",
            answer: "해당 이벤트를 Mixin Class에 정의해두면 다른 페이지에서 Mixin Class를 인스턴스화하여 메서드를 호출함으로써 쉽게 재사용할 수 있습니다."
        }
    ],
    toc: [
        "1. 🤔 Riverpod 사용 시 전역 Provider의 위험성과 해결책",
        "2. 🧩 Mixin Class를 활용한 전역 Provider 구조화 방법",
        "3. 🌱 State Mixin Class와 Event Mixin Class 분리 및 역할 정의",
        "4. 🔄 Mixin Class를 활용한 코드 재사용 및 유지보수 효율 증대"
    ],

    programming_concepts: [
        {
            keyword: "Riverpod",
            description: "Flutter 앱의 상태 관리 라이브러리로, Provider 패턴을 개선하여 전역 상태를 효율적으로 관리하고 위젯 간 데이터 공유를 용이하게 합니다."
        },
        {
            keyword: "Provider",
            description: "Riverpod에서 상태를 제공하고 관리하는 핵심 구성 요소로, 앱 전체에서 접근 가능한 전역 상태를 생성하고 위젯에 데이터를 주입하는 역할을 합니다."
        },
        {
            keyword: "Mixin Class",
            description: "클래스에 기능을 추가하기 위해 사용되는 재사용 가능한 코드 블록으로, Riverpod Provider와 함께 사용하여 특정 화면의 상태 및 이벤트 로직을 구조화하고 코드 재사용성을 높입니다."
        },
        {
            keyword: "WidgetRef",
            description: "위젯에서 Provider에 접근하고 상호 작용하기 위해 사용되는 객체입니다. Provider의 상태를 읽거나 변경하고, 다른 Provider를 참조하는 데 사용됩니다."
        },
        {
            keyword: "전역 상태",
            description: "앱 전체에서 접근 가능하고 공유되는 상태를 의미하며, Riverpod의 Provider를 통해 효과적으로 관리할 수 있습니다. 하지만 과도한 사용은 사이드 이펙트를 유발할 수 있으므로 주의해야 합니다."
        }
    ],

    summary: `## 🤔 [Riverpod](concept:Riverpod) 사용 시 [전역 상태](concept:전역 상태)의 위험성과 해결책

- [Riverpod](concept:Riverpod)의 [Provider](concept:Provider)는 편리하지만, 어디서든 접근 가능하다는 점이 위험 요소를 야기할 수 있습니다.
- 특정 화면에서 어떤 [Provider](concept:Provider)가 사용되는지 파악하기 어려워 사이드 이펙트를 유발할 수 있습니다.
- 각 화면에서 사용되는 상태와 이벤트를 [Mixin Class](concept:Mixin Class)로 구조화하는 방안을 제시합니다.
- 이를 통해 [Provider](concept:Provider) 사용 범위를 명확히 구분하고 쉽게 추적할 수 있도록 돕습니다.

## 🧩 [Mixin Class](concept:Mixin Class)를 활용한 [전역 Provider](concept:Provider) 구조화 방법

- 특정 화면에서 [Provider](concept:Provider)의 상태를 참조하는 로직은 State [Mixin Class](concept:Mixin Class)에 넣습니다.
- 상태를 변경하거나 참조하여 특정 이벤트를 실행하는 로직은 Event [Mixin Class](concept:Mixin Class)로 구조화합니다.
- 예를 들어, \`HomeState\` [Mixin Class](concept:Mixin Class)는 \`filteredTodosProvider\`를 참조하고, \`HomeEvent\` [Mixin Class](concept:Mixin Class)는 \`addTodo\` 이벤트를 처리합니다.

\`\`\`ts
mixin class HomeState {
  List filteredTodos([WidgetRef](concept:WidgetRef) ref) => ref.watch(filteredTodosProvider);
}

mixin class HomeEvent {
  void addTodo([WidgetRef](concept:WidgetRef) ref, {required TextEditingController textEditingController, required String value}) {
    ref.read(todoListProvider.notifier).add(value);
    textEditingController.clear();
  }
}
\`\`\`

- 이 구조는 특정 페이지에서 어떤 상태를 전달받고 어떤 이벤트가 발생하는지 쉽게 파악할 수 있게 해줍니다.
- 코드 가독성을 높이고 복잡도를 줄여 작업자와 동료 모두에게 안정감을 줍니다.

## 🌱 State [Mixin Class](concept:Mixin Class)와 Event [Mixin Class](concept:Mixin Class) 분리 및 역할 정의

- State [Mixin Class](concept:Mixin Class)는 UI의 상태를 나타내고 관리하는 역할을 합니다.
- Event [Mixin Class](concept:Mixin Class)는 UI에서 발생하는 이벤트(사용자 입력, 네트워크 응답 등)를 처리하는 역할을 합니다.
- 상태와 이벤트를 분리함으로써 코드의 책임이 명확해지고 유지보수가 용이해집니다.
- 각 [Mixin Class](concept:Mixin Class)는 해당 화면에서 필요한 [Provider](concept:Provider)에만 접근하도록 제한하여 사이드 이펙트를 줄일 수 있습니다.

## 🔄 [Mixin Class](concept:Mixin Class)를 활용한 코드 재사용 및 유지보수 효율 증대

- HomePage에서 특정 버튼 클릭 로직이 UI 안에 직접 정의되어 있다면 ProductDetail에서 재사용하기 어려울 수 있습니다.
- [Mixin Class](concept:Mixin Class)를 사용하면 여러 페이지에서 동일한 이벤트를 공유하고 재사용할 수 있습니다.
- 예를 들어, \`HomeEvent\` [Mixin Class](concept:Mixin Class)에 정의된 이벤트 처리 로직을 \`ProductDetail\` 페이지에서 재사용할 수 있습니다.

\`\`\`ts
mixin class ProductDetailEvent {
  void onBtnTapped() {
    final homeEvent = HomeEvent();
    homeEvent.onBtnTapped();
  }
}
\`\`\`

- 이처럼 [Mixin Class](concept:Mixin Class)를 활용하면 코드 중복을 줄이고 유지보수성을 향상시킬 수 있습니다.

> **💡 팁** : [Mixin Class](concept:Mixin Class)는 클래스에 기능을 추가하는 방법 중 하나이며, 다중 상속을 흉내내는 데 사용될 수 있습니다.`
}; 