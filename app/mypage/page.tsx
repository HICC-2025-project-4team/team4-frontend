"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./MyPage.module.css";
import CreditBar from "./components/CreditBar";
import NotTakenCard from "./components/NotTakenCourses";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

/** accessToken이 있으면 Authorization 헤더를 붙여준다 */
function getAuthHeaders(base: HeadersInit = {}): HeadersInit {
  if (typeof window === "undefined") return base;
  const access = localStorage.getItem("accessToken") || "";
  return access ? { ...base, Authorization: `Bearer ${access}` } : base;
}

/** 로컬스토리지에서 이름/학번 읽기 (신규 키 우선, 구키 fallback) */
function readNameAndSidFromStorage() {
  if (typeof window === "undefined")
    return { name: null as string | null, sid: null as string | null };

  // 신규 키 (LoginModal이 저장하는 키)
  const fullNameNew = localStorage.getItem("fullName");
  const studentIdNew = localStorage.getItem("studentId");

  // 레거시 키 (이전 페이지에서 쓰던 키)
  const fullNameLegacy = localStorage.getItem("fullname");
  const studentIdLegacy = localStorage.getItem("StudentId");

  const name = (fullNameNew ?? fullNameLegacy) || null;
  const sid = (studentIdNew ?? studentIdLegacy) || null;

  return {
    name: name && name.trim() ? name.trim() : null,
    sid: sid && sid.trim() ? sid.trim().toUpperCase() : null,
  };
}

/** 프로필을 서버에서 가져와 로컬스토리지와 상태를 동기화 */
async function fetchAndCacheProfile(possibleSid?: string | null) {
  const headers = getAuthHeaders();
  const access =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
  if (!access) return null; // 토큰 없으면 서버 조회 불가

  const url = possibleSid
    ? `${API_BASE}/api/users/me/?student_id=${encodeURIComponent(possibleSid)}`
    : `${API_BASE}/api/users/me/`;

  try {
    const res = await fetch(url, { method: "GET", headers, cache: "no-store" });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      console.warn("GET /users/me failed", res.status, data);
      return null;
    }

    // 표준 키로 저장 (필요 시 레거시 키도 유지)
    if (data.full_name) {
      localStorage.setItem("fullName", data.full_name);
      localStorage.setItem("fullname", data.full_name); // 레거시 호환
    }
    if (data.student_id) {
      localStorage.setItem("studentId", data.student_id);
      localStorage.setItem("StudentId", data.student_id); // 레거시 호환
    }
    if (data.id != null) localStorage.setItem("userId", String(data.id));
    if (data.current_year != null)
      localStorage.setItem("currentYear", String(data.current_year));
    if (data.major) localStorage.setItem("major", data.major);
    localStorage.setItem("user", JSON.stringify(data));

    return {
      name: (data.full_name as string) ?? null,
      sid: (data.student_id as string) ?? null,
    };
  } catch (e) {
    console.warn("GET /users/me error", e);
    return null;
  }
}

export default function MyPage() {
  const [{ name, sid }, setInfo] = useState<{ name: string | null; sid: string | null }>(() =>
    readNameAndSidFromStorage()
  );
  const [loading, setLoading] = useState(false);

  // 초기 로드 + 같은 탭 갱신(user-updated) + 다른 탭 갱신(storage)
  useEffect(() => {
    let mounted = true;

    const syncFromStorage = async () => {
      const { name: n, sid: s } = readNameAndSidFromStorage();
      if (!mounted) return;

      // 1) 스토리지 값 우선 반영
      setInfo({ name: n, sid: s });

      // 2) 이름 또는 학번이 없고, accessToken이 있으면 서버에서 보강
      const access = localStorage.getItem("accessToken") || "";
      if ((!n || !s) && access) {
        try {
          setLoading(true);
          const fromServer = await fetchAndCacheProfile(s);
          if (!mounted) return;
          if (fromServer) {
            setInfo({
              name: fromServer.name ?? n ?? null,
              sid: (fromServer.sid ?? s ?? "").toUpperCase() || null,
            });
          }
        } finally {
          setLoading(false);
        }
      }
    };

    // 첫 로드
    syncFromStorage();

    // ✅ 같은 탭에서도 즉시 반영: LoginModal이 쏜 이벤트 구독
    const onUpdated = () => syncFromStorage();
    window.addEventListener("user-updated", onUpdated as EventListener);

    // 다른 탭 변경용 storage 구독
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== window.localStorage) return;
      const interesting = new Set([
        "fullName",
        "studentId",
        "fullname",
        "StudentId",
        "accessToken",
        "user",
      ]);
      if (e.key === null || interesting.has(e.key)) {
        syncFromStorage();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      mounted = false;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("user-updated", onUpdated as EventListener);
    };
  }, []);

  const displayName =
    name ? (name.endsWith("님") ? name : `${name}님`) : loading ? "불러오는 중…" : "이름 미등록";
  const displayStudentId = sid ?? (loading ? "불러오는 중…" : "학번 미등록");

  return (
    <div className={styles.page}>
      <img src="/Frame.svg" alt="frame" width={157} height={51} className={styles.frame} />

      <div className={styles.box}>
        <p className={styles.name}>{displayName}</p>
        <p className={styles.student_id}>{displayStudentId}</p>
        <p className={styles.major}>컴퓨터공학과</p>

        {/* 메뉴 리스트 */}
        <div className={styles.menu}>
          <div className={styles.menuItem2}>
            <Image src="/Icon_plus file.svg" alt="성적표 파일 추가" width={20} height={20} />
            <span>성적표 파일 추가하기</span>
          </div>

          <div className={styles.menuItem}>
            <Image src="/Icon_trash.svg" alt="성적표 정보 삭제" width={20} height={20} />
            <span>성적표 정보 삭제</span>
          </div>

          <div className={styles.menuItem2}>
            <Image src="/Icon_home.svg" alt="컴퓨터공학과 홈페이지" width={20} height={20} />
            <span>컴퓨터공학과 홈페이지</span>
          </div>

          <div className={styles.menuItem}>
            <Image src="/Icon_texted file.svg" alt="2025 교과과정 책자 합본" width={20} height={20} />
            <span>2025 교과과정 책자 합본</span>
          </div>

          <div className={styles.menuItem2}>
            <Image src="/Icon_setting.svg" alt="설정" width={20} height={20} />
            <span>설정</span>
          </div>
        </div>

        {/* 하단 */}
        <div className={styles.sbox}>
          <div className={styles.Quest}>
            <Image src="/Icon_contact.svg" alt="문의하기" width={20} height={20} className={styles.Questimg} />
            <p className={styles.quest}>문의하기</p>
          </div>
          <div className={styles.Logout}>
            <Image src="/Icon_logout.svg" alt="로그아웃" width={20} height={20} className={styles.Logoutimg} />
            <p className={styles.logout}>로그아웃</p>
          </div>
        </div>
      </div>

      <CreditBar />
      <NotTakenCard />
    </div>
  );
}
