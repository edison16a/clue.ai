// app/page.tsx
"use client";

import { useRef, useState } from "react";

export default function Page() {
  const [code, setCode] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiText, setAiText] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImage(file);
  };

  const handleImage = (file: File) => {
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImage(file);
  };

  const onStart = () => {
    // Demo behavior: craft a gentle, non-solution “coaching” style response
    const hasCode = code.trim().length > 0;
    const hasImg = !!imagePreview;

    const intro =
      "Here’s how I’d help without giving the answer directly—let’s debug like a pro:";
    const steps: string[] = [];

    if (hasCode) {
      steps.push(
        "1) Identify the exact input → output you expect; add a tiny test case you can run.",
        "2) Locate the smallest function or block that could be failing; comment out unrelated parts.",
        "3) Add one print/log to confirm assumptions about variables and branches.",
        "4) Check edge cases (empty arrays/strings, off-by-one indexes, null/undefined).",
        "5) Re-read error messages; they almost always point to the line/class/module that matters."
      );
    } else {
      steps.push(
        "Paste a minimal code snippet or upload a lab screenshot so we can zoom into the exact step."
      );
    }

    if (hasImg) {
      steps.push(
        "From the image, focus on the prompt’s constraints (input types, bounds). Translate those into tests."
      );
    }

    setAiText([intro, "", ...steps].join("\n"));
  };

  return (
    <main className="container">
      <header className="hero">
        <h1 className="brand">Clue.ai</h1>
        <p className="tagline">
          An AI Agent that helps students troubleshoot code or coding labs (and CodingBat!)—without
          directly giving the answer.
        </p>
        <button className="startBtn" onClick={onStart} aria-label="Start troubleshooting">
          Start
        </button>
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
              placeholder={`// Paste your Java, Python, JS, etc.\n// Keep it minimal (MCVE).`}
              spellCheck={false}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div className="uploadRow">
            <label
              className="dropzone"
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
                <span>Drag & drop or click to upload</span>
                {imageName && <em className="fileNote">Selected: {imageName}</em>}
              </div>
            </label>

            {imagePreview && (
              <div className="thumb">
                {/* decorative preview */}
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
            {aiText ? (
              <pre className="aiText">{aiText}</pre>
            ) : (
              <div className="placeholder">
                <p>
                  Hit <strong>Start</strong> to get coaching steps that point you in the right
                  direction—without spoiling the solution.
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
