"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../MyPage.module.css";

/** localStorage에서 userId 안전 추출 */
function getUserIdFromStorage() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    if (u?.id != null) return String(u.id);
  } catch {}
  const saved = localStorage.getItem("userId");
  if (saved) return saved;
  const token = localStorage.getItem("accessToken") || "";
  if (!token) return null;
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1]).replace(/-/g, "+").replace(/_/g, "/")
    );
    return payload?.user_id ?? payload?.sub ?? payload?.uid ?? payload?.id ?? null;
  } catch {
    return null;
  }
}

/** "1-1", "2-2" 같은 학기 문자열 정렬 */
function semCompare(a, b) {
  const [ay, as] = (a || "").split("-").map(Number);
  const [by, bs] = (b || "").split("-").map(Number);
  if (Number.isNaN(ay) || Number.isNaN(by)) return (a || "").localeCompare(b || "");
  return ay === by ? as - bs : ay - by;
}

/** 성적 → 평점 */
function gradeToPoint(g) {
  const map = {
    "A+": 4.5, A0: 4.0,
    "B+": 3.5, B0: 3.0,
    "C+": 2.5, C0: 2.0,
    "D+": 1.5, D0: 1.0,
    F: 0,
    P: null, NP: null,
  };
  return map[g] ?? null;
}

