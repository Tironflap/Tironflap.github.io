// Управление тёмной темой (работает независимо от Firebase)
function applyTheme() {
  const savedTheme = localStorage.getItem('theme');
  const themeToggle = document.getElementById('theme-toggle');
  let isDarkTheme;

  console.log('Applying theme... Saved theme:', savedTheme);

  if (savedTheme) {
    isDarkTheme = savedTheme === 'dark';
  } else {
    isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  console.log('Is dark theme:', isDarkTheme);

  if (isDarkTheme) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }

  if (themeToggle) {
    themeToggle.checked = isDarkTheme;
    console.log('Theme toggle state set to:', themeToggle.checked);
  }
}

function toggleTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    console.log('Adding change event listener to theme toggle...');
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

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    console.log('System theme changed. Applying new theme...');
    applyTheme();
  }
});

// Инициализация Firebase
let auth;
let db;
try {
  if (typeof firebase !== 'undefined') {
    console.log('Firebase SDK подключён, инициализируем...');
    const firebaseConfig = {
      apiKey: "AIzaSyC1vAXe25SBaDYejz5XKUL4tfNRmPM9h9g",
      authDomain: "ds-times-c9894.firebaseapp.com",
      projectId: "ds-times-c9894",
      storageBucket: "ds-times-c9894.appspot.com",
      messagingSenderId: "1060212009626",
      appId: "1:1060212009626:web:1eee1200c7962b92060d23",
      measurementId: "G-FV1DTL5TRW"
    };

    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    console.log('Firebase успешно инициализирован');
  } else {
    console.error('Firebase SDK не подключён на этой странице');
    const message = document.getElementById('register-message') || document.getElementById('login-message');
    if (message) {
      message.textContent = 'Ошибка: Firebase SDK не подключён.';
    }
  }
} catch (error) {
  console.error('Ошибка при инициализации Firebase:', error);
  const message = document.getElementById('register-message') || document.getElementById('login-message');
  if (message) {
    message.textContent = 'Ошибка инициализации Firebase: ' + error.message;
  }
}

// Регистрация
const registerForm = document.getElementById('register-form');
if (registerForm) {
  console.log('Форма регистрации найдена, добавляем обработчик...');
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nickname = document.getElementById('nickname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('register-message');

    console.log('Попытка регистрации:', { nickname, email, password });

    if (nickname.length < 3) {
      console.log('Ник слишком короткий:', nickname);
      message.textContent = 'Ошибка: Ник/Имя должен содержать минимум 3 символа.';
      return;
    }

    if (!auth) {
      console.error('Auth не инициализирован');
      message.textContent = 'Ошибка: Firebase Auth не инициализирован.';
      return;
    }

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log('Пользователь успешно создан:', userCredential.user.uid);
        const user = userCredential.user;
        return Promise.all([
          user.updateProfile({ displayName: nickname })
            .then(() => console.log('Профиль обновлён, displayName:', nickname))
            .catch((error) => {
              console.error('Ошибка обновления профиля:', error);
              throw error;
            }),
          db.collection('users').doc(user.uid).set({
            nickname: nickname,
            email: email,
            role: 'user',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          })
            .then(() => console.log('Данные пользователя сохранены в Firestore'))
            .catch((error) => {
              console.error('Ошибка сохранения данных в Firestore:', error);
              throw error;
            })
        ]);
      })
      .then(() => {
        console.log('Регистрация полностью успешна, перенаправляем...');
        message.textContent = 'Регистрация успешна! Перенаправляем...';
        setTimeout(() => {
          console.log('Перенаправление на dstimes.html');
          window.location.href = 'dstimes.html';
        }, 2000);
      })
      .catch((error) => {
        console.error('Ошибка при регистрации:', error);
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
          case 'auth/operation-not-allowed':
            message.textContent = 'Ошибка: Регистрация по email/паролю отключена в Firebase.';
            break;
          default:
            message.textContent = `Ошибка: ${error.message}`;
        }
      });
  });
} else {
  console.log('Форма регистрации не найдена на этой странице');
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
        message.style.color = '#28a745';
      })
      .catch((error) => {
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
        message.style.color = '#ff0000';
      });
  });
}

