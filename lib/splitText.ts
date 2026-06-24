/**
 * Quebra texto em palavras (inline-block, nowrap) e cada palavra em chars
 * (<span class="char-reveal">). Espaços viram text-nodes regulares pra layout
 * respeitar quebras de palavra.
 *
 * Usado pelo efeito de char-reveal (acende letra a letra com flash verde)
 * nos Pilares e nas frases de respiro.
 */
export function splitWordsAndChars(el: HTMLElement) {
  const text = el.textContent ?? "";
  el.textContent = "";

  const parts = text.split(/(\s+)/);
  for (const part of parts) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      el.appendChild(document.createTextNode(part));
      continue;
    }
    const wordSpan = document.createElement("span");
    wordSpan.style.display = "inline-block";
    wordSpan.style.whiteSpace = "nowrap";
    for (const ch of part) {
      const s = document.createElement("span");
      s.className = "char-reveal";
      s.textContent = ch;
      wordSpan.appendChild(s);
    }
    el.appendChild(wordSpan);
  }
}
