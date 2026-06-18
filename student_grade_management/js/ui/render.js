import StudentManager from '../students/students.js';
import GradeManager from '../grades/grades.js';
import ClassManager from '../classes/classes.js';
import Statistics from '../statistics/statistics.js';

export const UIRenderer = {
    // HÀM HỖ TRỢ CHUYỂN ĐỔI CHỮ "TRUNG BÌNH" THÀNH CLASS HỢP LỆ KHÔNG CÓ DẤU CÁCH
    getSafeRankClass(rank) {
        if (!rank) return '';
        return rank.replace(/\s+/g, '-'); // Biến "Trung Bình" thành "Trung-Bình" để CSS dễ nhận diện
    },

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
            const safeRankClass = this.getSafeRankClass(rank);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${student.id}</strong></td>
                <td>${student.name}</td>
                <td>${student.phone || '—'}</td>
                <td>T: ${grade.math} | V: ${grade.literature} | A: ${grade.english}</td>
                <td><span class="badge-gpa">${gpa}</span></td>
                <td><span class="badge-rank ${safeRankClass}">${rank}</span></td>
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

    // 2. LOAD THÔNG TIN LỚP CHỦ NHIỆM (TAB 2) - ĐÃ ĐƯỢC CẢI TIẾN ĐỂ ĐẾM SĨ SỐ CHUẨN XÁC
    loadHomeroomInfo(classId) {
        const currentClassId = classId || '12A1';
        const cls = ClassManager.getHomeroomClass(currentClassId);

        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val || '';
        };

        set('homeroomCode', currentClassId);
        set('homeroomName', cls?.name || 'Lớp ' + currentClassId);
        set('homeroomGrade', cls?.grade || '12');
        set('homeroomYear', cls?.schoolYear || '2025 - 2026');

        // Lấy sĩ số thực tế từ danh sách học sinh hiện tại
        const countEl = document.getElementById('homeroomCount');
        if (countEl) {
            const students = StudentManager.getAll(); 
            // Nếu có bộ lọc theo lớp thì lọc, không thì đếm tổng số học sinh hiện tại
            const actualCount = students.length;
            countEl.textContent = actualCount;
        }
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
            const safeRankClass = this.getSafeRankClass(rank);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${student.id}</strong></td>
                <td>${student.name}</td>
                <td>${grade.math}</td>
                <td>${grade.literature}</td>
                <td>${grade.english}</td>
                <td><span class="badge-gpa">${gpa}</span></td>
                <td><span class="badge-rank ${safeRankClass}">${rank}</span></td>
            `;
            tableBody.appendChild(tr);
        }
    },

    // 4. RENDER THỐNG KÊ BÁO CÁO & TOP HỌC SINH (TAB 4)
    renderStatistics(homeroomClass) {
        const currentClass = homeroomClass || '12A1';
        const overview = Statistics.getOverview(currentClass);
        const el = (id) => document.getElementById(id);

        if (el('statStudents')) el('statStudents').textContent = overview.totalStudents || 0;
        if (el('statHomeroom')) el('statHomeroom').textContent = overview.homeroomClass || currentClass;
        if (el('statGraded')) el('statGraded').textContent = overview.totalGraded || 0;
        if (el('statAvgGpa')) el('statAvgGpa').textContent = overview.averageGpa || '0.00';

        // Vẽ bảng số lượng phân loại học lực
        const rankBody = document.getElementById('rankTableBody');
        if (rankBody) {
            rankBody.innerHTML = '';
            const ranks = ['Giỏi', 'Khá', 'Trung Bình', 'Yếu'];
            for (let i = 0; i < ranks.length; i++) {
                const tr = document.createElement('tr');
                const safeRankClass = this.getSafeRankClass(ranks[i]);
                const count = overview.rankCounts && overview.rankCounts[ranks[i]] ? overview.rankCounts[ranks[i]] : 0;
                
                tr.innerHTML = `
                    <td><span class="badge-rank ${safeRankClass}">${ranks[i]}</span></td>
                    <td><strong>${count}</strong> học sinh</td>
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
                const safeRankClass = this.getSafeRankClass(top[i].rank);
                
                tr.innerHTML = `
                    <td><strong>${i + 1}</strong></td>
                    <td>${top[i].name}</td>
                    <td><span class="badge-gpa">${top[i].gpa}</span></td>
                    <td><span class="badge-rank ${safeRankClass}">${top[i].rank}</span></td>
                `;
                topBody.appendChild(tr);
            }
            
            if (top.length === 0) {
                topBody.innerHTML = '<tr><td colspan="4" style="text-align:center">Chưa có dữ liệu thống kê</td></tr>';
            }
        }
    }
};