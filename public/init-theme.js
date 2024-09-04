// 提前检测主题
var isDark = localStorage.getItem('theme-mode') ? localStorage.getItem('theme-mode') == 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.setAttribute(
  'theme-mode',
  isDark ? 'dark' : 'light'
);
if (isDark) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}