"use clinet";


import Image from "next/image";
import styles from "./Haeder.module.css";

export default function Header(){
  return(
    <header className={styles.header}>
      <div className={styles.Title}>
        <Image
          src="/title.svg"
          alt="Title"
          width={101}
          height={62}
        />
        <Image
          src="/Frame.svg"
          alt="Frame"
          width={187}
          height={62}
        />
      </div>
    </header>
  )
}