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
        title: '🤔 Riverpod 사용 시 전역 상태의 위험성과 해결책',
        content: [
            '[Riverpod](concept:Riverpod)의 [Provider](concept:Provider)는 편리하지만, 어디서든 접근 가능하다는 점이 위험 요소를 야기할 수 있습니다.',
            '특정 화면에서 어떤 [Provider](concept:Provider)가 사용되는지 파악하기 어려워 사이드 이펙트를 유발할 수 있습니다.',
            '각 화면에서 사용되는 상태와 이벤트를 [Mixin Class](concept:Mixin Class)로 구조화하는 방안을 제시합니다.',
            '이를 통해 [Provider](concept:Provider) 사용 범위를 명확히 구분하고 쉽게 추적할 수 있도록 돕습니다.'
        ]
    },
    {
        id: 2,
        title: '🧩 Mixin Class를 활용한 전역 Provider 구조화 방법',
        content: [
            '특정 화면에서 [Provider](concept:Provider)의 상태를 참조하는 로직은 State [Mixin Class](concept:Mixin Class)에 넣습니다.',
            '상태를 변경하거나 참조하여 특정 이벤트를 실행하는 로직은 Event [Mixin Class](concept:Mixin Class)로 구조화합니다.',
            '예를 들어, `HomeState` [Mixin Class](concept:Mixin Class)는 `filteredTodosProvider`를 참조하고, `HomeEvent` [Mixin Class](concept:Mixin Class)는 `addTodo` 이벤트를 처리합니다.',
            '```ts\nmixin class HomeState {\n  List filteredTodos([WidgetRef](concept:WidgetRef) ref) => ref.watch(filteredTodosProvider);\n}\n\nmixin class HomeEvent {\n  void addTodo([WidgetRef](concept:WidgetRef) ref, {required TextEditingController textEditingController, required String value}) {\n    ref.read(todoListProvider.notifier).add(value);\n    textEditingController.clear();\n  }\n}\n```',
            '이 구조는 특정 페이지에서 어떤 상태를 전달받고 어떤 이벤트가 발생하는지 쉽게 파악할 수 있게 해줍니다.',
            '코드 가독성을 높이고 복잡도를 줄여 작업자와 동료 모두에게 안정감을 줍니다.'
        ]
    },
    {
        id: 3,
        title: '🌱 State Mixin Class와 Event Mixin Class 분리 및 역할 정의',
        content: [
            'State [Mixin Class](concept:Mixin Class)는 UI의 상태를 나타내고 관리하는 역할을 합니다.',
            'Event [Mixin Class](concept:Mixin Class)는 UI에서 발생하는 이벤트(사용자 입력, 네트워크 응답 등)를 처리하는 역할을 합니다.',
            '상태와 이벤트를 분리함으로써 코드의 책임이 명확해지고 유지보수가 용이해집니다.',
            '각 [Mixin Class](concept:Mixin Class)는 해당 화면에서 필요한 [Provider](concept:Provider)에만 접근하도록 제한하여 사이드 이펙트를 줄일 수 있습니다.'
        ]
    },
    {
        id: 4,
        title: '🔄 Mixin Class를 활용한 코드 재사용 및 유지보수 효율 증대',
        content: [
            'HomePage에서 특정 버튼 클릭 로직이 UI 안에 직접 정의되어 있다면 ProductDetail에서 재사용하기 어려울 수 있습니다.',
            '[Mixin Class](concept:Mixin Class)를 사용하면 여러 페이지에서 동일한 이벤트를 공유하고 재사용할 수 있습니다.',
            '예를 들어, `HomeEvent` [Mixin Class](concept:Mixin Class)에 정의된 이벤트 처리 로직을 `ProductDetail` 페이지에서 재사용할 수 있습니다.',
            '```ts\nmixin class ProductDetailEvent {\n  void onBtnTapped() {\n    final homeEvent = HomeEvent();\n    homeEvent.onBtnTapped();\n  }\n}\n```',
            '이처럼 [Mixin Class](concept:Mixin Class)를 활용하면 코드 중복을 줄이고 유지보수성을 향상시킬 수 있습니다.',
            '> **💡 팁** : [Mixin Class](concept:Mixin Class)는 클래스에 기능을 추가하는 방법 중 하나이며, 다중 상속을 흉내내는 데 사용될 수 있습니다.'
        ]
    }
]; 