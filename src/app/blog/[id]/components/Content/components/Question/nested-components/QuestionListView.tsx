import React from "react";
import { orderedList, listItem } from "./QuestionListView.css";

const questions = [
    "React의 Virtual DOM이 무엇이며, 실제 DOM과 비교했을 때 어떤 장점이 있는지 설명해주세요.",
    "JavaScript의 이벤트 루프와 비동기 처리 방식에 대해 설명해주세요. Promise와 async/await의 차이점도 함께 설명해주세요.",
    "브라우저의 렌더링 과정을 설명하고, Critical Rendering Path를 최적화하는 방법에 대해 설명해주세요.",
    "웹 성능 최적화를 위한 다양한 기법들에 대해 설명해주세요. 코드 분할(Code Splitting), 레이지 로딩(Lazy Loading), 이미지 최적화 등을 포함해서 설명해주세요.",
    "RESTful API와 GraphQL의 차이점과 각각의 장단점에 대해 설명해주세요.",

];

const QuestionListViewComponent = () => {
    return (
        <ol className={orderedList}>
            {questions.map((q, idx) => (
                <li key={idx} className={listItem}>{q}</li>
            ))}
        </ol>
    );
};

export const QuestionListView = React.memo(QuestionListViewComponent);              