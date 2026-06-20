import Storage from '../utils/storage.js';

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
    }
};

export default ClassManager;