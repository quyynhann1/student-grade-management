import { initSeedData } from './data/seedData.js';
import Auth from './auth/auth.js';
import StudentManager from './students/students.js';
import ClassManager from './classes/classes.js';
import GradeManager from './grades/grades.js';
import { UIRenderer } from './ui/render.js';
import { validateEmail, validatePassword, validateStudentForm, validateGradeForm, validateClassName, validateScore } from './utils/validate.js';

initSeedData();
Auth.checkAuth();

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const errorEl = document.getElementById('authError');

            const emailCheck = validateEmail(email);
            const passCheck = validatePassword(password);
            if (!emailCheck.valid) { errorEl.innerText = emailCheck.message; return; }
            if (!passCheck.valid) { errorEl.innerText = passCheck.message; return; }

            if (Auth.login(email, password)) {
                window.location.href = 'dashboard.html';
            } else {
                errorEl.innerText = 'Sai tài khoản hoặc mật khẩu!';
            }
        });
    }

    const studentForm = document.getElementById('studentForm');
    if (!studentForm) return;

    const currentUser = Auth.getCurrentUser();
    const homeroomClass = currentUser.homeroomClass;

    if (currentUser) {
        document.getElementById('welcomeText').innerText =
            `GVCN ${currentUser.name} — Lớp ${homeroomClass}`;
        document.getElementById('classBadge').innerText = `Lớp chủ nhiệm: ${homeroomClass}`;
    }
    document.getElementById('btnLogout').addEventListener('click', () => Auth.logout());

    const gradeModal = document.getElementById('gradeModal');
    const menuItems = document.querySelectorAll('.menu-item');
    const views = document.querySelectorAll('.view-panel');

    function switchView(viewName) {
        menuItems.forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });
        views.forEach(v => {
            v.classList.toggle('active', v.id === 'view-' + viewName);
        });

        if (viewName === 'grades') UIRenderer.renderGradeTable();
        if (viewName === 'statistics') UIRenderer.renderStatistics(homeroomClass);
        if (viewName === 'homeroom') UIRenderer.loadHomeroomInfo(homeroomClass);
    }

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(item.dataset.view);
        });
    });

    const reloadStudentTable = () => {
        UIRenderer.renderStudentTable(handleEditClick, handleDeleteClick, handleGradeClick);
    };

    const handleGradeClick = (studentId) => {
        const student = StudentManager.getById(studentId);
        const currentGrade = GradeManager.getByStudentId(studentId);
        if (student) {
            document.getElementById('gradeModalTitle').innerText = `Nhập điểm: ${student.name}`;
            document.getElementById('gradeStudentId').value = studentId;
            document.getElementById('scoreMath').value = currentGrade.math || '';
            document.getElementById('scoreLiterature').value = currentGrade.literature || '';
            document.getElementById('scoreEnglish').value = currentGrade.english || '';
            document.getElementById('gradeFormError').innerText = '';
            ['scoreMath', 'scoreLiterature', 'scoreEnglish'].forEach(id => {
                document.getElementById(id).classList.remove('input-error');
            });
            gradeModal.style.display = 'flex';
        }
    };

    document.getElementById('btnCloseModal').addEventListener('click', () => gradeModal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === gradeModal) gradeModal.style.display = 'none'; });

    ['scoreMath', 'scoreLiterature', 'scoreEnglish'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', () => {
            const check = validateScore(input.value);
            input.classList.toggle('input-error', !check.valid);
            document.getElementById('gradeFormError').innerText = !check.valid ? check.message : '';
        });
    });

    document.getElementById('gradeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const grades = {
            math: document.getElementById('scoreMath').value,
            literature: document.getElementById('scoreLiterature').value,
            english: document.getElementById('scoreEnglish').value
        };
        const check = validateGradeForm(grades);
        if (!check.valid) {
            document.getElementById('gradeFormError').innerText = check.errors.join(', ');
            return;
        }
        const saved = GradeManager.saveGrade(document.getElementById('gradeStudentId').value, grades);
        if (!saved) {
            document.getElementById('gradeFormError').innerText = 'Điểm chỉ được nhập từ 0 đến 10';
            return;
        }
        gradeModal.style.display = 'none';
        reloadStudentTable();
    });

    const handleEditClick = (id) => {
        const student = StudentManager.getById(id);
        if (student) {
            document.getElementById('studentId').value = student.id;
            document.getElementById('studentName').value = student.name;
            document.getElementById('studentPhone').value = student.phone || student.email || '';
            document.getElementById('formTitle').innerText = 'Cập Nhật Học Sinh';
            document.getElementById('btnSubmitForm').innerText = 'Cập Nhật';
            document.getElementById('btnCancelEdit').style.display = 'inline-block';
        }
    };

    const handleDeleteClick = (id) => {
        if (confirm('Xóa học sinh này khỏi lớp?')) {
            StudentManager.delete(id);
            reloadStudentTable();
            resetStudentForm();
            UIRenderer.loadHomeroomInfo(homeroomClass);
        }
    };

    const resetStudentForm = () => {
        studentForm.reset();
        document.getElementById('studentId').value = '';
        document.getElementById('formTitle').innerText = 'Thêm Học Sinh Mới';
        document.getElementById('btnSubmitForm').innerText = 'Lưu Học Sinh';
        document.getElementById('btnCancelEdit').style.display = 'none';
        document.getElementById('studentFormError').innerText = '';
    };

    document.getElementById('btnCancelEdit').addEventListener('click', resetStudentForm);

    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('studentId').value;
        const data = {
            name: document.getElementById('studentName').value.trim(),
            phone: document.getElementById('studentPhone').value.trim(),
            classId: homeroomClass
        };
        const check = validateStudentForm(data);
        if (!check.valid) {
            document.getElementById('studentFormError').innerText = check.errors.join(', ');
            return;
        }
        if (id) StudentManager.update(id, data);
        else StudentManager.create(data);
        reloadStudentTable();
        resetStudentForm();
        UIRenderer.loadHomeroomInfo(homeroomClass);
    });

    // Cập nhật thông tin lớp chủ nhiệm
    document.getElementById('homeroomForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('homeroomName').value.trim();
        const grade = document.getElementById('homeroomGrade').value.trim();
        const schoolYear = document.getElementById('homeroomYear').value.trim();

        const nameCheck = validateClassName(name);
        if (!nameCheck.valid) {
            document.getElementById('homeroomFormError').innerText = nameCheck.message;
            return;
        }

        ClassManager.updateHomeroom(homeroomClass, { name, grade, schoolYear });
        document.getElementById('homeroomFormError').innerText = '';
        alert('Đã cập nhật thông tin lớp!');
    });

    reloadStudentTable();
    UIRenderer.loadHomeroomInfo(homeroomClass);
});
