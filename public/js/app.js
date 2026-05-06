// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('hidden');
    });
  }
});
