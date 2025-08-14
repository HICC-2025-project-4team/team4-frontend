"use client";

import { useRef, useState } from "react";
import styles from "./Upload.module.css";
import Header from "../../components/Header/Header";

export default function UploadPage() {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setFileName(file.name);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleRemoveFile = () => {
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = () => {
    if (!fileName) {
      alert("업로드할 파일을 선택해주세요.");
      return;
    }
    console.log("업로드할 파일:", fileName);
    alert(`"${fileName}" 파일이 업로드되었습니다!`);
    handleRemoveFile();
  };

  return (
    <>
      {/* Header는 page 바깥에 두어 전체 너비 차지 */}
      <Header />

      {/* 컨텐츠 영역: 왼쪽 여백 포함 */}
      <div className={styles.page}>
        <div className={styles.textbox}>
          <div className={styles.title}>
            성적표를 업로드 해 주세요.
          
          </div>
          <div className={styles.subtitle}>
            한 장의 파일에 하나의 학기만 포함되도록 해주세요
            <br />
            5MB 이하의 PDF, PNG 형식의 파일이 업로드 가능합니다.
          </div>
        </div>

        <div
          className={styles.uploadbox}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className={styles.imagebox}>
            {fileName ? (
              <div className={styles.fileDisplay}>
                <p className={styles.fileName}>{fileName}</p>
                <button
                  className={styles.removeBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  aria-label="파일 삭제"
                  type="button"
                >
                  ❌
                </button>
              </div>
            ) : (
              <img src="/Image_icon.svg" alt="아이콘" className={styles.icon} />
            )}
          </div>

          <div className={styles.message}>
            <p>첨부할 파일을 직접 끌어다 놓거나, 파일 선택 버튼을 눌러주세요.</p>
          </div>

          <div
            className={styles.btn}
            onClick={(e) => {
              e.stopPropagation();
              if (fileName) {
                handleUpload();
              } else {
                handleButtonClick();
              }
            }}
          >
            <img src="/plus.svg" alt="플러스" className={styles.plus} />
            <p>{fileName ? "업로드" : "파일선택"}</p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".pdf,.png"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </>
  );
}
