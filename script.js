// Инициализация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBRseocpR2cQpBIERspynlwxD9ezrb9ODs",
    authDomain: "ds-times-c9894.firebaseapp.com",
    projectId: "ds-times-c9894",
    storageBucket: "ds-times-c9894.firebasestorage.app",
    messagingSenderId: "1060212009626",
    appId: "1:1060212009626:web:1eee1200c67962b9260d23",
    measurementId: "G-FV1DTL5TRW"
  };


firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Регистрация
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('register-message');

    auth.createUserWithEmailAndPassword(email, password)
      .then(() => {
        message.textContent = 'Регистрация успешна! Перенаправляем...';
        setTimeout(() => window.location.href = 'dstimes.html', 2000);
      })
      .catch((error) => {
        message.textContent = `Ошибка: ${error.message}`;
      });
  });
}

// Вход
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('login-message');

    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        message.textContent = 'Вход успешен! Перенаправляем...';
        setTimeout(() => window.location.href = 'dstimes.html', 2000);
      })
      .catch((error) => {
        message.textContent = `Ошибка: ${error.message}`;
      });
  });
}

// Управление тёмной темой
function initializeTheme() {
  // Загрузка сохранённой темы
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.checked = true;
    }
  }

  // Обработчик переключателя темы
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('change', () => {
      document.body.classList.toggle('dark-theme');
      if (document.body.classList.contains('dark-theme')) {
        localStorage.setItem('theme', 'dark');
      } else {
        localStorage.setItem('theme', 'light');
      }
    });
  } else {
    console.warn('Переключатель темы (#theme-toggle) не найден на странице');
  }
}

// Запуск инициализации темы после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
});
