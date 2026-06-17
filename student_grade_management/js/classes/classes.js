import Storage from '../utils/storage.js';
import StudentManager from '../students/students.js';

const KEY_CLASSES = 'classes_data';

const ClassManager = {
    getAll() {
        return Storage.get(KEY_CLASSES);
    },

    getById(id) {
        return this.getAll().find(c => c.id === id);
    },

    getHomeroomClass(classId) {
        return this.getById(classId);
    },

    updateHomeroom(id, updatedData) {
        const classes = this.getAll();
        const index = classes.findIndex(c => c.id === id);
        if (index !== -1) {
            classes[index] = { ...classes[index], ...updatedData };
            Storage.set(KEY_CLASSES, classes);
            return true;
        }
        return false;
    },

    countStudents(classId) {
        const students = StudentManager.getAll();
        let count = 0;
        for (let i = 0; i < students.length; i++) {
            if (students[i].classId === classId) count++;
        }
        return count;
    }
};

export default ClassManager;
