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
let storage;
try {
  if (typeof firebase !== 'undefined') {
    console.log('Firebase SDK подключён, инициализируем...');
    const firebaseConfig = {
      apiKey: "AIzaSyBRseocpR2cQpBIERspynlwxD9ezrb9ODs",
      authDomain: "ds-times-c9894.firebaseapp.com",
      projectId: "ds-times-c9894",
      storageBucket: "ds-times-c9894.appspot.com",
      messagingSenderId: "1060212009626",
      appId: "1:1060212009626:web:1eee1200c7962b92060d23",
      measurementId: "G-FV1DTL5TRW"
    };

    firebase.initializeApp(firebaseConfig);
    console.log('Firebase App инициализирован');

    auth = firebase.auth();
    console.log('Firebase Auth инициализирован');

    if (typeof firebase.firestore === 'function') {
      db = firebase.firestore();
      console.log('Firebase Firestore успешно инициализирован');
    } else {
      console.error('Firestore не доступен: firebase.firestore не является функцией');
      const message = document.getElementById('register-message') || document.getElementById('login-message');
      if (message) {
        message.textContent = 'Ошибка: Firestore не доступен. Проверьте подключение firebase-firestore.js.';
      }
      throw new Error('Firestore not available');
    }

    if (typeof firebase.storage === 'function') {
      storage = firebase.storage();
      console.log('Firebase Storage успешно инициализирован');
    } else {
      console.warn('Firebase Storage не доступен. Функция загрузки изображений отключена.');
      storage = null;
    }
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

// Функция для показа модального окна
function showModal(message, isSuccess = true) {
  const modal = document.getElementById('modal');
  if (!modal) {
    console.warn('Модальное окно не найдено, отображаем сообщение в элементе message');
    const messageElement = document.getElementById('post-message') || document.getElementById('edit-post-message') || document.getElementById('register-message') || document.getElementById('login-message');
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.style.color = isSuccess ? '#28a745' : '#ff0000';
    }
    return;
  }

  const modalMessage = document.getElementById('modal-message');
  modalMessage.textContent = message;
  modalMessage.style.color = isSuccess ? '#28a745' : '#ff0000';
  modal.style.display = 'block';

  const closeModal = document.querySelector('.close-modal');
  closeModal.onclick = () => {
    modal.style.display = 'none';
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
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

    if (!db) {
      console.error('Firestore не инициализирован');
      message.textContent = 'Ошибка: Firestore не инициализирован.';
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

    if (db) {
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
      console.error('Firestore не инициализирован, пропускаем загрузку роли пользователя');
    }
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
    const imageFile = document.getElementById('post-image') ? document.getElementById('post-image').files[0] : null;
    const message = document.getElementById('post-message');

    const user = auth.currentUser;
    if (!user) {
      showModal('Ошибка: Вы должны быть авторизованы.', false);
      return;
    }

    if (!isAdmin) {
      showModal('Ошибка: Только администраторы могут добавлять посты.', false);
      return;
    }

    if (!db) {
      showModal('Ошибка: Firestore не инициализирован.', false);
      return;
    }

    const postData = {
      title: title,
      content: content,
      author: user.displayName || 'Аноним',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      imageUrl: null
    };

    if (storage && imageFile) {
      const storageRef = storage.ref(`posts/${Date.now()}_${imageFile.name}`);
      storageRef.put(imageFile)
        .then((snapshot) => {
          return snapshot.ref.getDownloadURL();
        })
        .then((downloadURL) => {
          postData.imageUrl = downloadURL;
          return db.collection('posts').add(postData);
        })
        .then(() => {
          showModal('Пост успешно добавлен!');
          postForm.reset();
          loadPosts();
        })
        .catch((error) => {
          showModal(`Ошибка: ${error.message}`, false);
        });
    } else {
      if (imageFile) {
        showModal('Ошибка: Firebase Storage недоступен, изображение не загружено.', false);
      }
      db.collection('posts').add(postData)
        .then(() => {
          showModal('Пост успешно добавлен!');
          postForm.reset();
          loadPosts();
        })
        .catch((error) => {
          showModal(`Ошибка: ${error.message}`, false);
        });
    }
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
      showModal('Ошибка: Только администраторы могут редактировать посты.', false);
      return;
    }

    if (!db) {
      showModal('Ошибка: Firestore не инициализирован.', false);
      return;
    }

    db.collection('posts').doc(postId).update({
      title: title,
      content: content,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
      .then(() => {
        showModal('Пост успешно обновлён!');
        document.getElementById('edit-post-form-container').style.display = 'none';
        document.getElementById('post-form-container').style.display = 'block';
      })
      .catch((error) => {
        showModal(`Ошибка: ${error.message}`, false);
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

  if (!db) {
    console.error('Firestore не инициализирован, пропускаем загрузку постов');
    return;
  }

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
          <h4>${post.title || 'Без заголовка'}</h4>
          <p>${post.content || 'Без содержания'}</p>
          ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image">` : ''}
          <p><small>Автор: ${post.author || 'Аноним'} | Дата: ${post.createdAt && post.createdAt.toDate ? post.createdAt.toDate().toLocaleString() : 'Неизвестно'}</small></p>
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
            document.getElementById('edit-post-title').value = post.title || '';
            document.getElementById('edit-post-content').value = post.content || '';
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
