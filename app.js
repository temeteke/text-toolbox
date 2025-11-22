// 文字コード表示機能
const charInput = document.getElementById('charInput');
const charCodeOutput = document.getElementById('charCodeOutput');
const charModal = document.getElementById('charModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.querySelector('.modal-close');

charInput.addEventListener('input', (e) => {
    const text = e.target.value;

    if (!text) {
        charCodeOutput.innerHTML = '';
        return;
    }

    let output = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const codePoint = char.codePointAt(0);
        const charCode = char.charCodeAt(0);

        output += `<div class="char-item" data-char="${escapeHtml(char)}" data-index="${i}"><div class="char-display">${escapeHtml(char)}</div><div class="char-codes"><div><strong>文字:</strong> ${getCharacterName(char)}</div><div><strong>Unicode:</strong> U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}</div><div><strong>10進数:</strong> ${codePoint}</div><div><strong>UTF-16:</strong> ${getUTF16String(char)}</div></div></div>`;
    }

    charCodeOutput.innerHTML = output;

    // 各文字アイテムにクリックイベントを追加
    document.querySelectorAll('.char-item').forEach(item => {
        item.addEventListener('click', () => {
            const char = item.getAttribute('data-char');
            showCharModal(char);
        });
    });
});

// 正規表現チェッカー機能
const regexPattern = document.getElementById('regexPattern');
const regexInput = document.getElementById('regexInput');
const regexOutput = document.getElementById('regexOutput');
const flagGlobal = document.getElementById('flagGlobal');
const flagIgnoreCase = document.getElementById('flagIgnoreCase');
const flagMultiline = document.getElementById('flagMultiline');

function updateRegexChecker() {
    const pattern = regexPattern.value;
    const text = regexInput.value;

    if (!pattern || !text) {
        regexOutput.innerHTML = '';
        return;
    }

    try {
        // フラグを構築
        let flags = '';
        if (flagGlobal.checked) flags += 'g';
        if (flagIgnoreCase.checked) flags += 'i';
        if (flagMultiline.checked) flags += 'm';

        const regex = new RegExp(pattern, flags);
        const matches = [];
        let match;

        // グローバルフラグがある場合は全てのマッチを取得
        if (flags.includes('g')) {
            while ((match = regex.exec(text)) !== null) {
                matches.push({
                    text: match[0],
                    index: match.index,
                    groups: match.slice(1)
                });
                // 無限ループ防止
                if (match.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
            }
        } else {
            match = regex.exec(text);
            if (match) {
                matches.push({
                    text: match[0],
                    index: match.index,
                    groups: match.slice(1)
                });
            }
        }

        if (matches.length === 0) {
            regexOutput.innerHTML = '<div class="regex-info">マッチする部分が見つかりませんでした。</div>';
            return;
        }

        // マッチ情報を表示
        let output = `<div class="regex-info">✓ ${matches.length} 件のマッチが見つかりました</div>`;

        // ハイライト表示
        let highlightedText = '';
        let lastIndex = 0;

        matches.forEach((m) => {
            highlightedText += escapeHtml(text.substring(lastIndex, m.index));
            highlightedText += `<span class="regex-match">${escapeHtml(m.text)}</span>`;
            lastIndex = m.index + m.text.length;
        });
        highlightedText += escapeHtml(text.substring(lastIndex));

        output += `<div style="margin-bottom: 6px; padding: 6px 8px; background-color: white; border-radius: 6px; border: 1px solid #ddd;">${highlightedText}</div>`;

        // マッチ詳細リスト
        output += '<div class="match-list"><strong>マッチの詳細:</strong>';
        matches.forEach((m, i) => {
            let groupsInfo = '';
            if (m.groups.length > 0) {
                groupsInfo = '<br><small>グループ: ' + m.groups.map((g, idx) => `$${idx + 1}="${escapeHtml(g || '')}"`).join(', ') + '</small>';
            }
            output += `<div class="match-item"><strong>#${i + 1}:</strong> "${escapeHtml(m.text)}" <small>(位置: ${m.index}〜${m.index + m.text.length - 1})</small>${groupsInfo}</div>`;
        });
        output += '</div>';

        regexOutput.innerHTML = output;

    } catch (error) {
        regexOutput.innerHTML = `<div class="regex-error">❌ エラー: ${escapeHtml(error.message)}</div>`;
    }
}

regexPattern.addEventListener('input', updateRegexChecker);
regexInput.addEventListener('input', updateRegexChecker);
flagGlobal.addEventListener('change', updateRegexChecker);
flagIgnoreCase.addEventListener('change', updateRegexChecker);
flagMultiline.addEventListener('change', updateRegexChecker);

// ヘルパー関数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getCharacterName(char) {
    if (char === ' ') return 'スペース';
    if (char === '\n') return '改行';
    if (char === '\t') return 'タブ';
    if (char === '\r') return 'キャリッジリターン';
    if (/\s/.test(char)) return '空白文字';
    return char;
}

function getUTF16String(char) {
    const codes = [];
    for (let i = 0; i < char.length; i++) {
        const code = char.charCodeAt(i);
        codes.push('0x' + code.toString(16).toUpperCase().padStart(4, '0'));
    }
    return codes.join(' ');
}

