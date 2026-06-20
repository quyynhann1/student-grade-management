import Storage from '../utils/storage.js';

export function initSeedData() {
    if (!localStorage.getItem('users')) {
        Storage.set('users', [{
            email: 'admin@gmail.com',
            password: '123',
            name: 'Nguyễn Quý Nhân',
            homeroomClass: '12A1'
        }]);
    }

    if (!localStorage.getItem('classes_data')) {
        Storage.set('classes_data', [{
            id: '12A1',
            name: 'Lớp 12A1',
            grade: '12',
            schoolYear: '2026 - 2027'
        }]);
    }

    if (!localStorage.getItem('students_data')) {
        Storage.set('students_data', [
            { id: 'HS01', name: 'Nguyễn Văn An', phone: '0912345678', classId: '12A1' },
            { id: 'HS02', name: 'Trần Thị Bình', phone: '0987654321', classId: '12A1' },
            { id: 'HS03', name: 'Lê Minh Cường', phone: '0909090909', classId: '12A1' }
        ]);
    }

    if (!localStorage.getItem('grades_data')) {
        Storage.set('grades_data', [
            { studentId: 'HS01', math: 8.5, literature: 7.5, english: 9.0 },
            { studentId: 'HS02', math: 6.0, literature: 7.0, english: 8.0 },
            { studentId: 'HS03', math: 9.0, literature: 8.5, english: 8.5 }
        ]);
    }
}
