"use clinet";

import Image from "next/image";
import styles from "./SuccessPage.module.css";
import Header from "../../components/Header/Header";

export default function SuccessPage(){
  return(
    <div className={styles.page}>
      <Header/>
      <div className={styles.title}>
        김컴공님,
        <br />
        환영합니다!
      </div>
      <div className={styles.ImageWrapper}>
        <Image
          src="/bottom.gif"
          alt="BottomGIF"
          width={558}
          height={353}
        />
      </div>
    </div>
  );
} 