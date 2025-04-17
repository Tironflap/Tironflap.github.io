// Управление тёмной темой (работает независимо от Firebase)
function applyTheme() {
  const savedTheme = localStorage.getItem('theme');
  const themeToggle = document.getElementById('theme-toggle');
  let isDarkTheme;

  console.log('Applying theme... Saved theme:', savedTheme);

  // Если есть сохранённая тема, используем её
  if (savedTheme) {
    isDarkTheme = savedTheme === 'dark';
  } else {
    // Иначе используем системную тему
    isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  console.log('Is dark theme:', isDarkTheme);

  // Применяем тему
  if (isDarkTheme) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }

  // Синхронизируем переключатель (только на settings.html)
  if (themeToggle) {
    themeToggle.checked = isDarkTheme;
    console.log('Theme toggle state set to:', themeToggle.checked);
  }
}

function toggleTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    console.log('Adding change event listener to theme toggle...');
    // Удаляем старый обработчик, чтобы избежать дублирования
    themeToggle.removeEventListener('change', handleThemeChange);
    themeToggle.addEventListener('change', handleThemeChange);
  } else {
    console.warn('Theme toggle element not found');
  }
}

function handleThemeChange() {
  const themeToggle = document.getElementById('theme-toggle');
  const isDarkTheme = themeToggle.checked;
  console.log('Theme toggle changed. Is dark theme:', isDarkTheme);
  if (isDarkTheme) {
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
  }
  console.log('Theme applied. Body class list:', document.body.classList);
}

// Реагируем на изменение системной темы
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    console.log('System theme changed. Applying new theme...');
    applyTheme();
  }
});

// Инициализация Firebase
let auth;
try {
  if (typeof firebase !== 'undefined') {
    const firebaseConfig = {
      apiKey: "AIzaSyC1vAXe25SBaDYejz5XKUL4tfNRmPM9h9g", // Замени на правильный ключ
      authDomain: "ds-times-c9894.firebaseapp.com",
      projectId: "ds-times-c9894",
      storageBucket: "ds-times-c9894.appspot.com",
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
        const nickname = document.getElementById('nickname').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const message = document.getElementById('register-message');

        // Проверка длины ника
        if (nickname.length < 3) {
          message.textContent = 'Ошибка: Ник/Имя должен содержать минимум 3 символа.';
          return;
        }

        auth.createUserWithEmailAndPassword(email, password)
          .then((userCredential) => {
            // После успешной регистрации обновляем профиль пользователя
            const user = userCredential.user;
            return user.updateProfile({
              displayName: nickname
            });
          })
          .then(() => {
            message.textContent = 'Регистрация успешна! Перенаправляем...';
            setTimeout(() => window.location.href = 'dstimes.html', 2000);
          })
          .catch((error) => {
            // Обработка ошибок при регистрации
            switch (error.code) {
              case 'auth/invalid-email':
                message.textContent = 'Ошибка: Неверный формат email.';
                break;
              case 'auth/email-already-in-use':
                message.textContent = 'Ошибка: Этот email уже зарегистрирован.';
                break;
              case 'auth/weak-password':
                message.textContent = 'Ошибка: Пароль слишком слабый (минимум 6 символов).';
                break;
              default:
                message.textContent = `Ошибка: ${error.message}`;
            }
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
            // Обработка ошибок при входе
            switch (error.code) {
              case 'auth/invalid-email':
                message.textContent = 'Ошибка: Неверный формат email.';
                break;
              case 'auth/user-not-found':
                message.textContent = 'Ошибка: Пользователь с таким email не найден.';
                break;
              case 'auth/wrong-password':
                message.textContent = 'Ошибка: Неверный пароль.';
                break;
              case 'auth/invalid-credential':
                message.textContent = 'Ошибка: Неверный email или пароль.';
                break;
              case 'auth/too-many-requests':
                message.textContent = 'Ошибка: Слишком много попыток. Попробуйте позже.';
                break;
              default:
                message.textContent = `Ошибка: ${error.message}`;
            }
          });
      });
    }

    // Сброс пароля
    const forgotPasswordLink = document.getElementById('forgot-password');
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const message = document.getElementById('login-message');

        if (!email) {
          message.textContent = 'Ошибка: Введите email для сброса пароля.';
          return;
        }

        auth.sendPasswordResetEmail(email)
          .then(() => {
            message.textContent = 'Письмо для сброса пароля отправлено! Проверьте ваш email.';
            message.style.color = '#28a745'; // Зелёный цвет для успешного сообщения
          })
          .catch((error) => {
            // Обработка ошибок при сбросе пароля
            switch (error.code) {
              case 'auth/invalid-email':
                message.textContent = 'Ошибка: Неверный формат email.';
                break;
              case 'auth/user-not-found':
                message.textContent = 'Ошибка: Пользователь с таким email не найден.';
                break;
              case 'auth/too-many-requests':
                message.textContent = 'Ошибка: Слишком много попыток. Попробуйте позже.';
                break;
              default:
                message.textContent = `Ошибка: ${error.message}`;
            }
            message.style.color = '#ff0000'; // Красный цвет для ошибки
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
    console.log('DOM fully loaded. Initializing theme...');
    applyTheme();
    toggleTheme();
  } catch (error) {
    console.error('Ошибка при инициализации темы:', error);
  }
});
