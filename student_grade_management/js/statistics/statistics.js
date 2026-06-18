import StudentManager from '../students/students.js';
import GradeManager from '../grades/grades.js';

const Statistics = {
    getOverview(homeroomClass) {
        const students = StudentManager.getAll();
        let totalGpa = 0;
        let gradedCount = 0;
        const rankCounts = { 'Giỏi': 0, 'Khá': 0, 'Trung Bình': 0, 'Yếu': 0 };

        for (let i = 0; i < students.length; i++) {
            const hasScore = GradeManager.hasGrade(students[i].id);
            if (hasScore) {
                const grade = GradeManager.getByStudentId(students[i].id);
                const gpa = parseFloat(GradeManager.calculateGPA(grade.math, grade.literature, grade.english));
                totalGpa += gpa;
                gradedCount++;
                const rank = GradeManager.getRank(gpa);
                if (rankCounts[rank] !== undefined) {
                    rankCounts[rank]++;
                }
            }
        }

        const avgGpa = gradedCount > 0 ? (totalGpa / gradedCount).toFixed(2) : '0.00';

        return {
            totalStudents: students.length,
            homeroomClass: homeroomClass || '—',
            totalGraded: gradedCount,
            averageGpa: avgGpa,
            rankCounts
        };
    },

    getTopStudents(limit = 5) {
        const students = StudentManager.getAll();
        const ranked = [];

        for (let i = 0; i < students.length; i++) {
            if (!GradeManager.hasGrade(students[i].id)) continue;
            const grade = GradeManager.getByStudentId(students[i].id);
            const gpa = parseFloat(GradeManager.calculateGPA(grade.math, grade.literature, grade.english));
            ranked.push({
                id: students[i].id,
                name: students[i].name,
                gpa,
                rank: GradeManager.getRank(gpa)
            });
        }

        ranked.sort((a, b) => b.gpa - a.gpa);
        return ranked.slice(0, limit);
    }
};

export default Statistics;