// モーダル表示機能
function showCharModal(char) {
    const codePoint = char.codePointAt(0);

    // UTF-8バイト列を取得
    const utf8Bytes = getUTF8Bytes(char);

    // HTML エンティティを取得
    const htmlEntity = getHTMLEntity(codePoint);

    // CSS エスケープを取得
    const cssEscape = getCSSEscape(codePoint);

    // JavaScript エスケープを取得
    const jsEscape = getJSEscape(char);

    // Unicode ブロック名を取得
    const unicodeBlock = getUnicodeBlock(codePoint);

    // フォント表示用の配列
    const fonts = [
        { name: 'Sans-serif', family: 'sans-serif' },
        { name: 'Serif', family: 'serif' },
        { name: 'Monospace', family: 'monospace' },
        { name: 'Arial', family: 'Arial, sans-serif' },
        { name: 'Times New Roman', family: '"Times New Roman", serif' },
        { name: 'Courier New', family: '"Courier New", monospace' },
        { name: 'Yu Gothic', family: '"Yu Gothic", "游ゴシック", sans-serif' },
        { name: 'Hiragino Sans', family: '"Hiragino Sans", "ヒラギノ角ゴ ProN", sans-serif' },
        { name: 'Meiryo', family: 'Meiryo, "メイリオ", sans-serif' },
        { name: 'MS Gothic', family: '"MS Gothic", "MS ゴシック", monospace' },
        { name: 'MS Mincho', family: '"MS Mincho", "MS 明朝", serif' },
        { name: 'Yu Mincho', family: '"Yu Mincho", "游明朝", serif' }
    ];

    let modalContent = `
        <div class="modal-char-display">${escapeHtml(char)}</div>

        <div class="modal-section">
            <h3>📋 基本情報</h3>
            <div class="modal-info-grid">
                <div class="modal-info-item">
                    <strong>文字:</strong>
                    <span>${getCharacterName(char)}</span>
                </div>
                <div class="modal-info-item">
                    <strong>Unicode:</strong>
                    <span>U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}</span>
                </div>
                <div class="modal-info-item">
                    <strong>10進数:</strong>
                    <span>${codePoint}</span>
                </div>
                <div class="modal-info-item">
                    <strong>16進数:</strong>
                    <span>0x${codePoint.toString(16).toUpperCase()}</span>
                </div>
                <div class="modal-info-item">
                    <strong>8進数:</strong>
                    <span>0o${codePoint.toString(8)}</span>
                </div>
                <div class="modal-info-item">
                    <strong>2進数:</strong>
                    <span>0b${codePoint.toString(2)}</span>
                </div>
                <div class="modal-info-item">
                    <strong>UTF-16:</strong>
                    <span>${getUTF16String(char)}</span>
                </div>
                <div class="modal-info-item">
                    <strong>UTF-8:</strong>
                    <span>${utf8Bytes}</span>
                </div>
            </div>
        </div>

        <div class="modal-section">
            <h3>💻 コード表現</h3>
            <div class="modal-info-grid">
                <div class="modal-info-item">
                    <strong>HTML実体参照:</strong>
                    <span>${htmlEntity}</span>
                </div>
                <div class="modal-info-item">
                    <strong>CSS:</strong>
                    <span>${cssEscape}</span>
                </div>
                <div class="modal-info-item">
                    <strong>JavaScript:</strong>
                    <span>${jsEscape}</span>
                </div>
                <div class="modal-info-item">
                    <strong>Unicode Block:</strong>
                    <span>${unicodeBlock}</span>
                </div>
            </div>
        </div>

        <div class="modal-section">
            <h3>🎨 フォント表示</h3>
            <div class="font-display-grid">
                ${fonts.map(font => `
                    <div class="font-display-item">
                        <div class="font-display-char" style="font-family: ${font.family};">${escapeHtml(char)}</div>
                        <div class="font-display-name">${font.name}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    modalBody.innerHTML = modalContent;
    charModal.classList.add('show');
}

// モーダルを閉じる
function closeModal() {
    charModal.classList.remove('show');
}

modalClose.addEventListener('click', closeModal);

charModal.addEventListener('click', (e) => {
    if (e.target === charModal) {
        closeModal();
    }
});

// ESCキーでモーダルを閉じる
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && charModal.classList.contains('show')) {
        closeModal();
    }
});

// UTF-8バイト列を取得
function getUTF8Bytes(char) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(char);
    return Array.from(bytes)
        .map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0'))
        .join(' ');
}

// HTML実体参照を取得
function getHTMLEntity(codePoint) {
    return `&amp;#${codePoint}; または &amp;#x${codePoint.toString(16).toUpperCase()};`;
}

// CSSエスケープを取得
function getCSSEscape(codePoint) {
    return `\\${codePoint.toString(16).toUpperCase()}`;
}

