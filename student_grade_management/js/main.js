import { initSeedData } from './data/seedData.js';
import Auth from './auth/auth.js';
import StudentManager from './students/students.js';
import ClassManager from './classes/classes.js';
import GradeManager from './grades/grades.js';
import { UIRenderer } from './ui/render.js';
import { validateEmail, validatePassword, validateStudentForm, validateGradeForm, validateClassName, validateScore } from './utils/validate.js';
import ScheduleManager from './schedule/schedule.js';

// Khởi tạo dữ liệu mẫu và kiểm tra quyền đăng nhập
initSeedData();
Auth.checkAuth();

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. XỬ LÝ ĐĂNG NHẬP (LOGIN) ---
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

    // Nếu không có studentForm (đang ở trang login) thì dừng lại
    const studentForm = document.getElementById('studentForm');
    if (!studentForm) return;

    const currentUser = Auth.getCurrentUser();
    const teacherName = currentUser?.name || currentUser?.username || 'Nguyễn Quý Nhân';
    const homeroomClass = currentUser?.homeroomClass || '12A1';

    // Cập nhật thông tin lên thanh tiêu đề và sidebar thanh điều hướng
    const welcomeTextEl = document.getElementById('welcomeText');
    const classBadgeEl = document.getElementById('classBadge');
    const classMenuLinkEl = document.querySelector('.menu-list .class-badge');

    if (welcomeTextEl) {
        welcomeTextEl.innerText = `GVCN: ${teacherName} — Lớp ${homeroomClass}`;
    }
    if (classBadgeEl) {
        classBadgeEl.innerText = `Lớp chủ nhiệm: ${homeroomClass}`;
    }
    if (classMenuLinkEl) {
        classMenuLinkEl.innerText = `Lớp chủ nhiệm: ${homeroomClass}`;
    }

    document.getElementById('btnLogout').addEventListener('click', () => Auth.logout());

    const gradeModal = document.getElementById('gradeModal');
    const menuItems = document.querySelectorAll('.menu-list .menu-item');
    const views = document.querySelectorAll('.view-panel');

    // --- 2. XỬ LÝ CHUYỂN ĐỔI TAB SIDEBAR MƯỢT MÀ ---
    function switchView(viewName) {
        menuItems.forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });
        
        views.forEach(v => {
            if (v.id === 'view-' + viewName) {
                v.classList.add('active');
                v.style.display = 'block';
            } else {
                v.classList.remove('active');
                v.style.display = 'none';
            }
        });

        if (viewName === 'students') reloadStudentTable();
        if (viewName === 'grades') UIRenderer.renderGradeTable();
        if (viewName === 'statistics') UIRenderer.renderStatistics(homeroomClass);
        if (viewName === 'homeroom') UIRenderer.loadHomeroomInfo(homeroomClass);
        if (viewName === 'schedule') renderScheduleTable();
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

    // --- 3. XỬ LÝ MODAL NHẬP ĐIỂM ---
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

    // --- 4. XỬ LÝ CRUD HỌC SINH (CHẾ ĐỘ TỰ NHẬP MÃ) ---
    const handleEditClick = (id) => {
        const student = StudentManager.getById(id);
        if (student) {
            document.getElementById('studentId').value = student.id;
            // KHÓA ô mã học sinh lại, không cho sửa mã khi cập nhật thông tin
            document.getElementById('studentId').setAttribute('readonly', true);
            document.getElementById('studentId').style.backgroundColor = '#f8f9fa';
            
            document.getElementById('studentName').value = student.name;
            document.getElementById('studentPhone').value = student.phone || '';
            document.getElementById('formTitle').innerText = 'Cập Nhật Học Sinh';
            document.getElementById('btnSubmitForm').innerText = 'Cập Nhật';
            document.getElementById('btnCancelEdit').style.display = 'inline-block';
        }
    };

    const handleDeleteClick = (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa học sinh này khỏi lớp không?')) {
            StudentManager.delete(id);
            reloadStudentTable();
            resetStudentForm();
            UIRenderer.loadHomeroomInfo(homeroomClass);
        }
    };

    const resetStudentForm = () => {
        studentForm.reset();
        // MỞ KHÓA lại ô nhập mã học sinh để có thể điền mã cho học sinh mới tiếp theo
        document.getElementById('studentId').removeAttribute('readonly');
        document.getElementById('studentId').style.backgroundColor = '';
        
        document.getElementById('studentId').value = '';
        document.getElementById('formTitle').innerText = 'Thêm Học Sinh Mới';
        document.getElementById('btnSubmitForm').innerText = 'Lưu Học Sinh';
        document.getElementById('btnCancelEdit').style.display = 'none';
        document.getElementById('studentFormError').innerText = '';
    };

    document.getElementById('btnCancelEdit').addEventListener('click', resetStudentForm);

    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('studentId').value.trim();
        const data = {
            id: id,
            name: document.getElementById('studentName').value.trim(),
            phone: document.getElementById('studentPhone').value.trim(),
            classId: homeroomClass
        };
        
        const check = validateStudentForm(data);
        if (!check.valid) {
            document.getElementById('studentFormError').innerText = check.errors.join(', ');
            return;
        }

        const isEdit = document.getElementById('studentId').hasAttribute('readonly');
        
        if (isEdit) {
            StudentManager.update(id, data);
        } else {
            // Kiểm tra trùng lặp mã trước khi tạo mới
            if (StudentManager.getById(id)) {
                document.getElementById('studentFormError').innerText = 'Mã học sinh này đã tồn tại trong hệ thống!';
                return;
            }
            StudentManager.create(data);
        }
        
        reloadStudentTable();
        resetStudentForm();
        UIRenderer.loadHomeroomInfo(homeroomClass);
    });

    // --- 5. THÔNG TIN LỚP CHỦ NHIỆM (CHẾ ĐỘ CHỈ XEM) ---
    // Đã chuyển form sang chế độ readonly ở HTML, không xử lý sự kiện submit lưu dữ liệu nữa.

    // --- 6. XỬ LÝ THỜI KHÓA BIỂU ĐỘNG VÀ SỬA TRỰC TIẾP ---
    let isEditingSchedule = false;

    function renderScheduleTable() {
        const schedule = ScheduleManager.getSchedule();
        const tbody = document.getElementById('scheduleTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        for (let i = 0; i < 5; i++) {
            const tr = document.createElement('tr');
            let rowHTML = `<td style="text-align: center;"><strong>Tiết ${i + 1}</strong></td>`;
            const days = ['t2', 't3', 't4', 't5', 't6', 't7'];

            days.forEach(day => {
                const subject = schedule[day][i] || '—';
                if (isEditingSchedule) {
                    rowHTML += `<td><input type="text" class="schedule-input" data-day="${day}" data-period="${i}" value="${subject}" style="width:100%; padding:5px; text-align:center; border:1px solid #ccc; border-radius:4px;"></td>`;
                } else {
                    rowHTML += `<td>${subject}</td>`;
                }
            });

            tr.innerHTML = rowHTML;
            tbody.appendChild(tr);
        }
    }

    const editScheduleBtn = document.getElementById('btnEditSchedule');
    if (editScheduleBtn) {
        editScheduleBtn.addEventListener('click', () => {
            if (!isEditingSchedule) {
                isEditingSchedule = true;
                editScheduleBtn.innerText = 'Lưu Lịch Học';
                editScheduleBtn.style.backgroundColor = '#28a745';
                renderScheduleTable();
            } else {
                const inputs = document.querySelectorAll('.schedule-input');
                const currentSchedule = ScheduleManager.getSchedule();

                inputs.forEach(input => {
                    const day = input.dataset.day;
                    const period = parseInt(input.dataset.period);
                    currentSchedule[day][period] = input.value.trim() || '—';
                });

                ScheduleManager.saveSchedule(currentSchedule);

                isEditingSchedule = false;
                editScheduleBtn.innerText = 'Chỉnh sửa TKB';
                editScheduleBtn.style.backgroundColor = '';
                renderScheduleTable();
                alert('Đã cập nhật Thời khóa biểu mới thành công!');
            }
        });
    }

    reloadStudentTable();
    UIRenderer.loadHomeroomInfo(homeroomClass);
});