// app/page.tsx
"use client";

import { useRef, useState } from "react";

export default function Page() {
  const [code, setCode] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");                // kept
  const [imagePreview, setImagePreview] = useState<string | null>(null); // kept (legacy single)
  const [aiText, setAiText] = useState<string>("");
  const [ask, setAsk] = useState<string>("");                            // NEW: optional prompt text
  const [images, setImages] = useState<Array<{ name: string; src: string }>>([]); // NEW: multi
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

  const onStart = () => {
    // Demo behavior: craft a gentle, non-solution “coaching” style response
    const hasCode = code.trim().length > 0;
    const hasImg = images.length > 0 || !!imagePreview;
    const hasAsk = ask.trim().length > 0;

    const intro =
      "Here’s how I’d help without giving the answer directly—let’s debug like a pro:";
    const steps: string[] = [];

    if (hasAsk) {
      steps.push(`User context: ${ask}`);
    }

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

  // NEW: Help button handler (non-spoiler tips)
  const onHelp = () => {
    const help = [
      "Quick tips (no spoilers):",
      "• If there’s an error line number, read 3 lines above and below it.",
      "• Add one print/log to show key variable values before the failing line.",
      "• Check off-by-one: indexes, loop bounds, and <= vs <.",
      "• Confirm types/shape: string vs number, undefined/null, empty arrays.",
      "• Reproduce with the tiniest input that still fails.",
    ].join("\n");
    setAiText(help);
  };
  // END NEW

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
                <span className="dzText">Drag & drop or click to upload</span>
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

            {/* existing Help button; stays third in order */}
            <button
              type="button"
              className="helpBtn"
              onClick={onHelp}
              aria-label="Get non-spoiler debugging help"
              title="Non-spoiler debugging help"
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
              <span>Help Debug</span>
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