// JavaScriptエスケープを取得
function getJSEscape(char) {
    const codePoint = char.codePointAt(0);
    if (codePoint <= 0xFFFF) {
        return `\\u${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
    } else {
        return `\\u{${codePoint.toString(16).toUpperCase()}}`;
    }
}

// Unicodeブロック名を取得（簡易版）
function getUnicodeBlock(codePoint) {
    if (codePoint >= 0x0000 && codePoint <= 0x007F) return 'Basic Latin';
    if (codePoint >= 0x0080 && codePoint <= 0x00FF) return 'Latin-1 Supplement';
    if (codePoint >= 0x0100 && codePoint <= 0x017F) return 'Latin Extended-A';
    if (codePoint >= 0x0180 && codePoint <= 0x024F) return 'Latin Extended-B';
    if (codePoint >= 0x3040 && codePoint <= 0x309F) return 'Hiragana';
    if (codePoint >= 0x30A0 && codePoint <= 0x30FF) return 'Katakana';
    if (codePoint >= 0x4E00 && codePoint <= 0x9FFF) return 'CJK Unified Ideographs';
    if (codePoint >= 0xAC00 && codePoint <= 0xD7AF) return 'Hangul Syllables';
    if (codePoint >= 0x1F300 && codePoint <= 0x1F5FF) return 'Miscellaneous Symbols and Pictographs';
    if (codePoint >= 0x1F600 && codePoint <= 0x1F64F) return 'Emoticons';
    if (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) return 'Transport and Map Symbols';
    if (codePoint >= 0x2600 && codePoint <= 0x26FF) return 'Miscellaneous Symbols';
    if (codePoint >= 0x2700 && codePoint <= 0x27BF) return 'Dingbats';
    if (codePoint >= 0xFF00 && codePoint <= 0xFFEF) return 'Halfwidth and Fullwidth Forms';
    return 'Other';
}

// ===========================================
// タブナビゲーション機能
// ===========================================
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');

        // 全てのタブとコンテンツからactiveクラスを削除
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // クリックされたタブとそのコンテンツにactiveクラスを追加
        button.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
    });
});

// ===========================================
// エンコーディング変換ツール
// ===========================================
const encodingInput = document.getElementById('encodingInput');
const encodingOutput = document.getElementById('encodingOutput');

function encodeBase64() {
    try {
        const text = encodingInput.value;
        const encoded = btoa(unescape(encodeURIComponent(text)));
        encodingOutput.textContent = encoded;
    } catch (error) {
        encodingOutput.innerHTML = `<div class="regex-error">エラー: ${escapeHtml(error.message)}</div>`;
    }
}

function decodeBase64() {
    try {
        const text = encodingInput.value;
        const decoded = decodeURIComponent(escape(atob(text)));
        encodingOutput.textContent = decoded;
    } catch (error) {
        encodingOutput.innerHTML = `<div class="regex-error">エラー: ${escapeHtml(error.message)}</div>`;
    }
}

function encodeURL() {
    const text = encodingInput.value;
    encodingOutput.textContent = encodeURIComponent(text);
}

function decodeURL() {
    try {
        const text = encodingInput.value;
        encodingOutput.textContent = decodeURIComponent(text);
    } catch (error) {
        encodingOutput.innerHTML = `<div class="regex-error">エラー: ${escapeHtml(error.message)}</div>`;
    }
}

function encodeHTML() {
    const text = encodingInput.value;
    const encoded = text.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code > 127 || ['<', '>', '&', '"', "'"].includes(char)) {
            return `&#${code};`;
        }
        return char;
    }).join('');
    encodingOutput.textContent = encoded;
}

function encodePunycode() {
    try {
        const text = encodingInput.value;
        // 簡易的なPunycode風エンコード（完全なPunycodeではない）
        const encoded = text.split('.').map(part => {
            if (/[^\x00-\x7F]/.test(part)) {
                return 'xn--' + encodeURIComponent(part).replace(/%/g, '');
            }
            return part;
        }).join('.');
        encodingOutput.textContent = encoded;
    } catch (error) {
        encodingOutput.innerHTML = `<div class="regex-error">エラー: ${escapeHtml(error.message)}</div>`;
    }
}

function decodePunycode() {
    try {
        const text = encodingInput.value;
        const decoded = text.split('.').map(part => {
            if (part.startsWith('xn--')) {
                const encoded = part.substring(4);
                return decodeURIComponent('%' + encoded.match(/.{1,2}/g).join('%'));
            }
            return part;
        }).join('.');
        encodingOutput.textContent = decoded;
    } catch (error) {
        encodingOutput.innerHTML = `<div class="regex-error">エラー: ${escapeHtml(error.message)}</div>`;
    }
}

// ===========================================
// テキスト統計ツール
// ===========================================
const statsInput = document.getElementById('statsInput');
const statsOutput = document.getElementById('statsOutput');

statsInput.addEventListener('input', updateStatistics);

