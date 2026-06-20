import Storage from '../utils/storage.js';

const KEY_GRADES = 'grades_data';

const GradeManager = {
    getAll() {
        return Storage.get(KEY_GRADES);
    },

    getByStudentId(studentId) {
        return this.getAll().find(g => g.studentId === studentId)
            || { math: 0, literature: 0, english: 0 };
    },

    saveGrade(studentId, grades) {
        const math = parseFloat(grades.math);
        const literature = parseFloat(grades.literature);
        const english = parseFloat(grades.english);

        // Kiểm tra cả 3 điểm phải hợp lệ (là số và nằm trong khoảng 0-10)
        const scores = [math, literature, english];
        for (let i = 0; i < scores.length; i++) {
            const n = scores[i];
            if (isNaN(n) || n < 0 || n > 10) {
                return false;
            }
        }

        const allGrades = this.getAll();
        const index = allGrades.findIndex(g => g.studentId === studentId);
        const gradeObj = { studentId, math, literature, english };

        if (index !== -1) {
            allGrades[index] = gradeObj;
        } else {
            allGrades.push(gradeObj);
        }
        Storage.set(KEY_GRADES, allGrades);
        return true;
    },

    calculateGPA(math, literature, english) {
        const gpa = (math + literature + english) / 3;
        return gpa.toFixed(2);
    },

    // Hàm mới: kiểm tra học sinh đã được nhập điểm hay chưa
    // (chưa nhập thì cả 3 môn đều bằng 0, không nên tính là "Yếu")
    hasGrade(grade) {
        if (grade.math > 0 || grade.literature > 0 || grade.english > 0) {
            return true;
        }
        return false;
    },

    getRank(gpa) {
        if (gpa >= 8.0) return 'Giỏi';
        if (gpa >= 6.5) return 'Khá';
        if (gpa >= 5.0) return 'Trung Bình';
        return 'Yếu';
    }
};

export default GradeManager;