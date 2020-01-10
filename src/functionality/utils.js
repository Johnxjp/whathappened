function _preprocess(sentence, company, ticker) {
  const re = new RegExp(`${company}('s)?|[\\[\\(]?${ticker}[\\)\\]]?`, "g");
  sentence = sentence.replace(re, "");
  sentence = sentence.replace(/^\W+|\.+$/g, "");
  sentence = sentence.replace(/\s+/g, " ");
  return sentence.trim().toLowerCase();
}

export default function preprocess(items, company, ticker) {
  return items.map(item => _preprocess(item.data.heading, company, ticker));
}