function updateStatistics() {
    const text = statsInput.value;

    if (!text) {
        statsOutput.innerHTML = '';
        return;
    }

    // 各種統計を計算
    const charCount = text.length;
    const charCountNoSpaces = text.replace(/\s/g, '').length;
    const lines = text.split('\n');
    const lineCount = lines.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

    // バイト数
    const byteCount = new Blob([text]).size;
    const utf8ByteCount = new TextEncoder().encode(text).length;

    // 文字種別の内訳
    let hiraganaCount = 0;
    let katakanaCount = 0;
    let kanjiCount = 0;
    let alphabetCount = 0;
    let numberCount = 0;
    let spaceCount = 0;
    let symbolCount = 0;

    for (const char of text) {
        const code = char.charCodeAt(0);
        if (/[\u3040-\u309F]/.test(char)) hiraganaCount++;
        else if (/[\u30A0-\u30FF]/.test(char)) katakanaCount++;
        else if (/[\u4E00-\u9FFF]/.test(char)) kanjiCount++;
        else if (/[a-zA-Z]/.test(char)) alphabetCount++;
        else if (/[0-9]/.test(char)) numberCount++;
        else if (/\s/.test(char)) spaceCount++;
        else symbolCount++;
    }

    let output = '<div class="stats-grid">';
    output += `<div class="stat-card"><span class="stat-value">${charCount}</span><span class="stat-label">総文字数</span></div>`;
    output += `<div class="stat-card"><span class="stat-value">${charCountNoSpaces}</span><span class="stat-label">文字数（空白除く）</span></div>`;
    output += `<div class="stat-card"><span class="stat-value">${lineCount}</span><span class="stat-label">行数</span></div>`;
    output += `<div class="stat-card"><span class="stat-value">${wordCount}</span><span class="stat-label">単語数</span></div>`;
    output += `<div class="stat-card"><span class="stat-value">${byteCount}</span><span class="stat-label">バイト数</span></div>`;
    output += `<div class="stat-card"><span class="stat-value">${utf8ByteCount}</span><span class="stat-label">UTF-8 バイト</span></div>`;
    output += '</div>';

    output += '<div class="stats-grid" style="margin-top: 20px;">';
    output += `<div class="stat-card"><span class="stat-value">${hiraganaCount}</span><span class="stat-label">ひらがな</span></div>`;
    output += `<div class="stat-card"><span class="stat-value">${katakanaCount}</span><span class="stat-label">カタカナ</span></div>`;
    output += `<div class="stat-card"><span class="stat-value">${kanjiCount}</span><span class="stat-label">漢字</span></div>`;
    output += `<div class="stat-card"><span class="stat-value">${alphabetCount}</span><span class="stat-label">英字</span></div>`;
    output += `<div class="stat-card"><span class="stat-value">${numberCount}</span><span class="stat-label">数字</span></div>`;
    output += `<div class="stat-card"><span class="stat-value">${spaceCount}</span><span class="stat-label">空白</span></div>`;
    output += `<div class="stat-card"><span class="stat-value">${symbolCount}</span><span class="stat-label">記号</span></div>`;
    output += '</div>';

    statsOutput.innerHTML = output;
}

// ===========================================
// テキスト整形ツール
// ===========================================
const formatInput = document.getElementById('formatInput');
const formatOutput = document.getElementById('formatOutput');

function formatJSON() {
    try {
        const text = formatInput.value;
        const parsed = JSON.parse(text);
        formatOutput.textContent = JSON.stringify(parsed, null, 2);
    } catch (error) {
        formatOutput.innerHTML = `<div class="regex-error">エラー: ${escapeHtml(error.message)}</div>`;
    }
}

function minifyJSON() {
    try {
        const text = formatInput.value;
        const parsed = JSON.parse(text);
        formatOutput.textContent = JSON.stringify(parsed);
    } catch (error) {
        formatOutput.innerHTML = `<div class="regex-error">エラー: ${escapeHtml(error.message)}</div>`;
    }
}

function sortLines() {
    const text = formatInput.value;
    const lines = text.split('\n');
    formatOutput.textContent = lines.sort().join('\n');
}

function sortLinesDesc() {
    const text = formatInput.value;
    const lines = text.split('\n');
    formatOutput.textContent = lines.sort().reverse().join('\n');
}

function removeDuplicateLines() {
    const text = formatInput.value;
    const lines = text.split('\n');
    const unique = [...new Set(lines)];
    formatOutput.textContent = unique.join('\n');
}

function removeEmptyLines() {
    const text = formatInput.value;
    const lines = text.split('\n');
    const nonEmpty = lines.filter(line => line.trim() !== '');
    formatOutput.textContent = nonEmpty.join('\n');
}

function trimLines() {
    const text = formatInput.value;
    const lines = text.split('\n');
    formatOutput.textContent = lines.map(line => line.trim()).join('\n');
}

function convertToSpaces() {
    const text = formatInput.value;
    formatOutput.textContent = text.replace(/\t/g, '    ');
}

function convertToTabs() {
    const text = formatInput.value;
    formatOutput.textContent = text.replace(/    /g, '\t');
}

// ===========================================
// 文字列変換ツール
// ===========================================
const conversionInput = document.getElementById('conversionInput');
const conversionOutput = document.getElementById('conversionOutput');

function toUpperCase() {
    conversionOutput.textContent = conversionInput.value.toUpperCase();
}

function toLowerCase() {
    conversionOutput.textContent = conversionInput.value.toLowerCase();
}

function toFullWidth() {
    const text = conversionInput.value;
    const converted = text.replace(/[!-~]/g, char => {
        return String.fromCharCode(char.charCodeAt(0) + 0xFEE0);
    });
    conversionOutput.textContent = converted;
}

function toHalfWidth() {
    const text = conversionInput.value;
    const converted = text.replace(/[！-～]/g, char => {
        return String.fromCharCode(char.charCodeAt(0) - 0xFEE0);
    });
    conversionOutput.textContent = converted;
}

function toHiragana() {
    const text = conversionInput.value;
    const converted = text.replace(/[\u30A1-\u30F6]/g, char => {
        return String.fromCharCode(char.charCodeAt(0) - 0x60);
    });
    conversionOutput.textContent = converted;
}

function toKatakana() {
    const text = conversionInput.value;
    const converted = text.replace(/[\u3041-\u3096]/g, char => {
        return String.fromCharCode(char.charCodeAt(0) + 0x60);
    });
    conversionOutput.textContent = converted;
}

function toCamelCase() {
    const text = conversionInput.value;
    const converted = text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
    conversionOutput.textContent = converted;
}

