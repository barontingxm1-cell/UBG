:root {
  --bg: #07111f;
  --bg-soft: #0d1a2d;
  --panel: rgba(14, 26, 42, 0.88);
  --panel-strong: rgba(10, 18, 29, 0.96);
  --line: rgba(148, 163, 184, 0.2);
  --text: #e6eefb;
  --muted: #9ab4d4;
  --primary: #7c8dff;
  --primary-strong: #5f6ef8;
  --accent: #73f0c9;
  --warning: #ffce73;
  --danger: #ff6b8b;
  --shadow: 0 16px 40px rgba(15, 23, 42, 0.4);
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  min-height: 100%;
  background:
    radial-gradient(circle at top left, rgba(124, 141, 255, 0.24), transparent 26%),
    radial-gradient(circle at bottom right, rgba(115, 240, 201, 0.18), transparent 20%),
    var(--bg);
  color: var(--text);
  font-family: Inter, "Segoe UI", sans-serif;
}

body {
  padding: 32px 20px 50px;
}

button, input, textarea {
  font: inherit;
}

.app-shell {
  max-width: 1400px;
  margin: 0 auto;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.brand-block {
  position: relative;
  padding: 10px 14px 10px 18px;
  border-radius: 18px;
  border: 1px solid rgba(124, 141, 255, 0.24);
  background: linear-gradient(180deg, rgba(124, 141, 255, 0.12), rgba(15, 23, 42, 0.12));
}

.brand-block::before {
  content: "";
  position: absolute;
  left: 10px;
  top: 12px;
  width: 6px;
  height: 52%;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--accent), var(--primary));
  box-shadow: 0 0 18px rgba(115, 240, 201, 0.8);
}

.eyebrow {
  margin: 0 0 4px;
  color: var(--accent);
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.7rem;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 2vw + 1rem, 3rem);
}

.header-actions,
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

button {
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.18s ease, opacity 0.18s ease, border-color 0.18s ease;
}

button:hover {
  transform: translateY(-1px);
}

.primary-btn,
.secondary-btn,
.upload-btn,
.ghost-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.2rem;
  font-weight: 700;
  border-radius: 12px;
}

.primary-btn {
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  color: white;
  box-shadow: var(--shadow);
}

.secondary-btn,
.upload-btn {
  background: rgba(15, 23, 42, 0.6);
  color: var(--text);
  border-color: var(--line);
}

.ghost-btn {
  background: rgba(255, 255, 255, 0.02);
  color: var(--muted);
  border-color: rgba(148, 163, 184, 0.18);
}

.workspace {
  display: grid;
  grid-template-columns: minmax(420px, 1fr) minmax(430px, 1.15fr);
  gap: 22px;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
  padding: 18px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.08rem;
}

.badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  border: 1px solid var(--line);
}

.badge.neutral {
  background: rgba(148, 163, 184, 0.08);
  color: var(--muted);
}

.dropzone {
  position: relative;
  border-radius: 18px;
  border: 1px dashed rgba(124, 141, 255, 0.45);
  background: rgba(8, 15, 24, 0.9);
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.18s ease;
}

.dropzone.is-dragover {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(115, 240, 201, 0.12);
  transform: translateY(-1px);
}

textarea {
  width: 100%;
  resize: vertical;
  min-height: 420px;
  border: 0;
  background: transparent;
  color: var(--text);
  padding: 1rem 1.1rem;
  line-height: 1.5;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 0.92rem;
  outline: none;
}

textarea:focus {
  box-shadow: inset 0 0 0 1px rgba(124, 141, 255, 0.12);
}

.drop-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  font-weight: 700;
  background: rgba(115, 240, 201, 0.04);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.dropzone.is-dragover .drop-overlay {
  opacity: 1;
}

.preview-wrap {
  min-height: 360px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(8, 15, 24, 0.9);
  overflow: hidden;
}

#previewFrame {
  display: block;
  width: 100%;
  min-height: 360px;
  border: 0;
  background: white;
}

.text-preview {
  margin: 0;
  padding: 1rem;
  min-height: 360px;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 0.88rem;
  color: var(--text);
}

.hidden {
  display: none !important;
}

.embed-box {
  margin-top: 18px;
}

.embed-box label {
  display: inline-block;
  margin-bottom: 8px;
  color: var(--muted);
  font-weight: 700;
}

#embedOutput {
  min-height: 190px;
}

@media (max-width: 980px) {
  .workspace {
    grid-template-columns: 1fr;
  }

  .topbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
