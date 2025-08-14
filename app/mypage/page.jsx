"use client";

import { useState } from "react";
import styles from "./MyPage.module.css";
import Header from "../../components/Header/Header";

const categories = ["전공필수", "교필", "드볼", "SW", "특교", "MSC"];

export default function MyPage() {
  const [selectedCategory, setSelectedCategory] = useState("전공필수");

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.title}>수강 현황 분석</div>
      <div className={styles.info}>
        <div className={styles.name}>김컴공님</div>
        <div className={styles.major}>주전공:</div>
        <div className={styles.submajor}>부전공:</div>
      </div>
      <div className={styles.semester}>
        <div className={styles.photo}>2025학년도 1-1학기</div>
      </div>
      <div className={styles.total}>총 이수학점 분석</div>

      <div className={styles.notbox}>
        <div className={styles.boxtitle}>미수강 과목</div>
        {/* 카테고리 버튼 bar */}
        <div className={styles.bar}>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`${styles.barButton} ${
                selectedCategory === category ? styles.active : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <div className={styles.subbar}>
          <div className={styles.number}>
            학수번호
          </div>
          <div className={styles.sem}>
            학기
          </div>
          <div className={styles.na}>
            과목명
          </div>
          <div className={styles.grade}>
            학점
          </div>
    
        </div>
        <div className={styles.frame}>
          kj
        </div>
        <div className={styles.check}>
          수강 과목 확인하기
        </div>
        

        {/* 나중에 여기에 selectedCategory에 따른 과목 리스트 보여주는 UI 넣으면 됩니다 */}
      </div>


      
    </div>
  );
}