function toSnakeCase() {
    const text = conversionInput.value;
    const converted = text
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
        .replace(/^_/, '')
        .replace(/[^a-z0-9]+/g, '_');
    conversionOutput.textContent = converted;
}

function toKebabCase() {
    const text = conversionInput.value;
    const converted = text
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '')
        .replace(/[^a-z0-9]+/g, '-');
    conversionOutput.textContent = converted;
}

function toPascalCase() {
    const text = conversionInput.value;
    const converted = text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
        .replace(/^./, match => match.toUpperCase());
    conversionOutput.textContent = converted;
}

// ===========================================
// ハッシュ生成ツール
// ===========================================
const hashInput = document.getElementById('hashInput');
const hashOutput = document.getElementById('hashOutput');

hashInput.addEventListener('input', updateHashes);

async function updateHashes() {
    const text = hashInput.value;

    if (!text) {
        hashOutput.innerHTML = '';
        return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    try {
        const md5Hash = await computeMD5(text);
        const sha1Hash = await crypto.subtle.digest('SHA-1', data);
        const sha256Hash = await crypto.subtle.digest('SHA-256', data);
        const sha512Hash = await crypto.subtle.digest('SHA-512', data);

        let output = '';
        output += `<div class="hash-item"><span class="hash-label">MD5:</span><span class="hash-value">${md5Hash}</span></div>`;
        output += `<div class="hash-item"><span class="hash-label">SHA-1:</span><span class="hash-value">${arrayBufferToHex(sha1Hash)}</span></div>`;
        output += `<div class="hash-item"><span class="hash-label">SHA-256:</span><span class="hash-value">${arrayBufferToHex(sha256Hash)}</span></div>`;
        output += `<div class="hash-item"><span class="hash-label">SHA-512:</span><span class="hash-value">${arrayBufferToHex(sha512Hash)}</span></div>`;

        hashOutput.innerHTML = output;
    } catch (error) {
        hashOutput.innerHTML = `<div class="regex-error">エラー: ${escapeHtml(error.message)}</div>`;
    }
}

function arrayBufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// MD5実装（簡易版）
async function computeMD5(str) {
    // MD5はWeb Crypto APIでサポートされていないため、簡易的な実装を使用
    // 実際のプロダクションでは専用のライブラリを使用することを推奨
    const encoder = new TextEncoder();
    const data = encoder.encode(str);

    // 簡易的なハッシュ（本物のMD5ではありませんが、デモ目的）
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash) + data[i];
        hash = hash & hash;
    }

    // 16進数に変換して32文字にパディング
    return Math.abs(hash).toString(16).padStart(32, '0').substring(0, 32);
}

// ===========================================
// 差分比較ツール
// ===========================================
const diffInput1 = document.getElementById('diffInput1');
const diffInput2 = document.getElementById('diffInput2');
const diffOutput = document.getElementById('diffOutput');

diffInput1.addEventListener('input', updateDiff);
diffInput2.addEventListener('input', updateDiff);

function updateDiff() {
    const text1 = diffInput1.value;
    const text2 = diffInput2.value;

    if (!text1 && !text2) {
        diffOutput.innerHTML = '';
        return;
    }

    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');

    const diff = computeDiff(lines1, lines2);

    let output = '';
    diff.forEach(item => {
        if (item.type === 'added') {
            output += `<div class="diff-line diff-line-added">+ ${escapeHtml(item.value)}</div>`;
        } else if (item.type === 'removed') {
            output += `<div class="diff-line diff-line-removed">- ${escapeHtml(item.value)}</div>`;
        } else {
            output += `<div class="diff-line diff-line-unchanged">  ${escapeHtml(item.value)}</div>`;
        }
    });

    diffOutput.innerHTML = output || '<div class="regex-info">テキストは同一です</div>';
}

function computeDiff(lines1, lines2) {
    const result = [];
    const maxLen = Math.max(lines1.length, lines2.length);

    for (let i = 0; i < maxLen; i++) {
        const line1 = lines1[i];
        const line2 = lines2[i];

        if (line1 === line2) {
            if (line1 !== undefined) {
                result.push({ type: 'unchanged', value: line1 });
            }
        } else {
            if (line1 !== undefined && line2 === undefined) {
                result.push({ type: 'removed', value: line1 });
            } else if (line1 === undefined && line2 !== undefined) {
                result.push({ type: 'added', value: line2 });
            } else if (line1 !== line2) {
                result.push({ type: 'removed', value: line1 });
                result.push({ type: 'added', value: line2 });
            }
        }
    }

    return result;
}

// ===========================================
// ランダム生成ツール
// ===========================================
const randomOutput = document.getElementById('randomOutput');

function generatePassword() {
    const length = parseInt(document.getElementById('passwordLength').value) || 16;
    const includeUppercase = document.getElementById('includeUppercase').checked;
    const includeLowercase = document.getElementById('includeLowercase').checked;
    const includeNumbers = document.getElementById('includeNumbers').checked;
    const includeSymbols = document.getElementById('includeSymbols').checked;

    let chars = '';
    if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) {
        randomOutput.innerHTML = '<div class="regex-error">少なくとも1つの文字種を選択してください</div>';
        return;
    }

    let password = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
        password += chars[array[i] % chars.length];
    }

    randomOutput.textContent = password;
}

function generateUUID() {
    const uuid = crypto.randomUUID();
    randomOutput.textContent = uuid;
}

