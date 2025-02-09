// 更新 theme-color meta 标签
function updateThemeColor (isDark) {
  const themeColorMeta = document.querySelectorAll('meta[name="theme-color"]');
  if (themeColorMeta.length) {
    themeColorMeta.forEach(meta => {
      meta.content = isDark ? '#242424' : '#f7f7f7';
    })
  }
}

// 提前检测主题
var isDark = localStorage.getItem('theme-mode') ? (localStorage.getItem('theme-mode') == 'dark') : matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.setAttribute(
  'theme-mode',
  isDark ? 'dark' : 'light'
);
if (isDark) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}
updateThemeColor(isDark);