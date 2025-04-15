// Управление тёмной темой (работает независимо от Firebase)
function applyTheme() {
  const savedTheme = localStorage.getItem('theme');
  const themeToggle = document.getElementById('theme-toggle');
  let isDarkTheme;

  // Если есть сохранённая тема, используем её
  if (savedTheme) {
    isDarkTheme = savedTheme === 'dark';
  } else {
    // Иначе используем системную тему
    isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // Применяем тему
  if (isDarkTheme) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }

  // Синхронизируем переключатель (только на settings.html)
  if (themeToggle) {
    themeToggle.checked = isDarkTheme;
  }
}

function toggleTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('change', () => {
      const isDarkTheme = themeToggle.checked;
      if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
      }
    });
  }
}

// Реагируем на изменение системной темы
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    applyTheme();
  }
});

// Инициализация Firebase
let auth;
try {
  if (typeof firebase !== 'undefined') {
    const firebaseConfig = {
      apiKey: "AIzaSyBRse0CPR2c0PbiTIERspynL09DEzrb90Ds",
      authDomain: "ds-times-c9894.firebaseapp.com",
      projectId: "ds-times-c9894",
      storageBucket: "ds-times-c9894.firestore.app",
      messagingSenderId: "1060212009626",
      appId: "1:1060212009626:web:1eee1200c7962b92060d23",
      measurementId: "G-FV1DTL5TRW"
    };

    // Инициализация приложения Firebase
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();

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
  } else {
    console.warn('Firebase SDK не подключён на этой странице');
  }
} catch (error) {
  console.error('Ошибка при инициализации Firebase:', error);
}

// Инициализация темы при загрузке
document.addEventListener('DOMContentLoaded', () => {
  try {
    applyTheme();
    toggleTheme();
  } catch (error) {
    console.error('Ошибка при инициализации темы:', error);
  }
});