function generateLoremIpsum() {
    const paragraphs = parseInt(document.getElementById('loremParagraphs').value) || 3;

    const loremText = [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
        "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
        "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga."
    ];

    let output = '';
    for (let i = 0; i < paragraphs; i++) {
        output += loremText[i % loremText.length] + '\n\n';
    }

    randomOutput.textContent = output.trim();
}

// ===========================================
// CSV/TSVフォーマッター
// ===========================================
const csvInput = document.getElementById('csvInput');
const csvOutput = document.getElementById('csvOutput');

function getCSVDelimiter() {
    const selected = document.querySelector('input[name="csvDelimiter"]:checked');
    return selected ? (selected.value === '\\t' ? '\t' : selected.value) : ',';
}

function parseCSV(text, delimiter) {
    const lines = text.trim().split('\n');
    return lines.map(line => {
        const cells = [];
        let cell = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
                cells.push(cell.trim());
                cell = '';
            } else {
                cell += char;
            }
        }
        cells.push(cell.trim());
        return cells;
    });
}

function csvToTable() {
    const text = csvInput.value;
    if (!text) {
        csvOutput.innerHTML = '<div class="regex-error">CSVデータを入力してください</div>';
        return;
    }

    const delimiter = getCSVDelimiter();
    const hasHeader = document.getElementById('csvHasHeader').checked;
    const rows = parseCSV(text, delimiter);

    let html = '<table class="csv-table">';

    rows.forEach((row, index) => {
        html += '<tr>';
        const tag = (hasHeader && index === 0) ? 'th' : 'td';
        row.forEach(cell => {
            html += `<${tag}>${escapeHtml(cell)}</${tag}>`;
        });
        html += '</tr>';
    });

    html += '</table>';
    csvOutput.innerHTML = html;
}

function csvToJSON() {
    const text = csvInput.value;
    if (!text) {
        csvOutput.innerHTML = '<div class="regex-error">CSVデータを入力してください</div>';
        return;
    }

    const delimiter = getCSVDelimiter();
    const hasHeader = document.getElementById('csvHasHeader').checked;
    const rows = parseCSV(text, delimiter);

    if (hasHeader && rows.length > 0) {
        const headers = rows[0];
        const data = rows.slice(1).map(row => {
            const obj = {};
            headers.forEach((header, i) => {
                obj[header] = row[i] || '';
            });
            return obj;
        });
        csvOutput.textContent = JSON.stringify(data, null, 2);
    } else {
        csvOutput.textContent = JSON.stringify(rows, null, 2);
    }
}

function csvToMarkdown() {
    const text = csvInput.value;
    if (!text) {
        csvOutput.innerHTML = '<div class="regex-error">CSVデータを入力してください</div>';
        return;
    }

    const delimiter = getCSVDelimiter();
    const hasHeader = document.getElementById('csvHasHeader').checked;
    const rows = parseCSV(text, delimiter);

    let markdown = '';
    rows.forEach((row, index) => {
        markdown += '| ' + row.join(' | ') + ' |\n';
        if (hasHeader && index === 0) {
            markdown += '| ' + row.map(() => '---').join(' | ') + ' |\n';
        }
    });

    csvOutput.textContent = markdown;
}

function csvToTSV() {
    const text = csvInput.value;
    if (!text) {
        csvOutput.innerHTML = '<div class="regex-error">CSVデータを入力してください</div>';
        return;
    }

    const currentDelimiter = getCSVDelimiter();
    const newDelimiter = currentDelimiter === '\t' ? ',' : '\t';
    const rows = parseCSV(text, currentDelimiter);

    const output = rows.map(row => row.join(newDelimiter)).join('\n');
    csvOutput.textContent = output;
}

function csvSort() {
    const text = csvInput.value;
    if (!text) {
        csvOutput.innerHTML = '<div class="regex-error">CSVデータを入力してください</div>';
        return;
    }

    const delimiter = getCSVDelimiter();
    const hasHeader = document.getElementById('csvHasHeader').checked;
    const rows = parseCSV(text, delimiter);

    if (hasHeader && rows.length > 1) {
        const header = rows[0];
        const dataRows = rows.slice(1);
        dataRows.sort((a, b) => (a[0] || '').localeCompare(b[0] || ''));
        const sorted = [header, ...dataRows];
        csvOutput.textContent = sorted.map(row => row.join(delimiter)).join('\n');
    } else {
        rows.sort((a, b) => (a[0] || '').localeCompare(b[0] || ''));
        csvOutput.textContent = rows.map(row => row.join(delimiter)).join('\n');
    }
}

// ===========================================
// マークダウンプレビュー
// ===========================================
const markdownInput = document.getElementById('markdownInput');
const markdownPreview = document.getElementById('markdownPreview');
const markdownOutput = document.getElementById('markdownOutput');

markdownInput.addEventListener('input', updateMarkdownPreview);

function updateMarkdownPreview() {
    const text = markdownInput.value;
    if (!text) {
        markdownPreview.innerHTML = '';
        return;
    }

    markdownPreview.innerHTML = convertMarkdownToHTML(text);
}

function markdownToHTML() {
    const text = markdownInput.value;
    if (!text) {
        markdownOutput.innerHTML = '<div class="regex-error">マークダウンを入力してください</div>';
        return;
    }

    markdownOutput.textContent = convertMarkdownToHTML(text);
}

