// 文字コード表示機能
const charInput = document.getElementById('charInput');
const charCodeOutput = document.getElementById('charCodeOutput');

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

        output += `
            <div class="char-item">
                <div class="char-display">${escapeHtml(char)}</div>
                <div class="char-codes">
                    <div><strong>文字:</strong> ${getCharacterName(char)}</div>
                    <div><strong>Unicode:</strong> U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}</div>
                    <div><strong>10進数:</strong> ${codePoint}</div>
                    <div><strong>16進数:</strong> 0x${codePoint.toString(16).toUpperCase()}</div>
                    <div><strong>8進数:</strong> 0o${codePoint.toString(8)}</div>
                    <div><strong>2進数:</strong> 0b${codePoint.toString(2)}</div>
                    <div><strong>UTF-16:</strong> ${getUTF16String(char)}</div>
                </div>
            </div>
        `;
    }

    charCodeOutput.innerHTML = output;
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

        output += `<div style="margin-bottom: 10px; padding: 10px; background-color: white; border-radius: 6px; border: 1px solid #ddd;">${highlightedText}</div>`;

        // マッチ詳細リスト
        output += '<div class="match-list"><strong>マッチの詳細:</strong>';
        matches.forEach((m, i) => {
            let groupsInfo = '';
            if (m.groups.length > 0) {
                groupsInfo = '<br><small>グループ: ' + m.groups.map((g, idx) => `$${idx + 1}="${escapeHtml(g || '')}"`).join(', ') + '</small>';
            }
            output += `
                <div class="match-item">
                    <strong>#${i + 1}:</strong> "${escapeHtml(m.text)}"
                    <small>(位置: ${m.index}〜${m.index + m.text.length - 1})</small>
                    ${groupsInfo}
                </div>
            `;
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
    return `"${char}"`;
}

function getUTF16String(char) {
    const codes = [];
    for (let i = 0; i < char.length; i++) {
        const code = char.charCodeAt(i);
        codes.push('0x' + code.toString(16).toUpperCase().padStart(4, '0'));
    }
    return codes.join(' ');
}
