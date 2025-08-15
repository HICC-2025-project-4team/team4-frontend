"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Upload.module.css";
import Header from "../../components/Header/Header";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];

// ✅ 추가: 확장자 ↔︎ MIME 매핑 & 유틸
const ALLOWED_EXTS = [".pdf", ".png", ".jpg", ".jpeg"];
const EXT_TO_MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};
const guessMime = (name: string) => {
  const lower = name.toLowerCase();
  for (const ext of Object.keys(EXT_TO_MIME)) {
    if (lower.endsWith(ext)) return EXT_TO_MIME[ext];
  }
  return "";
};
// ✅ 추가: 브라우저가 type을 비우거나 octet-stream으로 주는 경우 보정
const normalizeFile = (f: File) => {
  if (f.type && f.type !== "application/octet-stream") return f;
  const mime = guessMime(f.name);
  return mime ? new File([f], f.name, { type: mime }) : f;
};

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // ✅ 수정: 확장자 보조검사 + MIME 보정 로직 포함
  const validateFile = (raw: File) => {
    const f = normalizeFile(raw);
    const lower = f.name.toLowerCase();

    // 1) 확장자 허용
    const okExt = ALLOWED_EXTS.some((ext) => lower.endsWith(ext));
    if (!okExt) return `지원하지 않는 형식(확장자): ${f.name}`;

    // 2) MIME 허용 (비어있으면 확장자에서 추정)
    const mime = f.type || guessMime(f.name);
    if (!ALLOWED_TYPES.includes(mime)) return `지원하지 않는 형식(MIME): ${f.name}`;

    // 3) 용량
    if (f.size > MAX_SIZE_BYTES) return `용량 초과(>5MB): ${f.name}`;

    return null;
  };

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const incoming = Array.from(fileList);

    const errors: string[] = [];
    const valids: File[] = [];
    const exist = new Set(files.map((f) => f.name));

    incoming.forEach((raw) => {
      const err = validateFile(raw);
      if (err) errors.push(err);
      else if (!exist.has(raw.name)) valids.push(normalizeFile(raw)); // ✅ 추가: 내부 상태도 보정된 파일로 저장
    });

    if (errors.length) setMessage(errors.join("\n"));
    if (valids.length) setFiles((prev) => [...prev, ...valids]);

    // 같은 파일 다시 선택 가능하게 초기화
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => addFiles(e.target.files);

  const removeOne = (name: string) => setFiles((prev) => prev.filter((f) => f.name !== name));
  const clearAll = () => {
    setFiles([]);
    setMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /** 업로드 후 OCR/파싱 상태를 폴링 */
  const pollStatusUntilComplete = async (userId: string, token?: string | null) => {
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // ✅ 수정: .env 사용(없으면 로컬 기본)
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
    const statusUrl = `${API_BASE}/api/transcripts/status/${encodeURIComponent(userId)}/`;

    const started = Date.now();
    const TIMEOUT_MS = 60_000; // 최대 60초
    const INTERVAL_MS = 1500;

    return new Promise<void>((resolve, reject) => {
      const tick = async () => {
        try {
          const res = await fetch(statusUrl, { headers });
          if (res.status === 401) {
            reject(new Error("인증이 필요합니다. 로그인 후 다시 시도해주세요."));
            return;
          }
          if (res.status === 404) {
            if (Date.now() - started > TIMEOUT_MS) {
              reject(new Error("해당 성적표가 존재하지 않습니다."));
              return;
            }
          } else if (res.ok) {
            const data = await res.json();
            const status = data?.status as string | undefined;
            if (status === "completed") { resolve(); return; }
            if (status === "error") { reject(new Error("처리 중 오류가 발생했습니다.")); return; }
          }
        } catch {
          // 네트워크 이슈는 재시도
        }

        if (Date.now() - started > TIMEOUT_MS) {
          reject(new Error("처리가 지연되고 있습니다. 잠시 후 다시 확인해주세요."));
          return;
        }
        setTimeout(tick, INTERVAL_MS);
      };
      tick();
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("업로드할 파일을 선택해주세요.");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("userId가 없습니다. localStorage에 userId를 설정해주세요.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // ✅ 수정: .env 사용(없으면 로컬 기본)
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
    const uploadUrl = `${API_BASE}/api/transcripts/${encodeURIComponent(userId)}/`;

    setIsUploading(true);
    setMessage("업로드 중… (파일 전송)");

    let success = 0;
    let failure = 0;

    try {
      // 백엔드가 단건 업로드이므로 파일마다 POST
      for (const f of files) {
        const formData = new FormData();
        // ✅ 중요: filename 명시 & 브라우저가 Content-Type 자동설정하도록 둠 (직접 설정 금지)
        formData.append("file", f, f.name);

        const res = await fetch(uploadUrl, { method: "POST", headers, body: formData });
        const isJson = res.headers.get("content-type")?.includes("application/json");
        const data = isJson ? await res.json() : null;

        if (res.status === 201) {
          success += 1;
        } else {
          failure += 1;
          if (data?.error) {
            setMessage((prev) => [prev, `${f.name}: ${data.error}`].filter(Boolean).join("\n"));
          } else {
            setMessage((prev) => [prev, `${f.name}: 업로드 실패(${res.status})`].filter(Boolean).join("\n"));
          }
        }
      }

      if (success === 0) {
        setMessage(`업로드 실패 (${failure}건).`);
        return;
      }

      // 최소 1건 이상 성공 시 상태 폴링 시작
      setMessage("업로드 중… (OCR/파싱 처리 대기)");
      await pollStatusUntilComplete(userId, token);

      // 완료 시 메시지 → 3초 후 이동
      setMessage("업로드 완료! 3초 후 마이페이지로 이동합니다…");
      setTimeout(() => router.push("/mypage"), 3000);
    } catch (err: any) {
      setMessage(err?.message || "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.textbox}>
          <div className={styles.title}>성적표를 업로드 해 주세요.</div>
          <div className={styles.subtitle}>
            5MB 이하의 PDF/PNG/JPG 파일을 여러 개 선택하거나 드래그&드롭으로 추가할 수 있어요.
          </div>
          {message && <div className={styles.notice} aria-live="polite">{message}</div>}
        </div>

        <div
          className={styles.uploadbox}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          role="region"
          aria-label="파일 업로드 영역"
        >
          <div className={styles.imagebox}>
            {files.length > 0 ? (
              <div className={styles.fileDisplay} style={{ width: "100%" }}>
                <ul className={styles.fileList} aria-label="선택된 파일 목록">
                  {files.map((f) => (
                    <li key={f.name} className={styles.fileItem}>
                      <span className={styles.fileName}>{f.name}</span>
                      <button
                        className={styles.removeBtn}
                        onClick={(e) => { e.stopPropagation(); removeOne(f.name); }}
                        aria-label={`${f.name} 삭제`}
                        type="button"
                        disabled={isUploading}
                      >
                        ❌
                      </button>
                    </li>
                  ))}
                </ul>
                <div className={styles.fileActions}>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={(e) => { e.stopPropagation(); clearAll(); }}
                    disabled={isUploading}
                    aria-label="모든 파일 삭제"
                  >
                    전체 비우기
                  </button>
                </div>
              </div>
            ) : (
              <img src="/Image_icon.svg" alt="아이콘" className={styles.icon} />
            )}
          </div>

          <div className={styles.message}>
            <p>여러 개 파일을 끌어다 놓거나, 파일 선택 버튼으로 선택하세요.</p>
          </div>

          <button
            type="button"
            className={styles.btn}
            onClick={(e) => {
              e.stopPropagation();
              if (files.length > 0) handleUpload();
              else fileInputRef.current?.click();
            }}
            disabled={isUploading}
            aria-busy={isUploading}
          >
            <img src="/plus.svg" alt="" className={styles.plus} aria-hidden />
            <p>
              {isUploading
                ? "업로드 중..."
                : files.length > 0
                  ? `업로드 (${files.length}개)`
                  : "파일선택"}
            </p>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".pdf,.png,.jpg,.jpeg"
            multiple
            onChange={handleFileChange}
          />
        </div>
      </div>
    </>
  );
}
