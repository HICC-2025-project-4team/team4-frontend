"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./NotTakenCourses.module.css";

type Category = { key: "majormust" | "generalmust" | "drbol"; label: string };

type ApiItem = {
  name: string;     // 과목명
  code: string;     // 학수번호
  semester: string; // "3-2" 같은 값
  credit?: number;  // 선택(없으면 "-")
};

type ApiResp = Record<string, ApiItem[]>;

const FILTERS: Category[] = [
  { key: "majormust", label: "전공필수" },
  { key: "generalmust", label: "교양필수" },
  { key: "drbol", label: "드래곤볼" },
];

export default function NotTakenCard() {
  const [active, setActive] = useState<Category["key"]>("majormust");
  const [data, setData] = useState<ApiResp>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const API_BASE = "http://127.0.0.1:8000";
  const userId =
    typeof window !== "undefined"
      ? window.localStorage.getItem("userId")?.trim() || "1"
      : "1";

  // 학기 키 정렬 (1-1, 1-2, 2-1 …)
  const orderedSemKeys = useMemo(() => {
    const parse = (s: string) => {
      const [a, b] = s.split("-").map(Number);
      return [a || 0, b || 0] as const;
    };
    return Object.keys(data).sort((x, y) => {
      const [ax, bx] = parse(x);
      const [ay, by] = parse(y);
      if (ax !== ay) return ax - ay;
      return bx - by;
    });
  }, [data]);

  // 데이터 fetch
  useEffect(() => {
    let abort = false;
    const fetchList = async () => {
      setLoading(true);
      setErr(null);
      try {
        const url = `${API_BASE}/api/semesters/${encodeURIComponent(
          userId
        )}/?filter=${active}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ApiResp;
        if (!abort) setData(json || {});
      } catch (e: any) {
        if (!abort) setErr(e?.message || "불러오기 실패");
      } finally {
        if (!abort) setLoading(false);
      }
    };
    fetchList();
    return () => {
      abort = true;
    };
  }, [API_BASE, userId, active]);

  const isEmpty =
    !loading &&
    !err &&
    (Object.keys(data).length === 0 ||
      Object.values(data).every((arr) => !arr || arr.length === 0));

  return (
    <section className={styles.card}>
      {/* 헤더 */}
      <header className={styles.header}>
        <div className={styles.titles}>
          <h2 className={styles.title}>미수강 과목</h2>
          <p className={styles.subtitle}>전체 학기에서 선택한 분류만 모아보기</p>
        </div>

        {/* 상단 필터 토글 칩 */}
        <div className={styles.filterChips}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`${styles.chip} ${active === f.key ? styles.chipActive : ""}`}
              onClick={() => setActive(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {/* 표 영역 */}
      <div className={styles.listArea}>
        {/* ⬇ 얇은 상단 라인 + 컬럼 라벨 */}
        <div className={styles.tableHeaderWrap}>
          <div className={styles.tableHeader}>
            <span>학수번호</span>
            <span>학기</span>
            <span>과목명</span>
            <span style={{ textAlign: "right" }}>학점</span>
          </div>
        </div>

        {/* ⬇ 스크롤 가능한 데이터 영역 */}
        <div className={styles.rows}>
          {loading && <div className={styles.center}>불러오는 중…</div>}

          {err && (
            <div className={styles.centerError}>
              불러오기 실패: {err}{" "}
              <button className={styles.reset} onClick={() => setActive(active)}>재시도</button>
            </div>
          )}

          {isEmpty && !loading && !err && (
            <div className={styles.emptyState}>
              <p>해당 분류에 해당하는 과목이 없습니다.</p>
              <button className={styles.reset} onClick={() => setActive("majormust")}>
                필터 초기화
              </button>
            </div>
          )}

          {!isEmpty &&
            !loading &&
            !err &&
            orderedSemKeys.map((semKey) => (
              <div key={semKey} className={styles.semesterGroup}>
                <div className={styles.semesterTitle}>{semKey}</div>
                {(data[semKey] || []).map((item) => (
                  <div key={`${item.code}-${item.name}`} className={styles.row}>
                    <span className={styles.code}>{item.code}</span>
                    <span className={styles.sem}>{item.semester}</span>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.credit}>{item.credit ?? "-"}</span>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
