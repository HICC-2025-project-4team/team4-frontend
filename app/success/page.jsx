"use client";

import { useEffect } from "react";
import Image from "next/image";
import styles from "./SuccessPage.module.css";
import Header from "../../components/Header/Header";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const id = setTimeout(() => {
      router.replace("/mypage");
    }, 2000);
    return () => clearTimeout(id);
  }, [router]); 

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.title}>
        김컴공님,
        <br />
        환영합니다!
      </div>
      <div className={styles.ImageWrapper}>
        <Image
          src="/bottom.gif"
          alt="가입 성공 애니메이션"
          width={558}
          height={353}
          priority
        />
      </div>
    </div>
  );
}