// Online lookups: Sefaria (Hebrew lexicons), dictionaryapi.dev (English),
// Wiktionary (English etymology), MyMemory (sentence translation).
// All results cached in-memory.

const _cache = new Map();

function stripHtml(html) {
  const d = document.createElement('div');
  d.innerHTML = html || '';
  return (d.textContent || '').replace(/\s+/g, ' ').trim();
}

function detectLang(text) {
  const he = (text.match(/[֐-׿]/g) || []).length;
  const en = (text.match(/[A-Za-z]/g) || []).length;
  return he >= en ? (he === 0 ? 'en' : 'he') : 'en';
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

function cached(key, fn) {
  if (_cache.has(key)) return Promise.resolve(_cache.get(key));
  return fn().then(v => { _cache.set(key, v); return v; })
             .catch(err => { console.warn(key, err); return null; });
}

// ---------- Sefaria: Hebrew lexicons (Klein, BDB, BDB Strong, Jastrow) ----------
function flattenSenses(senses, out, depth) {
  (senses || []).forEach(s => {
    if (s.definition) out.push(stripHtml(s.definition));
    if (s.senses) flattenSenses(s.senses, out, depth + 1);
  });
  return out;
}

async function sefariaLookup(word) {
  const bare = stripNikud(word);
  return cached('sef:' + bare, async () => {
    let data = await fetchJson('https://www.sefaria.org/api/words/' + encodeURIComponent(word))
      .catch(() => null);
    if (!data || !data.length) {
      data = await fetchJson('https://www.sefaria.org/api/words/' + encodeURIComponent(bare));
    }
    if (!Array.isArray(data) || !data.length) return null;

    const result = { klein: null, strong: null, bdb: null, jastrow: null };
    for (const e of data) {
      const lex = e.parent_lexicon;
      const defs = flattenSenses(e.content && e.content.senses, [], 0).filter(Boolean);
      if (lex === 'Klein Dictionary' && !result.klein) {
        result.klein = {
          headword: e.headword,
          morphology: e.content && e.content.morphology,
          defs: defs.slice(0, 8),
          etymology: stripHtml(e.notes || ''),
          derivatives: stripHtml(e.derivatives || '')
        };
      } else if (lex === 'BDB Augmented Strong' && !result.strong) {
        result.strong = {
          headword: e.headword,
          morphology: e.content && e.content.morphology,
          defs: defs.slice(0, 8),
          translit: e.transliteration,
          pron: e.pronunciation,
          strongNumber: e.strong_number
        };
      } else if (lex === 'BDB Dictionary' && !result.bdb) {
        result.bdb = { headword: e.headword, defs: defs.slice(0, 6), occurrences: e.occurrences };
      } else if (lex === 'Jastrow Dictionary' && !result.jastrow) {
        result.jastrow = {
          headword: e.headword,
          morphology: e.content && e.content.morphology,
          defs: defs.slice(0, 4).map(d => d.length > 220 ? d.slice(0, 220) + '…' : d)
        };
      }
    }
    return (result.klein || result.strong || result.bdb || result.jastrow) ? result : null;
  });
}

// ---------- dictionaryapi.dev: English definitions ----------
async function englishLookup(word) {
  const w = word.toLowerCase();
  return cached('en:' + w, async () => {
    const data = await fetchJson('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(w));
    if (!Array.isArray(data) || !data.length) return null;
    const phonetic = data[0].phonetic ||
      ((data[0].phonetics || []).find(p => p.text) || {}).text || '';
    const meanings = [];
    data.forEach(entry => (entry.meanings || []).forEach(m => {
      meanings.push({
        pos: m.partOfSpeech,
        defs: (m.definitions || []).slice(0, 4).map(d => ({ def: d.definition, example: d.example })),
        synonyms: (m.synonyms || []).slice(0, 6)
      });
    }));
    return { word: data[0].word, phonetic, meanings: meanings.slice(0, 5) };
  });
}

// ---------- Wiktionary: English etymology ----------
async function wiktionaryEtymology(word) {
  const w = word.toLowerCase();
  return cached('wety:' + w, async () => {
    const base = 'https://en.wiktionary.org/w/api.php?format=json&origin=*&action=parse&page=' + encodeURIComponent(w);
    const secData = await fetchJson(base + '&prop=sections');
    const sections = (secData.parse && secData.parse.sections) || [];
    const ety = sections.find(s => /^Etymology/.test(s.line));
    if (!ety) return null;
    const txtData = await fetchJson(base + '&prop=text&section=' + ety.index);
    const html = txtData.parse && txtData.parse.text && txtData.parse.text['*'];
    if (!html) return null;
    let text = stripHtml(html).replace(/^Etymology(\s*\d+)?(\s*\[edit\])?\s*/i, '');
    text = text.replace(/\[\d+\]/g, '').trim();
    if (text.length > 700) text = text.slice(0, 700) + '…';
    return text || null;
  });
}

// ---------- MyMemory: sentence translation ----------
async function translateText(text, from, to) {
  const clipped = text.trim().slice(0, 480);
  return cached('tr:' + from + to + ':' + clipped, async () => {
    const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(clipped) +
      '&langpair=' + from + '|' + to;
    const data = await fetchJson(url);
    const t = data && data.responseData && data.responseData.translatedText;
    if (!t || /QUERY LENGTH LIMIT|INVALID/i.test(t)) return null;
    return stripHtml(t);
  });
}

// ---------- Quick lookup used by the hover tooltip ----------
async function quickLookup(word, lang) {
  const b = builtinLookup(word, lang);
  if (b) {
    return {
      word: b.he || word, translit: b.translit, pos: b.pos,
      defs: b.meaning.slice(0, 3), source: 'Built-in dictionary', lang
    };
  }
  if (lang === 'he') {
    const s = await sefariaLookup(word);
    if (!s) return null;
    const first = s.klein || s.strong || s.bdb || s.jastrow;
    const src = s.klein ? 'Klein Dictionary (Sefaria)' :
                s.strong ? 'BDB / Strong (Sefaria)' :
                s.bdb ? 'BDB (Sefaria)' : 'Jastrow (Sefaria)';
    return {
      word: first.headword || word,
      translit: (s.strong && s.strong.translit) || '',
      pos: first.morphology || '',
      defs: (first.defs || []).slice(0, 3),
      source: src, lang
    };
  }
  const e = await englishLookup(word);
  if (!e) return null;
  const m = e.meanings[0];
  return {
    word: e.word, translit: e.phonetic, pos: m ? m.pos : '',
    defs: m ? m.defs.slice(0, 3).map(d => d.def) : [],
    source: 'Free Dictionary API', lang
  };
}
