const books = [];

let keyword = '';
let editId = null;
let editData = null;

const SAVE_EVENT = 'save-book';
const LOAD_EVENT = 'load-books';
const TOGGLE_HEADER_FORM = 'toggle-header';

const STORAGE_KEY = 'BOOKSHELVES';

const generateId = () => {
  return +new Date();
};

const createBookObject = (id, title, author, year, isCompleted) => {
  return {
    id,
    title,
    author,
    year,
    isCompleted
  };
};

const isStorageExist = () => {
  if (typeof Storage === undefined) {
    alert("Sorry, your browser isn't compatible to access our app!");
    return false;
  }

  return true;
};

const findBook = (id) => {
  for (const book of books) {
    if (book.id === id) {
      return book;
    }
  }

  return null;
};

const findBookIndex = (id) => {
  for (const index in books) {
    if (books[index].id === id) {
      return index;
    }
  }

  return -1;
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#book-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const title = formData.get('title');
    const author = formData.get('author');
    const year = formData.get('year');
    const isCompleted = formData.get('is_finished') ? true : false;

    if (editId !== null) {
      updateBook(title, author, year, isCompleted);
    } else {
      addNewBook(title, author, year, isCompleted);
    }
  });

  if (isStorageExist()) {
    loadAllDataFromStorage();
  }
});

const loadAllDataFromStorage = () => {
  const objData = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (objData !== null) {
    books.push(...objData);
  }

  document.dispatchEvent(new Event(LOAD_EVENT));
};

const resetForm = () => {
  keyword = '';
  editId = null;

  document.querySelector('#search-input').value = '';
  document.querySelector('#book-form').reset();

  document.dispatchEvent(new Event(TOGGLE_HEADER_FORM));
};

const saveBooks = () => {
  if (isStorageExist()) {
    const objStringify = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, objStringify);
  }
};

const deleteBook = (id) => {
  if (!confirm('Proceed to delete the book?')) {
    return;
  }

  const bookTarget = findBookIndex(id);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);

  setTimeout(() => {
    document.dispatchEvent(new Event(LOAD_EVENT));
    saveBooks();
  }, 300);

  alert('Book deleted!');
};

const addNewBook = (title, author, year, isCompleted) => {
  const id = generateId();

  const objBook = createBookObject(id, title, author, year, isCompleted);
  books.push(objBook);

  resetForm();

  setTimeout(() => {
    document.dispatchEvent(new Event(LOAD_EVENT));
    saveBooks();
  }, 300);

  alert('New Book Added!');
};

const updateBook = (title, author, year, isCompleted) => {
  const id = editId;
  const bookTarget = findBook(id);

  bookTarget.title = title;
  bookTarget.author = author;
  bookTarget.year = year;
  bookTarget.isCompleted = isCompleted;

  resetForm();

  setTimeout(() => {
    document.dispatchEvent(new Event(LOAD_EVENT));
    saveBooks();
  }, 300);

  alert('Book updated!');
};

const toggleComplete = (id) => {
  const bookTarget = findBook(id);

  if (bookTarget === null) return;

  bookTarget.isCompleted = !bookTarget.isCompleted;

  resetForm();

  setTimeout(() => {
    document.dispatchEvent(new Event(LOAD_EVENT));
    saveBooks();
  }, 300);
};

const editBook = (id) => {
  editId = id;

  const book = findBook(id);

  const form = document.querySelector('#book-form');
  form.querySelector('[name="title"]').value = book.title;
  form.querySelector('[name="author"]').value = book.author;
  form.querySelector('[name="year"]').value = book.year;
  form.querySelector('[name="is_finished"]').checked = book.isCompleted;

  document.dispatchEvent(new Event(TOGGLE_HEADER_FORM));
};

const makeBook = (objBook) => {
  const { id, title, author, year, isCompleted } = objBook;

  const listItem = document.createElement('li');
  listItem.classList.add('book-item');

  listItem.innerHTML = `
        <div class="book-info">
            <h3>${title}</h3>
            <p>${author} &bullet; ${year} </p>
        </div>
        <div class="book-action">
            <span class="checkbox" title="${
              isCompleted ? 'Re-reading' : 'Mark as finished'
            }">
                <input type="checkbox" ${
                  isCompleted ? 'checked' : ''
                } onChange="toggleComplete(${id})">
            </span>
            <div class="dropdown">
                <button class="btn-sm btn-outline-primary dropdown-btn">
                    Action
                </button>
                <ul class="dropdown-list">
                    <li>
                        <button onclick="editBook(${id})">Edit</button>
                    </li>
                    <li>
                        <button onclick="deleteBook(${id})">Delete</button>
                    </li>
                </ul>
            </div>
        </div>
    `;

  return listItem;
};

document.getElementById('search-input').addEventListener('input', (e) => {
  keyword = e.target.value.toLowerCase();

  document.dispatchEvent(new Event(LOAD_EVENT));
});

document.addEventListener(TOGGLE_HEADER_FORM, () => {
  const formHeader = document.getElementById('form-header-text');
  const buttonForm = document
    .getElementById('book-form')
    .querySelector('[type="submit"]');
  if (editId !== null) {
    formHeader.innerText = 'Edit Book';
    buttonForm.innerText = 'Update book';
  } else {
    formHeader.innerText = 'Add new book';
    buttonForm.innerText = 'Save book';
  }
});

document.addEventListener(LOAD_EVENT, () => {
  const continueReadingList = document.getElementById('continue-reading-list');
  const finishedReadingList = document.getElementById('finished-reading-list');

  continueReadingList.innerHTML = '';
  finishedReadingList.innerHTML = '';

  let counterContinue = 0;
  let counterFinish = 0;

  const data = books.filter((book) => {
    return book.title.toLowerCase().search(keyword) > -1;
  });

  for (const bookItem of data) {
    const bookEl = makeBook(bookItem);

    if (bookItem.isCompleted) {
      finishedReadingList.append(bookEl);
      ++counterFinish;
    } else {
      continueReadingList.append(bookEl);
      ++counterContinue;
    }
  }

  if (counterContinue === 0) {
    continueReadingList.innerHTML = keyword
      ? `<li>No book found</li>`
      : `<li>Currently, no book is read.</li>`;
  }

  if (counterFinish === 0) {
    finishedReadingList.innerHTML = keyword
      ? `<li>No book found</li>`
      : `<li>Currently, no book is finished.</li>`;
  }
});
