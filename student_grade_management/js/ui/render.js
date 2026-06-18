import StudentManager from '../students/students.js';
import GradeManager from '../grades/grades.js';
import ClassManager from '../classes/classes.js';
import Statistics from '../statistics/statistics.js';

export const UIRenderer = {
    // 1. RENDER BẢNG HỌC SINH (TAB 1)
    renderStudentTable(onEdit, onDelete, onInputGrade) {
        const tableBody = document.getElementById('studentTableBody');
        if (!tableBody) return;

        const students = StudentManager.getAll();
        tableBody.innerHTML = '';

        if (students.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center">Chưa có học sinh trong lớp</td></tr>';
            return;
        }

        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const grade = GradeManager.getByStudentId(student.id);
            const gpa = GradeManager.calculateGPA(grade.math, grade.literature, grade.english);
            const rank = GradeManager.getRank(parseFloat(gpa));

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${student.id}</strong></td>
                <td>${student.name}</td>
                <td>${student.phone || '—'}</td>
                <td>T: ${grade.math} | V: ${grade.literature} | A: ${grade.english}</td>
                <td><span class="badge-gpa">${gpa}</span></td>
                <td><span class="badge-rank ${rank}">${rank}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn-table-grade" data-id="${student.id}">Điểm</button>
                        <button class="btn-table-edit" data-id="${student.id}">Sửa</button>
                        <button class="btn-table-delete" data-id="${student.id}">Xóa</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        }

        // Gắn sự kiện cho các nút hành động
        document.querySelectorAll('.btn-table-edit').forEach(btn => {
            btn.addEventListener('click', () => onEdit(btn.dataset.id));
        });
        document.querySelectorAll('.btn-table-delete').forEach(btn => {
            btn.addEventListener('click', () => onDelete(btn.dataset.id));
        });
        document.querySelectorAll('.btn-table-grade').forEach(btn => {
            btn.addEventListener('click', () => onInputGrade(btn.dataset.id));
        });
    },

    // 2. LOAD THÔNG TIN LỚP CHỦ NHIỆM (TAB 2)
    loadHomeroomInfo(classId) {
        const cls = ClassManager.getHomeroomClass(classId);
        if (!cls) return;

        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val || '';
        };

        set('homeroomCode', cls.id);
        set('homeroomName', cls.name);
        set('homeroomGrade', cls.grade);
        set('homeroomYear', cls.schoolYear);

        const countEl = document.getElementById('homeroomCount');
        if (countEl) countEl.textContent = ClassManager.countStudents(classId);
    },

    // 3. RENDER BẢNG ĐIỂM CHI TIẾT (TAB 3)
    renderGradeTable() {
        const tableBody = document.getElementById('gradeTableBody');
        if (!tableBody) return;

        const students = StudentManager.getAll();
        tableBody.innerHTML = '';

        if (students.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center">Chưa có dữ liệu học sinh</td></tr>';
            return;
        }

        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const grade = GradeManager.getByStudentId(student.id);
            const gpa = GradeManager.calculateGPA(grade.math, grade.literature, grade.english);
            const rank = GradeManager.getRank(parseFloat(gpa));

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${student.id}</strong></td>
                <td>${student.name}</td>
                <td>${grade.math}</td>
                <td>${grade.literature}</td>
                <td>${grade.english}</td>
                <td><span class="badge-gpa">${gpa}</span></td>
                <td><span class="badge-rank ${rank}">${rank}</span></td>
            `;
            tableBody.appendChild(tr);
        }
    },

    // 4. RENDER THỐNG KÊ BÁO CÁO & TOP HỌC SINH (TAB 4)
    renderStatistics(homeroomClass) {
        const overview = Statistics.getOverview(homeroomClass);
        const el = (id) => document.getElementById(id);

        if (el('statStudents')) el('statStudents').textContent = overview.totalStudents;
        if (el('statHomeroom')) el('statHomeroom').textContent = overview.homeroomClass;
        if (el('statGraded')) el('statGraded').textContent = overview.totalGraded;
        if (el('statAvgGpa')) el('statAvgGpa').textContent = overview.averageGpa;

        // Vẽ bảng số lượng phân loại học lực
        const rankBody = document.getElementById('rankTableBody');
        if (rankBody) {
            rankBody.innerHTML = '';
            const ranks = ['Giỏi', 'Khá', 'Trung Bình', 'Yếu'];
            for (let i = 0; i < ranks.length; i++) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><span class="badge-rank ${ranks[i]}">${ranks[i]}</span></td>
                    <td><strong>${overview.rankCounts[ranks[i]]}</strong> học sinh</td>
                `;
                rankBody.appendChild(tr);
            }
        }

        // Vẽ bảng Top 5 học sinh giỏi nhất lớp
        const topBody = document.getElementById('topStudentBody');
        if (topBody) {
            const top = Statistics.getTopStudents(5);
            topBody.innerHTML = '';
            
            for (let i = 0; i < top.length; i++) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${i + 1}</strong></td>
                    <td>${top[i].name}</td>
                    <td><span class="badge-gpa">${top[i].gpa}</span></td>
                    <td><span class="badge-rank ${top[i].rank}">${top[i].rank}</span></td>
                `;
                topBody.appendChild(tr);
            }
            
            if (top.length === 0) {
                topBody.innerHTML = '<tr><td colspan="4" style="text-align:center">Chưa có dữ liệu thống kê</td></tr>';
            }
        }
    }
};