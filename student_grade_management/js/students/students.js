import Storage from '../utils/storage.js';

const KEY_STUDENTS = 'students_data';

const StudentManager = {
    getAll() {
        return Storage.get(KEY_STUDENTS);
    },
    getById(id) {
        return this.getAll().find(s => s.id === id);
    },
    // CREATE (Thêm)
    create(studentObj) {
        const students = this.getAll();
        const newStudent = {
            id: 'HS' + Date.now().toString().slice(-4),
            name: studentObj.name,
            phone: studentObj.phone || '',
            classId: studentObj.classId
        };
        students.push(newStudent);
        Storage.set(KEY_STUDENTS, students);
        return newStudent;
    },
    // UPDATE (Sửa)
    update(id, updatedData) {
        const students = this.getAll();
        const index = students.findIndex(s => s.id === id);
        if (index !== -1) {
            students[index] = { ...students[index], ...updatedData };
            Storage.set(KEY_STUDENTS, students);
            return true;
        }
        return false;
    },
    // DELETE (Xóa)
    delete(id) {
        const students = this.getAll();
        const filtered = students.filter(s => s.id !== id);
        Storage.set(KEY_STUDENTS, filtered);
    }
};

export default StudentManager;