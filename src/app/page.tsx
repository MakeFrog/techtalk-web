import Image from "next/image";
import { container } from './styles.css';
import BlogPage from "./blog/page";


export default function Home() {
  // 예시용 id
  const detailId = '42';

  return (
    <main className={container}>
      <h1>App 페이지</h1>
    </main>
  );
}
