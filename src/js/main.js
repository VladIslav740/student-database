{
  const SERVER_URL = "http://localhost:3000";

  let studentsList = [];
  let studentsCopy;

  const $filterForm = document.getElementById("filter-form");
  const fullName = document.getElementById("name-filter"),
    faculty = document.getElementById("faculty-filter"),
    startYear = document.getElementById("start-year-filter"),
    endYear = document.getElementById("end-year-filter");

  const allInputs = document.querySelectorAll(".form-control");

  const $th = document.querySelectorAll(".students__header-cell");
  const $tbody = document.querySelector(".students__list");

  const today = new Date();

  let sortDirection = false;
  let lastColumn;

  // Функция добавления студента в БД
  async function serverAddStudent(studentObj) {
    const response = await fetch(SERVER_URL + "/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentObj),
    });

    const data = await response.json();

    return data;
  }

  // Функция полученя студентов из БД
  async function serverGetStudents() {
    const response = await fetch(SERVER_URL + "/api/students", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    return data;
  }

  // Функция удаления студента
  async function serverDeleteStudents(id) {
    const response = await fetch(SERVER_URL + "/api/students/" + id, {
      method: "DELETE",
    });

    const data = await response.json();

    return data;
  }

  let serverData = await serverGetStudents();

  if (serverData) {
    studentsList = serverData;
  }

  function getStudentItem(studentObj) {
    const $tr = document.createElement("tr"),
      $tdFullName = document.createElement("td"),
      $tdFaculty = document.createElement("td"),
      $tdBirthday = document.createElement("td"),
      $tdStudyYears = document.createElement("td"),
      $tdDelete = document.createElement("td"),
      $btnDelete = document.createElement("button");

    $btnDelete.classList.add("btn", "btn-danger", "w-100");
    $btnDelete.textContent = "Удалить";

    $tdFullName.textContent = getFullName(studentObj);
    $tdFaculty.textContent = studentObj.faculty;
    $tdBirthday.textContent = `${getBirthDateString(studentObj)} (${getAge(
      studentObj
    )} лет)`;
    $tdStudyYears.textContent = getStudyPeriod(studentObj);

    $btnDelete.addEventListener("click", async () => {
      await serverDeleteStudents(studentObj.id);
      $tr.remove();
    });

    $tdDelete.append($btnDelete);
    $tr.append($tdFullName, $tdFaculty, $tdBirthday, $tdStudyYears, $tdDelete);

    return $tr;
  }

  function renderStudentsTable(studentsArray) {
    $tbody.innerHTML = "";

    studentsCopy = [...studentsArray];

    if (fullName.value !== "")
      studentsCopy = getFilterStudents(studentsCopy, "name", fullName.value);

    if (faculty.value !== "")
      studentsCopy = getFilterStudents(studentsCopy, "faculty", faculty.value);

    if (startYear.value !== "")
      studentsCopy = getFilterStudents(
        studentsCopy,
        "studyStart",
        startYear.value
      );

    if (endYear.value !== "")
      studentsCopy = getFilterStudents(
        studentsCopy,
        "studyStart",
        endYear.value - 4
      );

    for (let student of studentsCopy) {
      $tbody.append(getStudentItem(student));
    }
  }

  document
    .getElementById("add-student")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      if (validation(this)) {
        let newStudentObj = {
          name: document.getElementById("input-name").value,
          surname: document.getElementById("input-surname").value,
          lastname: document.getElementById("input-lastname").value,
          birthday: new Date(document.getElementById("input-birthday").value),
          studyStart: Number(document.getElementById("input-studyStart").value),
          faculty: document.getElementById("input-faculty").value,
        };

        let serverDataObj = await serverAddStudent(newStudentObj);

        serverDataObj.birthday = new Date(serverDataObj.birthday);

        studentsList.push(serverDataObj);

        $tbody.append(getStudentItem(serverDataObj));

        studentsCopy = [...studentsList];

        for (let element of allInputs) {
          element.value = "";
        }
      }
    });

  // Получаем ФИО
  function getFullName(student) {
    return student.surname + " " + student.name + " " + student.lastname;
  }

  // Получаем годы обучения и курс
  function getStudyPeriod(student) {
    student.studyStart = Number(student.studyStart);

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    let course =
      currentMonth >= 8
        ? currentYear - student.studyStart + 1
        : currentYear - student.studyStart;

    if (course > 4) {
      course = "Закончил";
    } else {
      course += " курс";
    }

    return `${student.studyStart}-${student.studyStart + 4} (${course})`;
  }

  // Получаем корректную форму записи даты
  function getBirthDateString(student) {
    student.birthday = new Date(student.birthday);

    const year = student.birthday.getFullYear();
    let month = student.birthday.getMonth() + 1;
    let dayOfMonth = student.birthday.getDate();

    month = month < 10 ? "0" + month : month;
    dayOfMonth = dayOfMonth < 10 ? "0" + dayOfMonth : dayOfMonth;

    return `${dayOfMonth}.${month}.${year}`;
  }

  // Получаем возраст
  function getAge(student) {
    student.birthday = new Date(student.birthday);

    let age = today.getFullYear() - student.birthday.getFullYear();
    let month = today.getMonth() - student.birthday.getMonth();

    if (
      month < 0 ||
      (month === 0 && today.getDate() < student.birthday.getDate())
    ) {
      age--;
    }

    return age;
  }

  // Валидация формы
  function validation(form) {
    function removeError(input) {
      const parent = input.parentNode;

      if (parent.classList.contains("error")) {
        parent.querySelector(".error-label").remove();
        parent.classList.remove("error");
      }
    }

    function createError(input, text) {
      const parent = input.parentNode;
      const errorLabel = document.createElement("div");

      errorLabel.classList.add("error-label");
      errorLabel.textContent = text;

      parent.classList.add("error");
      parent.append(errorLabel);
    }

    let result = true;

    form.querySelectorAll("input").forEach((input) => {
      removeError(input);

      if (input.dataset.dateLimit) {
        const today = new Date();
        const minDate = new Date(1900, 0, 1);

        if (new Date(input.value) < minDate || new Date(input.value) > today) {
          removeError(input);
          createError(
            input,
            "Дата рождения находится в диапазоне от 01.01.1900 до текущей даты"
          );
          result = false;
        }
      }

      if (input.dataset.ageLimit) {
        const today = new Date();

        if (input.value < 2000 || input.value > today.getFullYear()) {
          removeError(input);
          createError(
            input,
            "Год поступления не может быть меньше 2000 и больше текущего года"
          );
          result = false;
        }
      }

      if (input.dataset.required == "true") {
        if (input.value.trim() == "") {
          removeError(input);
          createError(input, "Поле не заполнено!");
          result = false;
        }
      }
    });

    return result;
  }

  function getSortStudents(property, direction) {
    return studentsCopy.sort(function (studentA, studentB) {
      if (property === "fullName") {
        if (
          !direction == false
            ? getFullName(studentA) > getFullName(studentB)
            : getFullName(studentA) < getFullName(studentB)
        ) {
          return -1;
        }
      } else {
        if (
          !direction == false
            ? studentA[property] > studentB[property]
            : studentA[property] < studentB[property]
        ) {
          return -1;
        }
      }
    });
  }

  $th.forEach((element) => {
    element.addEventListener("click", function () {
      if (lastColumn === this.dataset.column) {
        sortDirection = !sortDirection;
      } else {
        lastColumn = this.dataset.column;
        sortDirection = false;
      }

      renderStudentsTable(getSortStudents(lastColumn, sortDirection));
    });
  });

  function getFilterStudents(arr, property, value) {
    if (property === "name") {
      return arr.filter(function (student) {
        if (getFullName(student).includes(value)) return true;
      });
    } else {
      return arr.filter(function (student) {
        if (String(student[property]).includes(value)) return true;
      });
    }
  }

  $filterForm.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  fullName.addEventListener("input", () => {
    renderStudentsTable(studentsList);
  });

  faculty.addEventListener("input", () => {
    renderStudentsTable(studentsList);
  });

  startYear.addEventListener("input", () => {
    renderStudentsTable(studentsList);
  });

  endYear.addEventListener("input", () => {
    renderStudentsTable(studentsList);
  });

  renderStudentsTable(studentsList);
}