export default function TakenCourses() {
  const [semesters, setSemesters] = useState([]);     // ["1-1","1-2",...]
  const [selected, setSelected] = useState("");       // 현재 선택 학기
  const [courses, setCourses] = useState([]);         // 해당 학기 과목 리스트
  const [openMenu, setOpenMenu] = useState(false);    // 드롭다운 표시
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // 퀵필터
  const [filter, setFilter] = useState("ALL");        // ALL | 전공 | 교양
  const [sort, setSort] = useState("NONE");           // NONE | GRADE_DESC

  /** 1) 학기 목록: GET /api/semesters/{user_id}/ */
  useEffect(() => {
    const userId = getUserIdFromStorage();
    if (!userId) return;

    (async () => {
      try {
        const access = localStorage.getItem("accessToken") || "";
        const res = await fetch(`http://127.0.0.1:8000/api/semesters/${userId}/`, {
          headers: access ? { Authorization: `Bearer ${access}` } : {},
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setErr(res.status === 404
            ? "성적표 데이터가 없습니다. 성적표를 먼저 업로드해 주세요."
            : "학기 정보를 불러오지 못했습니다.");
          return;
        }

        const keys = Object.keys(data || {}).sort(semCompare);
        setSemesters(keys);

        // 기본: 최신 학기
        const def = keys[keys.length - 1] || "";
        setSelected(def);
      } catch (e) {
        console.error(e);
        setErr("네트워크 오류로 학기 정보를 불러오지 못했습니다.");
      }
    })();
  }, []);

  /** 2) 선택 학기 과목: GET /api/semesters/{semester}/courses/{user_id}/ */
  useEffect(() => {
    const userId = getUserIdFromStorage();
    if (!userId || !selected) return;

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const access = localStorage.getItem("accessToken") || "";
        const res = await fetch(
          `${API_BASE}/api/semesters/${encodeURIComponent(selected)}/courses/${userId}/`,
          { headers: access ? { Authorization: `Bearer ${access}` } : {} }
        );
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setCourses([]);
          setErr("해당 학기에 수강한 과목이 없습니다.");
        } else {
          setCourses(Array.isArray(data?.courses) ? data.courses : []);
        }
      } catch (e) {
        console.error(e);
        setCourses([]);
        setErr("과목 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [selected]);

  /** 필터/정렬 적용 */
  const list = useMemo(() => {
    let arr = courses.slice();
    if (filter !== "ALL") {
      arr = arr.filter((c) => (c?.type || "").includes(filter));
    }
    if (sort === "GRADE_DESC") {
      arr.sort(
        (a, b) => (gradeToPoint(b?.grade) ?? -1) - (gradeToPoint(a?.grade) ?? -1)
      );
    }
    return arr;
  }, [courses, filter, sort]);

  const totalCredits = list.reduce((s, c) => s + (Number(c?.credit) || 0), 0);
  const avgGpa = useMemo(() => {
    let w = 0, cr = 0;
    list.forEach((c) => {
      const p = gradeToPoint(c?.grade);
      const cd = Number(c?.credit) || 0;
      if (p != null) { w += p * cd; cr += cd; }
    });
    return cr ? (w / cr).toFixed(2) : "-";
  }, [list]);

  /** 드롭다운 외부 클릭 닫기 (간단 버전) */
  useEffect(() => {
    if (!openMenu) return;
    const close = () => setOpenMenu(false);
    window.addEventListener("click", close, { once: true });
    return () => window.removeEventListener("click", close);
  }, [openMenu]);

  return (
    <section className={styles.takenSection}>
      {/* 헤더 */}
      <div className={styles.takenHeader}>
        <h3 className={styles.takenTitle}>수강 현황</h3>

        {/* 학기 드롭다운 */}
        <div className={styles.semPicker} onClick={(e)=>e.stopPropagation()}>
          <button
            type="button"
            className={styles.pill}
            onClick={() => setOpenMenu((v) => !v)}
          >
            {selected ? `${selected} 학기` : "학기 선택"}
            <span className={styles.caret}>▾</span>
          </button>
          {openMenu && (
            <ul className={styles.menu}>
              {semesters.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    className={styles.menuItem}
                    onClick={() => { setSelected(s); setOpenMenu(false); }}
                  >
                    {s} 학기
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 메타: N과목 / 평균 평점 / 합계 학점 */}
      {selected && (
        <div className={styles.meta}>
          <span>{selected} 학기 ({list.length}과목)</span>
          <span>평균 평점 {avgGpa}</span>
          <span>합계 {totalCredits}학점</span>
        </div>
      )}

      {/* 퀵필터 */}
      <div className={styles.quick}>
        <button
          className={`${styles.qBtn} ${filter === "ALL" ? styles.qActive : ""}`}
          onClick={() => setFilter("ALL")}
          type="button"
        >전체</button>
        <button
          className={`${styles.qBtn} ${filter === "전공" ? styles.qActive : ""}`}
          onClick={() => setFilter("전공")}
          type="button"
        >전공만</button>
        <button
          className={`${styles.qBtn} ${filter === "교양" ? styles.qActive : ""}`}
          onClick={() => setFilter("교양")}
          type="button"
        >교양만</button>
        <button
          className={`${styles.qBtn} ${sort === "GRADE_DESC" ? styles.qActive : ""}`}
          onClick={() => setSort((s) => (s === "GRADE_DESC" ? "NONE" : "GRADE_DESC"))}
          type="button"
        >성적순</button>
      </div>

      {/* 테이블 */}
      <div className={styles.table}>
        <div className={styles.th}>
          <div className={styles.colCode}>학수번호</div>
          <div className={styles.colType}>이수구분</div>
          <div className={styles.colName}>과목명</div>
          <div className={styles.colCredit}>학점</div>
          <div className={styles.colGrade}>성적</div>
        </div>

        {loading ? (
          <div className={styles.empty}>불러오는 중...</div>
        ) : err ? (
          <div className={styles.empty}>{err}</div>
        ) : list.length === 0 ? (
          <div className={styles.empty}>해당 학기에 수강한 과목이 없습니다.</div>
        ) : (
          list.map((c, idx) => (
            <div key={`${c?.name ?? "NA"}-${idx}`} className={styles.tr}>
              <div className={styles.colCode}>{"" /* 학수번호 없음 → 빈칸 */}</div>
              <div className={styles.colType}>{c?.type ?? "-"}</div>
              <div className={styles.colName}>{c?.name ?? "-"}</div>
              <div className={styles.colCredit}>{c?.credit ?? "-"}</div>
              <div className={styles.colGrade}>{c?.grade ?? "-"}</div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
