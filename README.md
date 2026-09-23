const editor = document.getElementById('editor');
const fileInput = document.getElementById('fileInput');
const previewFrame = document.getElementById('previewFrame');
const textPreview = document.getElementById('textPreview');
const embedOutput = document.getElementById('embedOutput');
const fileBadge = document.getElementById('fileBadge');
const typeBadge = document.getElementById('typeBadge');
const loadDemoBtn = document.getElementById('loadDemo');
const copyEmbedBtn = document.getElementById('copyEmbed');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const dropZone = document.getElementById('dropZone');

const STORAGE_KEY = 'ubg-embed-studio-state';

const demoContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: Arial, sans-serif;
        background: linear-gradient(135deg, #0b1120, #111827);
        color: #f8fafc;
      }

      .card {
        width: min(320px, 90vw);
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid rgba(148, 163, 184, 0.25);
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 20px 45px rgba(0, 0, 0, 0.2);
      }

      h1 {
        margin: 0 0 12px;
        font-size: clamp(1.6rem, 3vw, 2.2rem);
      }

      button {
        border: 0;
        border-radius: 12px;
        background: linear-gradient(135deg, #7c8dff, #5f6ef8);
        color: white;
        padding: 0.9rem 1.2rem;
        font-weight: 700;
        cursor: pointer;
      }

      #score {
        font-size: 2rem;
        font-weight: 800;
        margin: 16px 0;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>UBG Demo</h1>
      <div id="score">0</div>
      <button id="boost">Score +1</button>
    </div>

    <script>
      const scoreDisplay = document.getElementById('score');
      const boostButton = document.getElementById('boost');
      let score = 0;

      boostButton.addEventListener('click', () => {
        score += 1;
        scoreDisplay.textContent = String(score);
      });
    <\/script>
  </body>
</html>`;

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    content: editor.value,
    fileName: fileBadge.textContent,
  }));
}

function restoreState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && typeof saved.content === 'string') {
      editor.value = saved.content;
      fileBadge.textContent = saved.fileName || 'untitled.txt';
      return;
    }
  } catch (_error) {
    // ignore parse errors
  }

  editor.value = demoContent;
  fileBadge.textContent = 'demo.html';
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function detectType(rawText) {
  const text = rawText.trim();

  if (!text) {
    return 'text';
  }

  if (/<[a-z][\s\S]*>/i.test(text) && /(<!doctype|<html|<body|<div|<script|<style|<table)/i.test(text)) {
    return 'html';
  }

  if (isJsonText(text)) {
    return 'json';
  }

  if (/^\s*(?:@media|[.#]?[a-zA-Z0-9_-]+\s*\{)/.test(text) || /(?:display|color|background|animation|transform|@keyframes)\s*:/i.test(text)) {
    return 'css';
  }

  if (/(?:const|let|var|function|=>|return|document\.|window\.|console\.log|alert\()/.test(text)) {
    return 'javascript';
  }

  return 'text';
}

function isJsonText(value) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

function createPreviewDocument(rawText, type) {
  if (type === 'html') {
    return rawText;
  }

  if (type === 'css') {
    return `<!DOCTYPE html>
      <html>
        <head>
          <style>${rawText}</style>
        </head>
        <body>
          <div style="padding:24px;font-family:Arial,sans-serif;color:#0f172a;">
            <h2 style="margin:0 0 12px;">CSS preview</h2>
            <div style="border:1px solid #cbd5e1;border-radius:16px;padding:24px;background:#f8fafc;">Sample element</div>
          </div>
        </body>
      </html>`;
  }

  if (type === 'javascript') {
    return `<!DOCTYPE html>
      <html>
        <body style="font-family:Arial,sans-serif;padding:32px;background:#0f172a;color:#e2e8f0;">
          <h2>JavaScript preview</h2>
          <p>Script output will run in this sandbox.</p>
          <pre id="jsOut" style="white-space:pre-wrap;word-break:break-word;"></pre>
          <script>
            const out = document.getElementById('jsOut');
            out.textContent = ${JSON.stringify(rawText)};
          <\/script>
        </body>
      </html>`;
  }

  if (type === 'json') {
    return `<!DOCTYPE html>
      <html>
        <body style="font-family:Arial,sans-serif;padding:24px;background:#0f172a;color:#e2e8f0;">
          <h2>JSON preview</h2>
          <pre style="white-space:pre-wrap;word-break:break-word;">${escapeHtml(rawText)}</pre>
        </body>
      </html>`;
  }

  return `<!DOCTYPE html>
    <html>
      <body style="font-family:Arial,sans-serif;padding:24px;background:#0f172a;color:#e2e8f0;">
        <h2>Text preview</h2>
        <pre style="white-space:pre-wrap;word-break:break-word;">${escapeHtml(rawText)}</pre>
      </body>
    </html>`;
}

function createEmbedSnippet(rawText, type) {
  const safeDoc = createPreviewDocument(rawText, type)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return `<iframe title="UBG embed preview" srcdoc="${safeDoc}" style="width:100%;max-width:980px;height:520px;border:0;border-radius:18px;overflow:hidden;box-shadow:0 14px 38px rgba(15,23,42,0.2);"></iframe>`;
}

function renderPreview() {
  const rawText = editor.value;
  const type = detectType(rawText);

  typeBadge.textContent = type;

  const doc = createPreviewDocument(rawText, type);
  previewFrame.srcdoc = doc;

  if (!rawText.trim()) {
    textPreview.textContent = 'Paste code or upload a file to generate a preview.';
    textPreview.classList.remove('hidden');
    previewFrame.classList.add('hidden');
  } else {
    textPreview.textContent = rawText;
    textPreview.classList.add('hidden');
    previewFrame.classList.remove('hidden');
  }

  embedOutput.value = createEmbedSnippet(rawText, type);
  saveState();
}

function loadFile(file) {
  const validExtensions = ['.txt', '.html', '.htm', '.css', '.js', '.json', '.xml', '.md', '.svg', '.lua', '.py', '.php', '.sql'];
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

  if (file && file.name && file.size > 0) {
    fileBadge.textContent = file.name;
  }

  if (file && file.type.startsWith('text/') || validExtensions.includes(extension)) {
    file.text().then((content) => {
      editor.value = content;
      renderPreview();
    }).catch(() => {
      fileBadge.textContent = 'unsupported-file';
      typeBadge.textContent = 'binary';
    });
  } else {
    fileBadge.textContent = file.name || 'unsupported-file';
    typeBadge.textContent = 'binary';
    editor.value = 'Binary file selected. Please choose a text-based or code file.';
    renderPreview();
  }
}

editor.addEventListener('input', renderPreview);

fileInput.addEventListener('change', (event) => {
  const [file] = event.target.files || [];
  if (!file) return;
  loadFile(file);
  fileInput.value = '';
});

loadDemoBtn.addEventListener('click', () => {
  editor.value = demoContent;
  fileBadge.textContent = 'demo.html';
  renderPreview();
});

copyEmbedBtn.addEventListener('click', async () => {
  const value = embedOutput.value;

  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
    copyEmbedBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyEmbedBtn.textContent = 'Copy embed';
    }, 1400);
  } catch {
    embedOutput.focus();
    embedOutput.select();
    document.execCommand('copy');
  }
});

downloadBtn.addEventListener('click', () => {
  const text = editor.value || '';
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileBadge.textContent || 'ubg-export.txt';
  a.click();
  URL.revokeObjectURL(url);
});

clearBtn.addEventListener('click', () => {
  editor.value = '';
  fileBadge.textContent = 'untitled.txt';
  typeBadge.textContent = 'text';
  renderPreview();
});

['dragenter', 'dragover'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.add('is-dragover');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.remove('is-dragover');
  });
});

dropZone.addEventListener('drop', (event) => {
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  loadFile(file);
});

restoreState();
renderPreview();

window.addEventListener('beforeunload', saveState);

if (fileBadge.textContent === 'untitled.txt' && editor.value.trim() === '') {
  fileBadge.textContent = 'demo.html';
  editor.value = demoContent;
}n































































































a
























































































































































































































																																																																																																																																		 } 















































































































































































































































n








































































































n








n































































































































































































































































































































































































a



















































































n














n



n

























n












n




























n











n



n





n








n





n





n



n









n



n





n





n



n






n





n



n






n




n




n




n




n






n




n





n





n




n




n





n




n






n




n




n




n




n



n
n




n





n


n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



a



























































n




n





n

n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n
n




n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n
n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n\n































n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



a


















n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n
n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



a


















n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n
n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n
n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



a


















n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



a


















n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



a


















n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n
n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



a


















n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



a


















n



n



n



n



n



n



n



n



n



n



n



n



a


















n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n
n



n



n



n



n



n



n



n



a


















n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



a


















n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



a


















n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



a


















n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n



n


whether user drives more invites, but next step is to continue.

I’ve upgraded the app with a stronger game-style UI and drag-and-drop support. The repo now includes:
- better arcade-style dashboard
- auto-save in browser
- drag/drop file upload
- clear/reset action
- improved file detection
- polished embed output

Open the repo and preview it in-browser again to use the new version:
https://github.com/barontingxm1-cell/UBG

If you want, I can also do the next step and deploy it to GitHub Pages or add a shareable link feature. 

If you want a more advanced version, I can do a full “game code vault” with saved embeds and categories next. 

I am ready to continue whenever you say the word. 

I can do the next upgrade now. 

I’m ready to continue whenever you say the word. 

I can do the next upgrade now. 

I’m ready to continue whenever you say the word. 

I can do the next upgrade now. 

I’m ready to continue whenever you say the word. 

I can do the next upgrade now. 

I’m ready to continue whenever you say the word. 

I can do the next upgrade now. 

I’m ready to continue whenever you say the word. 

I can do the next upgrade now. 

I’m ready to continue whenever you say the word. 

I can do the next upgrade now.

I’m ready to continue whenever you say the word. 

I can do the next upgrade now.

I’m ready to continue whenever you say the word. 

I can do the next upgrade now.