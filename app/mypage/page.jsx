"use client";

import { useState } from "react";
import styles from "./MyPage.module.css";
import Header from "../../components/Header/Header";

// 버튼 표시(짧은 이름), 내부 데이터 키, 표시 이름(풀네임)
const categoryList = [
  { buttonName: "전필", dataKey: "전공필수", displayName: "전공필수" },
  { buttonName: "교필", dataKey: "교양필수", displayName: "교양필수" },
  { buttonName: "드볼", dataKey: "드래곤볼", displayName: "드래곤볼" },
  { buttonName: "SW", dataKey: "SW", displayName: "SW" },
  { buttonName: "MSC", dataKey: "MSC", displayName: "MSC" },
  { buttonName: "특교", dataKey: "특성화교양", displayName: "특성화교양" },
];

const completionMessages = {
  전공필수: "필요 학점을 충족하였습니다!",
  교양필수: "필요 학점을 충족하였습니다!",
  특성화교양: "필요 학점을 충족하였습니다!",
  MSC: "필요 학점을 충족하였습니다!",
  드래곤볼: "필요 영역 개수(6)을 충족하였습니다!",
  SW: "모듈별 필요 학점을 충족하였습니다!",
};

// 미수강 과목 dummyData


// 수강 과목 dummyData


export default function MyPage() {
  const [selectedCategory, setSelectedCategory] = useState("전공필수");
  const [expandedSub, setExpandedSub] = useState(null);
  const [showTaken, setShowTaken] = useState(false);

  

  const toggleSubCategory = (subName) => {
    setExpandedSub((prev) => (prev === subName ? null : subName));
  };

  const toggleTakenCourses = () => {
    setShowTaken((prev) => !prev);
  };

  const isSubCategory = ["드래곤볼", "SW", "MSC"].includes(selectedCategory);
  const courses = dummyData[selectedCategory] || [];

  const selectedDisplayName =
    categoryList.find((cat) => cat.dataKey === selectedCategory)?.displayName ||
    "";

  // 미수강 과목 표시
  const frameContent = () => {
    // 모든 영역에서 미수강 과목이 없으면 completionMessages 표시
    if (courses.length === 0) {
      return (
        <div className={styles.emptyMessage}>
          {completionMessages[selectedCategory] || "필요 학점을 충족하였습니다!"}
        </div>
      );
    }

    if (!isSubCategory) {
      return courses.map((course, idx) => (
        <div key={idx} className={styles.courseRow}>
          <div className={styles.number}>{course.number}</div>
          <div className={styles.sem}>{course.sem}</div>
          <div className={styles.na}>{course.name}</div>
          <div className={styles.grade}>{course.grade}</div>
        </div>
      ));
    } else {
      const subs = courses || {};
      return (
        <div className={styles.subCategoryContainer}>
          {Object.keys(subs).map((subName, idx) => {
            const isExpanded = expandedSub === subName;
            return (
              <div
                key={idx}
                className={`${styles.subCategoryBox} ${
                  isExpanded ? styles.expanded : ""
                }`}
                onClick={() => toggleSubCategory(subName)}
              >
                <div className={styles.subCategoryHeader}>
                  <span>{subName}</span>
                  <img
                    src="/Vector1.svg"
                    alt="toggle"
                    width={14}
                    height={14}
                    className={isExpanded ? styles.rotated : ""}
                  />
                </div>
                {isExpanded && (
                  <div className={styles.subCourses}>
                    {subs[subName].map((course, cidx) => (
                      <div key={cidx} className={styles.subCourseName}>
                        - {course.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }
  };

  // 수강 과목 표시
  const renderTakenCourses = () => {
    const taken = dummyTakenData[selectedCategory] || [];

    if (selectedCategory === "특성화교양" || taken.length === 0) return null;

    if (["전공필수", "교양필수"].includes(selectedCategory)) {
      return (
        <>
          <div className={styles.subbar}></div>
          {taken.map((c, idx) => (
            <div key={idx} className={styles.courseRow}>
              <div className={styles.number}>{c.number}</div>
              <div className={styles.sem}>{c.sem}</div>
              <div className={styles.na}>{c.name}</div>
              <div className={styles.grade}>{c.grade}</div>
            </div>
          ))}
        </>
      );
    }

    const headerMap = {
      드래곤볼: "영역",
      SW: "모듈",
      MSC: "분야",
    };
    const header = headerMap[selectedCategory] || "";

    return (
      <>
        <div className={styles.subbar}>
          <div className={styles.number}>학수번호</div>
          <div className={styles.sem}>학기</div>
          <div className={styles.na}>{header}</div>
          <div className={styles.na}>과목명</div>
        </div>
        {taken.map((c, idx) => (
          <div key={idx} className={styles.courseRow}>
            <div className={styles.number}>{c.number}</div>
            <div className={styles.sem}>{c.sem}</div>
            <div className={styles.na}>{c.area || c.module || c.field}</div>
            <div className={styles.na}>{c.name}</div>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.colorbox}>
        <div className={styles.nam}>
          김컴공님
        </div>
        <div className={styles.stud_num}>
          C000000
        </div>
        <div className={styles.maj}>
          컴퓨터공학과
        </div>
      </div>

      <div className={styles.percent}>
        <div className={styles.req}>졸업요건 이수율</div>
      </div>

      <div className={styles.semester}>
        <div className={styles.status}>수강 현황</div>
      </div>

      <div className={styles.total}>
        <div className={styles.analyze}>총 이수학점 분석</div>
      </div>

      <div className={styles.notbox}>
        <div className={styles.notboxHeader}>
          <div className={styles.boxtitle}>미수강 과목</div>
          <div className={styles.bar}>
            {categoryList.map((cat) => (
              <button
                key={cat.dataKey}
                type="button"
                className={`${styles.barButton} ${
                  selectedCategory === cat.dataKey ? styles.active : ""
                }`}
                onClick={() => setSelectedCategory(cat.dataKey)}
              >
                {selectedCategory === cat.dataKey
                  ? cat.displayName
                  : cat.buttonName}
              </button>
            ))}
          </div>
        </div>

        {/* 미수강 과목 표시 */}
        {!isSubCategory && courses.length > 0 && (
          <div className={styles.subbar}>
            <div className={styles.number}>학수번호</div>
            <div className={styles.sem}>학기</div>
            <div className={styles.na}>{selectedDisplayName}</div>
            <div className={styles.grade}>학점</div>
          </div>
        )}

        {!isSubCategory && (
          <div
            className={styles.frame}
            style={{
              background:
                courses.length === 0
                  ? "rgba(3, 129, 254, 0.7)"
                  : "rgba(211, 47, 47, 0.25)",
              boxShadow:
                "-2px -2px 3px 0 rgba(110, 66, 66, 0.50) inset, 2px 2px 3px 0 rgba(255, 255, 255, 0.50) inset",
              marginTop: courses.length === 0 ? "10px" : "-30px",
            }}
          >
            {frameContent()}
          </div>
        )}

        {isSubCategory && (
          <div
            className={styles.frame}
            style={{
              background:
                courses.length === 0
                  ? "rgba(3, 129, 254, 0.7)"
                  : "rgba(211, 47, 47, 0.25)",
              boxShadow:
                "-2px -2px 3px 0 rgba(110, 66, 66, 0.50) inset, 2px 2px 3px 0 rgba(255, 255, 255, 0.50) inset",
              marginTop: courses.length === 0 ? "10px" : "-30px",
            }}
          >
            {frameContent()}
          </div>
        )}

        {/* 수강 과목 토글 */}
        <div className={styles.check} onClick={toggleTakenCourses}>
          <span>수강 과목 확인하기</span>
          <img
            src="/vector.svg"
            alt="check"
            className={`${styles.checkIcon} ${showTaken ? styles.rotated : ""}`}
          />
        </div>

        {showTaken && renderTakenCourses()}
      </div>
    </div>
  );
}
