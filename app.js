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