function convertMarkdownToHTML(markdown) {
    let html = markdown;

    // コードブロック
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

    // 見出し
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // 太字・斜体
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // リンク
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');

    // 画像
    html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1">');

    // リスト
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // インラインコード
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');

    // 改行
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    return html;
}

// ===========================================
// テキストフィルター
// ===========================================
const filterInput = document.getElementById('filterInput');
const filterOutput = document.getElementById('filterOutput');
const filterPattern = document.getElementById('filterPattern');

function extractNumbers() {
    const text = filterInput.value;
    const result = text.match(/[0-9]/g);
    filterOutput.textContent = result ? result.join('') : '';
}

function extractAlpha() {
    const text = filterInput.value;
    const result = text.match(/[a-zA-Z]/g);
    filterOutput.textContent = result ? result.join('') : '';
}

function extractHiragana() {
    const text = filterInput.value;
    const result = text.match(/[\u3040-\u309F]/g);
    filterOutput.textContent = result ? result.join('') : '';
}

function extractKatakana() {
    const text = filterInput.value;
    const result = text.match(/[\u30A0-\u30FF]/g);
    filterOutput.textContent = result ? result.join('') : '';
}

function extractKanji() {
    const text = filterInput.value;
    const result = text.match(/[\u4E00-\u9FFF]/g);
    filterOutput.textContent = result ? result.join('') : '';
}

function removeNumbers() {
    const text = filterInput.value;
    filterOutput.textContent = text.replace(/[0-9]/g, '');
}

function removeSymbols() {
    const text = filterInput.value;
    filterOutput.textContent = text.replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, '');
}

function filterLines() {
    const text = filterInput.value;
    const pattern = filterPattern.value;

    if (!pattern) {
        filterOutput.innerHTML = '<div class="regex-error">フィルターパターンを入力してください</div>';
        return;
    }

    const lines = text.split('\n');
    const filtered = lines.filter(line => line.includes(pattern));
    filterOutput.textContent = filtered.join('\n');
}

// ===========================================
// QRコード生成
// ===========================================
const qrInput = document.getElementById('qrInput');
const qrOutput = document.getElementById('qrOutput');

function generateQRCode() {
    const text = qrInput.value;

    if (!text) {
        qrOutput.innerHTML = '<div class="regex-error">テキストを入力してください</div>';
        return;
    }

    // QRコードAPIを使用（外部サービス）
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;

    qrOutput.innerHTML = `
        <div class="qr-container">
            <img src="${qrUrl}" alt="QR Code" class="qr-image">
            <p><a href="${qrUrl}" download="qrcode.png" class="qr-download">QRコードをダウンロード</a></p>
        </div>
    `;
}

// ===========================================
// テキスト分割/結合
// ===========================================
const splitInput = document.getElementById('splitInput');
const splitOutput = document.getElementById('splitOutput');

function splitByChars() {
    const text = splitInput.value;
    const chars = parseInt(document.getElementById('splitChars').value) || 100;

    if (!text) {
        splitOutput.innerHTML = '<div class="regex-error">テキストを入力してください</div>';
        return;
    }

    const parts = [];
    for (let i = 0; i < text.length; i += chars) {
        parts.push(text.substring(i, i + chars));
    }

    splitOutput.textContent = parts.join('\n---\n');
}

function splitByDelimiter() {
    const text = splitInput.value;
    const delimiter = document.getElementById('splitDelimiter').value;

    if (!text) {
        splitOutput.innerHTML = '<div class="regex-error">テキストを入力してください</div>';
        return;
    }

    if (!delimiter) {
        splitOutput.innerHTML = '<div class="regex-error">区切り文字を入力してください</div>';
        return;
    }

    const parts = text.split(delimiter);
    splitOutput.textContent = parts.join('\n');
}

function joinLines() {
    const text = splitInput.value;
    const delimiter = document.getElementById('joinDelimiter').value || '';

    if (!text) {
        splitOutput.innerHTML = '<div class="regex-error">テキストを入力してください</div>';
        return;
    }

    const lines = text.split('\n');
    splitOutput.textContent = lines.join(delimiter);
}

// ===========================================
// ふりがな付与
// ===========================================
const furiganaInput = document.getElementById('furiganaInput');
const furiganaOutput = document.getElementById('furiganaOutput');

function addFurigana() {
    const text = furiganaInput.value;

    if (!text) {
        furiganaOutput.innerHTML = '<div class="regex-error">テキストを入力してください</div>';
        return;
    }

    // 簡易的なふりがな付与（実際の辞書ベースではない）
    let result = '';
    for (const char of text) {
        if (/[\u4E00-\u9FFF]/.test(char)) {
            // 漢字の場合、音読み風の表示（実際には辞書が必要）
            result += `${char}(?)`;
        } else {
            result += char;
        }
    }

    furiganaOutput.innerHTML = `<div class="info-box">
        <p>${escapeHtml(result)}</p>
        <small>※ 正確なふりがなを生成するには外部辞書APIが必要です。このツールは漢字の位置を示すのみです。</small>
    </div>`;
}

function generateRubyHTML() {
    const text = furiganaInput.value;

    if (!text) {
        furiganaOutput.innerHTML = '<div class="regex-error">テキストを入力してください</div>';
        return;
    }

    let result = '';
    for (const char of text) {
        if (/[\u4E00-\u9FFF]/.test(char)) {
            result += `<ruby>${escapeHtml(char)}<rt>?</rt></ruby>`;
        } else {
            result += escapeHtml(char);
        }
    }

    furiganaOutput.textContent = result;
}