// Проверка авторизации и роли пользователя
let isAdmin = false;
auth.onAuthStateChanged((user) => {
  if (user) {
    const userGreeting = document.getElementById('user-greeting');
    if (userGreeting) {
      userGreeting.textContent = `Привет, ${user.displayName || 'Пользователь'}!`;
    }

    db.collection('users').doc(user.uid).get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          isAdmin = userData.role === 'admin';
          const postFormContainer = document.getElementById('post-form-container');
          if (isAdmin && postFormContainer) {
            postFormContainer.style.display = 'block';
          }
          loadPosts();
        }
      })
      .catch((error) => {
        console.error('Ошибка при получении роли пользователя:', error);
      });
  } else {
    if (window.location.pathname.includes('dstimes.html')) {
      window.location.href = 'login.html';
    }
  }
});

// Выход из аккаунта
const logoutLink = document.getElementById('logout');
if (logoutLink) {
  logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
      window.location.href = 'login.html';
    });
  });
}

// Добавление поста
const postForm = document.getElementById('post-form');
if (postForm) {
  postForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const message = document.getElementById('post-message');

    const user = auth.currentUser;
    if (!user) {
      message.textContent = 'Ошибка: Вы должны быть авторизованы.';
      return;
    }

    if (!isAdmin) {
      message.textContent = 'Ошибка: Только администраторы могут добавлять посты.';
      message.style.color = '#ff0000';
      return;
    }

    db.collection('posts').add({
      title: title,
      content: content,
      author: user.displayName || 'Аноним',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
      .then(() => {
        message.textContent = 'Пост успешно добавлен!';
        message.style.color = '#28a745';
        postForm.reset();
        loadPosts();
      })
      .catch((error) => {
        message.textContent = `Ошибка: ${error.message}`;
        message.style.color = '#ff0000';
      });
  });
}

// Редактирование поста
const editPostForm = document.getElementById('edit-post-form');
if (editPostForm) {
  editPostForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const postId = document.getElementById('edit-post-id').value;
    const title = document.getElementById('edit-post-title').value;
    const content = document.getElementById('edit-post-content').value;
    const message = document.getElementById('edit-post-message');

    if (!isAdmin) {
      message.textContent = 'Ошибка: Только администраторы могут редактировать посты.';
      message.style.color = '#ff0000';
      return;
    }

    db.collection('posts').doc(postId).update({
      title: title,
      content: content,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
      .then(() => {
        message.textContent = 'Пост успешно обновлён!';
        message.style.color = '#28a745';
        document.getElementById('edit-post-form-container').style.display = 'none';
        document.getElementById('post-form-container').style.display = 'block';
      })
      .catch((error) => {
        message.textContent = `Ошибка: ${error.message}`;
        message.style.color = '#ff0000';
      });
  });
}

// Отмена редактирования
const cancelEditButton = document.getElementById('cancel-edit');
if (cancelEditButton) {
  cancelEditButton.addEventListener('click', () => {
    document.getElementById('edit-post-form-container').style.display = 'none';
    document.getElementById('post-form-container').style.display = 'block';
    document.getElementById('edit-post-message').textContent = '';
  });
}

// Функция для загрузки и отображения постов
function loadPosts() {
  const postsList = document.getElementById('posts-list');
  if (!postsList) return;

  db.collection('posts')
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      postsList.innerHTML = '';
      snapshot.forEach((doc) => {
        const post = doc.data();
        const postId = doc.id;
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
          <h4>${post.title}</h4>
          <p>${post.content}</p>
          <p><small>Автор: ${post.author} | Дата: ${post.createdAt ? post.createdAt.toDate().toLocaleString() : 'Неизвестно'}</small></p>
          ${isAdmin ? `
            <div class="post-actions">
              <button class="edit-post" data-id="${postId}">Редактировать</button>
              <button class="delete-post" data-id="${postId}">Удалить</button>
            </div>
          ` : ''}
        `;
        postsList.appendChild(postElement);

        if (isAdmin) {
          const editButton = postElement.querySelector('.edit-post');
          const deleteButton = postElement.querySelector('.delete-post');

          editButton.addEventListener('click', () => {
            document.getElementById('edit-post-id').value = postId;
            document.getElementById('edit-post-title').value = post.title;
            document.getElementById('edit-post-content').value = post.content;
            document.getElementById('edit-post-form-container').style.display = 'block';
            document.getElementById('post-form-container').style.display = 'none';
          });

          deleteButton.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите удалить этот пост?')) {
              db.collection('posts').doc(postId).delete()
                .then(() => {
                  console.log('Пост удалён');
                })
                .catch((error) => {
                  console.error('Ошибка при удалении поста:', error);
                });
            }
          });
        }
      });
    }, (error) => {
      console.error('Ошибка при загрузке постов:', error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('DOM fully loaded. Initializing theme...');
    applyTheme();
    toggleTheme();
  } catch (error) {
    console.error('Ошибка при инициализации темы:', error);
  }
});
