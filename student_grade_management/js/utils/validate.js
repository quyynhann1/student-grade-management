/**
 * Các hàm kiểm tra dữ liệu đầu vào
 */

export function validateEmail(email) {
    if (!email || email.trim() === '') {
        return { valid: false, message: 'Email không được để trống' };
    }
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(email)) {
        return { valid: false, message: 'Email không đúng định dạng' };
    }
    return { valid: true, message: '' };
}

export function validatePassword(password) {
    if (!password || password.length < 3) {
        return { valid: false, message: 'Mật khẩu phải có ít nhất 3 ký tự' };
    }
    return { valid: true, message: '' };
}

export function validateStudentName(name) {
    if (!name || name.trim().length < 2) {
        return { valid: false, message: 'Họ tên phải có ít nhất 2 ký tự' };
    }
    return { valid: true, message: '' };
}

export function validateScore(score) {
    if (score === '' || score === null || score === undefined) {
        return { valid: false, message: 'Điểm không được để trống' };
    }
    const num = parseFloat(score);
    if (isNaN(num)) {
        return { valid: false, message: 'Điểm phải là số' };
    }
    if (num < 0 || num > 10) {
        return { valid: false, message: 'Điểm chỉ được nhập từ 0 đến 10' };
    }
    return { valid: true, message: '' };
}

export function validateClassName(name) {
    if (!name || name.trim().length < 2) {
        return { valid: false, message: 'Tên lớp phải có ít nhất 2 ký tự' };
    }
    return { valid: true, message: '' };
}

export function validatePhone(phone) {
    if (!phone || phone.trim() === '') {
        return { valid: true, message: '' };
    }
    const cleaned = phone.replace(/\s/g, '');
    if (!/^0\d{9}$/.test(cleaned)) {
        return { valid: false, message: 'SĐT phải có 10 số, bắt đầu bằng 0' };
    }
    return { valid: true, message: '' };
}

export function validateStudentForm(data) {
    const errors = [];
    const nameCheck = validateStudentName(data.name);
    const phoneCheck = validatePhone(data.phone);

    if (!nameCheck.valid) errors.push(nameCheck.message);
    if (!phoneCheck.valid) errors.push(phoneCheck.message);

    return { valid: errors.length === 0, errors };
}

export function validateGradeForm(grades) {
    const errors = [];
    const subjects = [
        { key: 'math', label: 'Toán' },
        { key: 'literature', label: 'Ngữ văn' },
        { key: 'english', label: 'Tiếng Anh' }
    ];

    for (let i = 0; i < subjects.length; i++) {
        const check = validateScore(grades[subjects[i].key]);
        if (!check.valid) {
            errors.push(`${subjects[i].label}: ${check.message}`);
        }
    }

    return { valid: errors.length === 0, errors };
}