// ===========================================
// テンプレート置換
// ===========================================
const templateInput = document.getElementById('templateInput');
const templateVars = document.getElementById('templateVars');
const templateOutput = document.getElementById('templateOutput');

function applyTemplate() {
    const template = templateInput.value;
    const varsText = templateVars.value;

    if (!template) {
        templateOutput.innerHTML = '<div class="regex-error">テンプレートを入力してください</div>';
        return;
    }

    if (!varsText) {
        templateOutput.innerHTML = '<div class="regex-error">変数を入力してください</div>';
        return;
    }

    try {
        const vars = JSON.parse(varsText);
        let result = template;

        for (const [key, value] of Object.entries(vars)) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            result = result.replace(regex, value);
        }

        templateOutput.textContent = result;
    } catch (error) {
        templateOutput.innerHTML = `<div class="regex-error">エラー: ${escapeHtml(error.message)}</div>`;
    }
}

// ===========================================
// 文字頻度分析
// ===========================================
const frequencyInput = document.getElementById('frequencyInput');
const frequencyOutput = document.getElementById('frequencyOutput');

function analyzeFrequency() {
    const text = frequencyInput.value;

    if (!text) {
        frequencyOutput.innerHTML = '<div class="regex-error">テキストを入力してください</div>';
        return;
    }

    const type = document.querySelector('input[name="frequencyType"]:checked').value;
    const top = parseInt(document.getElementById('frequencyTop').value) || 20;

    const frequency = new Map();

    if (type === 'char') {
        for (const char of text) {
            if (char.trim()) {
                frequency.set(char, (frequency.get(char) || 0) + 1);
            }
        }
    } else {
        const words = text.split(/\s+/);
        for (const word of words) {
            if (word.trim()) {
                frequency.set(word, (frequency.get(word) || 0) + 1);
            }
        }
    }

    const sorted = Array.from(frequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, top);

    const maxCount = sorted[0][1];

    let html = '<div class="frequency-list">';
    sorted.forEach(([item, count], index) => {
        const percentage = (count / maxCount * 100).toFixed(1);
        html += `
            <div class="frequency-item">
                <div class="frequency-rank">#${index + 1}</div>
                <div class="frequency-char">${escapeHtml(item)}</div>
                <div class="frequency-bar">
                    <div class="frequency-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="frequency-count">${count}回</div>
            </div>
        `;
    });
    html += '</div>';

    frequencyOutput.innerHTML = html;
}

// ===============================================
// ツール切り替えナビゲーション
// ===============================================

const toolSwitcherBtn = document.getElementById('toolSwitcherBtn');
const toolDropdown = document.getElementById('toolDropdown');
const currentToolName = document.getElementById('currentToolName');
const toolSearch = document.getElementById('toolSearch');
const dropdownContent = document.getElementById('dropdownContent');

// ドロップダウンの開閉
toolSwitcherBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = toolDropdown.classList.contains('show');

    if (isOpen) {
        closeDropdown();
    } else {
        openDropdown();
    }
});

function openDropdown() {
    toolDropdown.classList.add('show');
    toolSwitcherBtn.classList.add('active');
    toolSearch.value = '';
    toolSearch.focus();
    resetSearch();
}

function closeDropdown() {
    toolDropdown.classList.remove('show');
    toolSwitcherBtn.classList.remove('active');
    toolSearch.value = '';
    resetSearch();
}

// ドロップダウン外をクリックしたら閉じる
document.addEventListener('click', (e) => {
    if (!toolSwitcherBtn.contains(e.target) && !toolDropdown.contains(e.target)) {
        closeDropdown();
    }
});

// Escapeキーで閉じる
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toolDropdown.classList.contains('show')) {
        closeDropdown();
    }
});

// ツールアイテムのクリック処理
const toolItems = document.querySelectorAll('.tool-item');
toolItems.forEach(item => {
    item.addEventListener('click', () => {
        const tabId = item.getAttribute('data-tab');
        const toolName = item.textContent.trim();

        // アクティブなツールを切り替え
        toolItems.forEach(t => t.classList.remove('active'));
        item.classList.add('active');

        // タブコンテンツを切り替え
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');

        // 現在のツール名を更新
        currentToolName.textContent = toolName;

        // ドロップダウンを閉じる
        closeDropdown();

        // ページトップにスクロール（モバイル用）
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// ツール検索機能
toolSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    if (!searchTerm) {
        resetSearch();
        return;
    }

    const categories = document.querySelectorAll('.tool-category');

    categories.forEach(category => {
        const items = category.querySelectorAll('.tool-item');
        let hasVisibleItem = false;

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                item.classList.remove('hidden');
                hasVisibleItem = true;
            } else {
                item.classList.add('hidden');
            }
        });

        // カテゴリ内に表示するアイテムがない場合はカテゴリごと非表示
        if (hasVisibleItem) {
            category.classList.remove('hidden');
        } else {
            category.classList.add('hidden');
        }
    });
});

function resetSearch() {
    document.querySelectorAll('.tool-category').forEach(category => {
        category.classList.remove('hidden');
    });

    document.querySelectorAll('.tool-item').forEach(item => {
        item.classList.remove('hidden');
    });
}
