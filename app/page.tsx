// app/page.tsx
"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";    
import remarkGfm from "remark-gfm";      

export default function Page() {
  const [code, setCode] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");                // kept
  const [imagePreview, setImagePreview] = useState<string | null>(null); // kept (legacy single)
  const [aiText, setAiText] = useState<string>("");
  const [ask, setAsk] = useState<string>("");                            // NEW: optional prompt text
  const [images, setImages] = useState<Array<{ name: string; src: string }>>([]); // NEW: multi
  const [isLoading, setIsLoading] = useState<boolean>(false);            // NEW: loading bar state
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // NEW: util to add multiple files
  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // for "File uploaded" label logic
    setImageName(files[0].name);

    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        setImages((prev) => [...prev, { name: file.name, src }]);

        // keep your legacy single-preview working (first file only)
        if (idx === 0 && !imagePreview) setImagePreview(src);
      };
      reader.readAsDataURL(file);
    });
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files); // NEW
  };

  const handleImage = (file: File) => {
    // kept for compatibility (used by your original code paths)
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // UPDATED: accept multiple files
    const files = e.target.files;
    addFiles(files); // NEW
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // keep legacy single-preview in sync
      if (index === 0) {
        setImagePreview(next[0]?.src ?? null);
        setImageName(next[0]?.name ?? "");
      }
      return next;
    });
  };

  // REMOVED: onStart (no longer used)

  // UPDATED: Help button -> start loading bar (no fake text)
  const onHelp = async () => {
  try {
    setAiText("");
    setIsLoading(true);

    const res = await fetch("/api/help", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, ask, images }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Request failed");

    setAiText((data.aiText ?? "").trimStart());
  } catch (e: any) {
    setAiText(`Oops — ${e.message || "something went wrong."}`);
  } finally {
    setIsLoading(false);
  }
};
  // END UPDATED

  return (
    <main className="container">
      <header className="hero">
        <h1 className="brand">Clue.ai</h1>
        <p className="tagline">
          An AI Agent that helps students troubleshoot code or coding labs—without
          directly giving the answer.
        </p>
        {/* REMOVED Start button */}
      </header>

      <section className="panel">
        <div className="left">
          <div className="fieldGroup">
            <label htmlFor="code" className="label">
              Paste your code
            </label>
            <textarea
              id="code"
              className="codebox"
              placeholder={`// Paste your Java, Python, JS, etc.\n// Attach pictures if needed.`}
              spellCheck={false}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          {/* NEW: Optional guidance input */}
          <div className="fieldGroup">
            <label htmlFor="ask" className="label">
              How can I help you (Optional)
            </label>
            <input
              id="ask"
              type="text"
              className="askInput"
              placeholder="Describe the bug, the goal, or what confuses you…"
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
            />
          </div>

          <div className={`uploadRow ${images.length ? "hasGallery" : ""}`}>
            <label
              className={`dropzone ${imageName ? "hasFile" : ""}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple                                          // NEW
                accept="image/*"
                className="hiddenFile"
                onChange={onFileChange}
                aria-label="Upload image of your assignment or error"
              />
              <div className="dzInner">
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 16V8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="dzText">Drag & drop or click to upload images</span>
                {imageName && <span className="dzTextUploaded">File uploaded</span>}
                {imageName && <em className="fileNote">Selected: {imageName}</em>}
              </div>
            </label>

            {/* NEW: Previews container with removable thumbs */}
            {images.length > 0 && (
              <div className="thumbs" aria-label="Uploaded previews">
                {images.map((img, i) => (
                  <div className="thumbItem" key={`${img.name}-${i}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.src} alt={`Uploaded ${img.name}`} />
                    <button
                      type="button"
                      className="thumbClose"
                      aria-label={`Remove ${img.name}`}
                      title="Remove"
                      onClick={() => removeImage(i)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Help button drives loading */}
            <button
              type="button"
              className="helpBtn"
              onClick={onHelp}
              aria-label="Get non-spoiler debugging help"
              title="Non-spoiler debugging help"
              aria-busy={isLoading}
              disabled={isLoading}
            >
              {/* Search icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{isLoading ? "Thinking…" : "Help Debug"}</span>
            </button>

            {/* legacy single preview block (kept). Hidden via CSS when gallery present */}
            {imagePreview && (
              <div className="thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Uploaded preview" />
              </div>
            )}
          </div>
        </div>

        <div className="right">
          <div className="aiHeader">
            <span className="pulse" aria-hidden="true" />
            <h2>AI Response</h2>
          </div>
          <div className="aiCard" role="region" aria-live="polite">
            {isLoading ? (
              /* NEW: fancy indefinite loading bar */
              <div className="loaderWrap">
                <div className="loaderTrack">
                  <div className="loaderBar" />
                </div>
                <p className="loaderHint">Generating guidance…</p>
              </div>
            ) : aiText ? (
              <div className="aiText">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiText}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="placeholder">
                <p>
                  Press <strong>Help Debug</strong> to start. I’ll analyze your code, images, and
                  context and return coaching-only steps (no spoilers).
                </p>
                <ul>
                  <li>Upload a screenshot of your prompt/error</li>
                  <li>Paste a minimal code snippet</li>
                  <li>Describe what you expected vs. what happened</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="foot">
        <p>
          Built for students • Edison Law 2025 • Monte Vista High School • v1.2.7
        </p>
      </footer>
    </main>
  );
}
