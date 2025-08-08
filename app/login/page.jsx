"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const [formData, setFormData] = useState({ student_id: "", password: "" });
  const [idError, setIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();

  const validateStudentId = (id) => /^[a-zA-Z]\d{6}$/.test(id);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (formData.student_id && !validateStudentId(formData.student_id)) {
      setIdError("영어+숫자 6자리의 조합으로 입력해주세요.");
    } else {
      setIdError("");
    }
  }, [formData.student_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    if (idError) return;

    try {
      await axios.post("http://127.0.0.1:8000/api/users/login/", {
        student_id: formData.student_id,
        password: formData.password,
      });
      setMessage("로그인 성공!");
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      if (detail.includes("비밀번호")) {
        setPasswordError("비밀번호가 일치하지 않습니다. 다시 입력해주세요.");
      } else {
        setMessage("로그인 실패: " + detail);
      }
    }
  };

  const handleClose = () => {
    router.push("/");
  };

  const isFormValid = validateStudentId(formData.student_id);

  return (
    <div className={styles.page}>
      <div className={styles.character} style={{ backgroundImage: "url('/character.png')" }}></div>

      <form
        onSubmit={handleSubmit}
        className={`${styles.form} ${(idError || passwordError) ? styles.errorForm : ""}`}
      >
        <button type="button" className={styles.closeBtn} onClick={handleClose}>
          ✕
        </button>

        <div className={styles.topGroup}>
          <h1 className={styles.title}>로그인</h1>
          <p className={styles.subtitle}>돌아오신걸 환영합니다!</p>

          {/* 학번 입력 */}
          <div className={styles.inputWrapper}>
            <label className={styles.label}>학번</label>
            <div className={`${styles.studentContainer} ${hasError ? styles.inputError : ""}`}>
              <input
                type="text"
                className={styles.input}
                placeholder="학번을 입력하세요"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
              
            </div>
            {hasError && <p className={styles.error}>영어+숫자 6자리 조합이어야 합니다.</p>}
          </div>

          {/* 비밀번호 입력 */}
          <div className={styles.inputWrapper}>
            <label className={styles.label}>비밀번호</label>
            <div className={styles.passwordContainer}>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력해주세요."
                value={formData.password}
                onChange={handleChange}
                className={`${styles.input} ${passwordError ? styles.inputError : ""}`}
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
                    fill="#697077"
                  />
                  <circle cx="12" cy="12" r="2.5" fill="#697077" />
                </svg>
              </button>
            </div>
            {passwordError && <p className={styles.error}>{passwordError}</p>}
          </div>

          {/* 로그인 버튼 */}
          <div className={styles.buttonContainer}>
            <button
              type="submit"
              className={`${styles.button} ${isFormValid ? styles.activeButton : ""}`}
            >
              로그인하기
            </button>
          </div>

          {/* 서버 메시지 */}
          {message && <p className={styles.serverMessage}>{message}</p>}
        </div>

        {/* 하단 빨간 줄 */}
        {(idError || passwordError) && <div className={styles.redLine}></div>}
      </form>
    </div>
  );
}
