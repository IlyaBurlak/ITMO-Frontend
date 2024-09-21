document.addEventListener('DOMContentLoaded', () => {
    const btnDarkMode = document.querySelector(".dark-mode-btn");

    // Проверка темной темы в системных настройках
    if (btnDarkMode) {
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            btnDarkMode.classList.add("dark-mode-btn--active");
            document.body.classList.add("dark");
        }

        if (localStorage.getItem('darkMode') === 'dark') {
            btnDarkMode.classList.add("dark-mode-btn--active");
            document.body.classList.add("dark");
        } else if (localStorage.getItem("darkMode") === "light") {
            btnDarkMode.classList.remove("dark-mode-btn--active");
            document.body.classList.remove("dark");
        }

        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
            const newColorScheme = event.matches ? "dark" : "light";
            if (newColorScheme === "dark") {
                btnDarkMode.classList.add("dark-mode-btn--active");
                document.body.classList.add("dark");
                localStorage.setItem("darkMode", "dark");
            } else {
                btnDarkMode.classList.remove("dark-mode-btn--active");
                document.body.classList.remove("dark");
                localStorage.setItem("darkMode", "light");
            }
        });

        btnDarkMode.onclick = function () {
            btnDarkMode.classList.toggle("dark-mode-btn--active");
            const isDark = document.body.classList.toggle("dark");
            localStorage.setItem("darkMode", isDark ? "dark" : "light");
        };
    }

    // Время загрузки страницы
    window.addEventListener('load', () => {
        let loadTime = performance.now();
        const footer = document.getElementById('load-time');
        if (footer) {
            footer.innerHTML = 'Время загрузки страницы: ' + loadTime.toFixed(2) + ' миллисекунд';
        }
    });


    // Загрузка CV
    const downloadButtonCV = document.getElementById('CV-btn');
    if (downloadButtonCV) {
        downloadButtonCV.addEventListener('click', (event) => {
            const link = document.createElement("a");
            link.href = './info/CV.docx';
            link.download = 'IlyaBurlakCV.docx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    /* Очистка LocalStorage*/

    const clearLocalStorageButton = document.getElementById('clear-local-storage-btn');
    clearLocalStorageButton.addEventListener('click', () => {
        localStorage.clear();
        alert('Local storage очищен!');
    });

    /*----------------------------------Добавление новых коментриев через форму---------------------------------------*/

    const commentForm = document.getElementById('comment-form');
    const submitButton = document.querySelector('button[type="submit"]');

    // Очистка комментариев
    const clearCommentsButton = document.getElementById('clear-comments-btn');
    if (clearCommentsButton) {
        clearCommentsButton.addEventListener('click', () => {
            localStorage.removeItem('comments');
            const commentsContainer = document.querySelector('.comments-container');
            commentsContainer.innerHTML = '';
        });
    }

    // Проверка существующих комментариев и отображение их на странице
    const storedComments = JSON.parse(localStorage.getItem('comments'));
    if (storedComments) {
        storedComments.forEach((comment, index) => {
            const newComment = createCommentElement(comment.name, comment.surname, comment.telegram, comment.commentText, index);
            const commentsContainer = document.querySelector('.comments-container');
            commentsContainer.appendChild(newComment);
        });
    }

    // Обработчик отправки формы для комментариев
    if (commentForm && submitButton) {
        submitButton.addEventListener('click', (event) => {
            event.preventDefault();
            const name = document.getElementById('nameC').value;
            const surname = document.getElementById('surname').value;
            const telegram = document.getElementById('telegram').value;
            const commentText = document.getElementById('comment').value;

            const newComment = createCommentElement(name, surname, telegram, commentText);

            const comments = JSON.parse(localStorage.getItem('comments')) || [];
            comments.push({ name, surname, telegram, commentText });
            localStorage.setItem('comments', JSON.stringify(comments));

            const commentsContainer = document.querySelector('.comments-container');
            commentsContainer.appendChild(newComment);

            commentForm.reset();
        });
    }

    // Функция для создания элемента комментария
    function createCommentElement(name, surname, telegram, commentText, index) {
        const commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');
        const nameHeader = document.createElement('h3');
        nameHeader.textContent = `${name} ${surname}`;
        commentDiv.appendChild(nameHeader);
        commentDiv.dataset.index = index;

        if (telegram) {
            const telegramLink = document.createElement('a');
            telegramLink.href = `https://t.me/${telegram}`;
            telegramLink.textContent = `@${telegram}`;
            telegramLink.target = '_blank';
            const telegramParagraph = document.createElement('p');
            telegramParagraph.textContent = 'Telegram: ';
            telegramParagraph.appendChild(telegramLink);
            commentDiv.appendChild(telegramParagraph);
        }
        const commentParagraph = document.createElement('p');
        commentParagraph.textContent = commentText;
        commentDiv.appendChild(commentParagraph);

        // Кнопка удаления комментария
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('comment__delete-btn');
        deleteButton.textContent = 'Удалить';
        commentDiv.appendChild(deleteButton);

        deleteButton.addEventListener('click', () => {
            commentDiv.remove();
            const storedComments = JSON.parse(localStorage.getItem('comments'));
            if (storedComments) {
                const updatedComments = storedComments.filter((_, i) => i !== parseInt(commentDiv.dataset.index));
                localStorage.setItem('comments', JSON.stringify(updatedComments));

                const commentsContainer = document.querySelector('.comments-container');
                commentsContainer.innerHTML = '';
                updatedComments.forEach((comment, index) => {
                    const newComment = createCommentElement(comment.name, comment.surname, comment.telegram, comment.commentText, index);
                    commentsContainer.appendChild(newComment);
                });
            }
        });


        return commentDiv;
    }


    /*----------------------------------Загрузка новых коментриев через JSON---------------------------------------*/

    const loadButton = document.getElementById('load-button');
    const commentsContainer = document.querySelector('.comments-container');
    const preloader = document.createElement('div');
    let lastId = 0;

    // Создание прелоадера
    function createPreloader() {
        preloader.classList.add('preloader');
        preloader.classList.add('preloader-animation');
        commentsContainer.appendChild(preloader);
    }

    function removePreloader() {
        if (preloader.parentElement) {
            preloader.remove();
        }
    }

    // Создание элемента комментария
    function createLoadCommentElement(name, surname, email, body) {
        const commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');

        const nameHeader = document.createElement('h3');
        nameHeader.textContent = `${name} ${surname}`;
        commentDiv.appendChild(nameHeader);

        // Создание ссылки для email
        const emailLink = document.createElement('a');
        emailLink.href = `mailto:${email}`;
        emailLink.textContent = email;
        emailLink.target = '_blank';
        const emailParagraph = document.createElement('p');
        emailParagraph.textContent = 'Email: ';
        emailParagraph.appendChild(emailLink);
        commentDiv.appendChild(emailParagraph);

        const commentParagraph = document.createElement('p');
        commentParagraph.textContent = body;
        commentDiv.appendChild(commentParagraph);

        // Кнопка удаления комментария
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('comment__delete-btn');
        deleteButton.textContent = 'Удалить';
        commentDiv.appendChild(deleteButton);

        // Обработчик события для удаления комментария
        deleteButton.addEventListener('click', () => {
            commentDiv.remove();
            const storedComments = JSON.parse(localStorage.getItem('comments'));
            if (storedComments) {
                const index = storedComments.findIndex(c => c.commentText === body && c.email === email);
                if (index !== -1) {
                    storedComments.splice(index, 1);
                    localStorage.setItem('comments', JSON.stringify(storedComments));
                }
            }
        });

        return commentDiv;
    }

    // Функция загрузки комментариев
    function fetchComments(id) {
        createPreloader();
        fetch(`https://jsonplaceholder.typicode.com/comments?id_gte=${id}&_limit=3`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                removePreloader();
                const storedComments = JSON.parse(localStorage.getItem('comments')) || [];

                data.forEach(comment => {
                    if (comment.email) {
                        const existingComment = storedComments.find(c => c.commentText === comment.body && c.email === comment.email);
                        if (!existingComment) {
                            const name = 'Load';
                            const surname = 'Comment';

                            storedComments.push({
                                name: name,
                                surname: surname,
                                email: comment.email,
                                commentText: comment.body
                            });
                            const commentElement = createLoadCommentElement(name, surname, comment.email, comment.body);
                            commentsContainer.appendChild(commentElement);
                        }
                    }
                });

                localStorage.setItem('comments', JSON.stringify(storedComments));
            })
            .catch(error => {
                removePreloader();
                showToast('⚠ Что-то пошло не так', 'error');
                console.error('Error fetching comments:', error);
            });
    }


    // Обработчик события для загрузки комментариев
    loadButton.addEventListener('click', () => {
        lastId = lastId === 0 ? 1 : 100;
        fetchComments(lastId);
    });



    function showToast(message, type = 'error') {
        const toast = document.createElement('div');
        toast.className = `
        ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
        text-white p-4 rounded-lg shadow-lg opacity-90 transition duration-300
    `;
        toast.innerText = message;

        document.getElementById('toast-container').appendChild(toast);

        setTimeout(() => {
            toast.classList.add('opacity-0');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

});