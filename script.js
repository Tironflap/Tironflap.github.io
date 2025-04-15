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

// Инициализация приложения
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
        setTimeout(() => window.location.href = 'index.html', 2000);
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
        setTimeout(() => window.location.href = 'index.html', 2000);
      })
      .catch((error) => {
        message.textContent = `Ошибка: ${error.message}`;
      });
  });
}