"use client";

import { useRef, useState } from "react";
import styles from "./TestPage.module.css";
import Header from "../../components/Header/Header";

export default function Testage() {
  const userId = "123"; // 실제 userId 동적으로 받아오세요
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);
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
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("업로드할 파일을 선택해주세요.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("transcript", file); // 백엔드에서 요구하는 필드명 확인 필요

    try {
      const res = await fetch(`/api/transcripts/${userId}/`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert(`"${file.name}" 파일이 성공적으로 업로드 되었습니다!`);
        handleRemoveFile();
      } else {
        alert("업로드 실패했습니다.");
      }
    } catch (error) {
      console.error("업로드 중 에러:", error);
      alert("업로드 중 에러가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Header />

      <div className={styles.page}>
        <div className={styles.textbox}>
          <div className={styles.title}>성적표를 업로드 해 주세요.</div>
          <div className={styles.subtitle}>
            5MB 이하의 PDF, PNG 형식의 파일이 업로드 가능합니다.
          </div>
        </div>

        <div
          className={styles.uploadbox}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className={styles.imagebox}>
            {file ? (
              <div className={styles.fileDisplay}>
                <p className={styles.fileName}>{file.name}</p>
                <button
                  className={styles.removeBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  aria-label="파일 삭제"
                  type="button"
                  disabled={uploading}
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
              if (file) {
                handleUpload();
              } else {
                handleButtonClick();
              }
            }}
            style={{ cursor: uploading ? "not-allowed" : "pointer" }}
          >
            <img src="/plus.svg" alt="플러스" className={styles.plus} />
            <p>{file ? (uploading ? "업로드 중..." : "업로드") : "파일선택"}</p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".pdf,.png"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
      </div>
    </>
  );
}
