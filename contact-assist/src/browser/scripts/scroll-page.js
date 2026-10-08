// 読み取り専用スクリプト: 遅延読み込みされる内容を出すためにページを下までスクロールする。
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const total = Math.min(document.documentElement.scrollHeight, 30000);
  let y = 0;
  while (y < total) {
    window.scrollTo(0, y);
    y += Math.max(400, window.innerHeight * 0.8);
    await sleep(80);
  }
  window.scrollTo(0, 0);
  return total;
})()
