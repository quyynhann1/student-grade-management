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

    // Kiểm tra học sinh đã được nhập điểm thật sự hay chưa
    // (khác với getByStudentId, hàm này không trả về giá trị mặc định 0)
    hasGrade(studentId) {
        return this.getAll().some(g => g.studentId === studentId);
    },

    saveGrade(studentId, grades) {
        const math = parseFloat(grades.math);
        const literature = parseFloat(grades.literature);
        const english = parseFloat(grades.english);

        if ([math, literature, english].some(n => isNaN(n) || n < 0 || n > 10)) {
            return false;
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

    getRank(gpa) {
        if (gpa >= 8.0) return 'Giỏi';
        if (gpa >= 6.5) return 'Khá';
        if (gpa >= 5.0) return 'Trung Bình';
        return 'Yếu';
    }
};

export default GradeManager;
