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

});