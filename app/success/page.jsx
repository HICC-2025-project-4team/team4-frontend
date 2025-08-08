// app/success/page.jsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./SuccessPage.module.css";




export default function SuccessPage() {
  const router = useRouter();

  /*useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);*/

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        {/* 기존 캐릭터 이미지 */}
        <img
          src="/character.png"
          alt="logo character"
          className={styles.logoCharacter}
        />

        
        

        <span className={styles.title}>홍익졸업봇</span>
      </div>

      <div className={styles.message}>
        김컴공님,
        <br />
        환영합니다!
      </div>

      <img
        src="/bottom-character.gif"
        alt="bottom character"
        className={styles.bottomCharacter}
      />
    </div>
  );
}
