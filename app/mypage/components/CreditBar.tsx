"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./CreditBar.module.css";

const API_BASE = ""; // 동일 도메인이면 빈 문자열 유지

// 서버 응답 타입
type PartResp = {
  major_completed?: number;
  general_completed?: number;
  drbol_completed?: number;
  sw_completed?: number;
  msc_completed?: number;
  special_general_completed?: number;
};

type TotalResp = {
  total_credit?: number; // GET /api/analysis/credit/total/{user_id}/
};

// 화면 표시용 상태
type StatusResp = {
  total_completed?: number;
  total_required?: number;

  major_completed?: number;
  major_required?: number;

  general_completed?: number;
  general_required?: number;

  drbol_completed?: number;
  drbol_required?: number;

  sw_completed?: number;
  sw_required?: number;

  msc_completed?: number;
  msc_required?: number;

  special_general_completed?: number;
  special_general_required?: number;
};

// ✅ 고정 Required 값
const REQUIRED = {
  total_required: 132,
  major_required: 50,
  general_required: 8,
  drbol_required: 18,
  sw_required: 9,
  msc_required: 23,
  special_general_required: 3,
};

export default function Horizonbar() {
  const [credits, setCredits] = useState<StatusResp>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = window.localStorage.getItem("user_id");
    if (!id) {
      setError("");
      setLoading(false);
      return;
    }

    // ⬇️ accessToken 읽기
    const access = localStorage.getItem("accessToken") || "";

    (async () => {
      try {
        // 공통 headers 생성
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (access) {
          headers["Authorization"] = `Bearer ${access}`;
        }

        // 파트 + 토탈 병렬 호출
        const [partRes, totalRes] = await Promise.all([
          fetch(`${API_BASE}/api/analysis/credit/part/${id}/`, {
            method: "GET",
            headers,
            cache: "no-store",
          }),
          fetch(`${API_BASE}/api/analysis/credit/total/${id}/`, {
            method: "GET",
            headers,
            cache: "no-store",
          }),
        ]);

        if (!partRes.ok) throw new Error(`파트 조회 실패 (${partRes.status})`);
        if (!totalRes.ok) throw new Error(`총 학점 조회 실패 (${totalRes.status})`);

        const [part, total]: [PartResp, TotalResp] = await Promise.all([
          partRes.json(),
          totalRes.json(),
        ]);

        const nu = (v?: number) =>
          typeof v === "number" && !Number.isNaN(v) ? v : undefined;

        setCredits({
          // 총 이수학점
          total_completed: nu(total.total_credit),
          total_required: REQUIRED.total_required,

          // 각 파트
          major_completed: nu(part.major_completed),
          major_required: REQUIRED.major_required,

          general_completed: nu(part.general_completed),
          general_required: REQUIRED.general_required,

          drbol_completed: nu(part.drbol_completed),
          drbol_required: REQUIRED.drbol_required,

          sw_completed: nu(part.sw_completed),
          sw_required: REQUIRED.sw_required,

          msc_completed: nu(part.msc_completed),
          msc_required: REQUIRED.msc_required,

          special_general_completed: nu(part.special_general_completed),
          special_general_required: REQUIRED.special_general_required,
        });
      } catch (e: any) {
        setError(e?.message ?? "상태 조회 중 오류 발생");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fmt = (v?: number) =>
    typeof v === "number" && !Number.isNaN(v) ? v : "—";

  return (
    <div className={styles.box}>
      <p className={styles.title}>졸업 요건 이수 현황</p>

      {/* 총 이수학점 */}
      <div className={styles.total}>
        <Image src="/Group.svg" alt="group" width={15} height={15} className={styles.icon} />
        <div className={styles.totalRow}>
          <p className={styles.tcredit}>총 이수학점</p>
          <p className={styles.tc}>
            {loading ? "로딩중…" : fmt(credits.total_completed)} / {fmt(credits.total_required)} 점
          </p>
        </div>
      </div>

      {/* 전공 */}
      <div className={styles.major}>
        <p className={styles.mcredit}>전공</p>
        <p className={styles.mc}>
          {loading ? "로딩중…" : fmt(credits.major_completed)} / {fmt(credits.major_required)} 점
        </p>
      </div>

      {/* 교양필수 */}
      <div className={styles.general}>
        <p className={styles.gcredit}>교양필수</p>
        <p className={styles.gc}>
          {loading ? "로딩중…" : fmt(credits.general_completed)} / {fmt(credits.general_required)} 점
        </p>
      </div>

      {/* 드래곤볼 */}
      <div className={styles.dvbol}>
        <p className={styles.dcredit}>드래곤볼</p>
        <p className={styles.dc}>
          {loading ? "로딩중…" : fmt(credits.drbol_completed)} / {fmt(credits.drbol_required)} 점
        </p>
      </div>

      

      

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
