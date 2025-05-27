export default function BlogDetailPage({ params }: { params: { id: string } }) {
    return <div>
        <h1>블로그 상세 페이지</h1>
        <p>id: {params.id}</p>
    </div>
}