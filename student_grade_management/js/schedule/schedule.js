import Storage from '../utils/storage.js';

// Dữ liệu Thời khóa biểu mặc định
const defaultSchedule = {
    t2: ["Chào cờ", "Toán", "Toán", "Ngữ văn", "Tiếng Anh"],
    t3: ["Toán", "Toán", "Ngữ văn", "Lịch sử", "Địa lý"],
    t4: ["Ngữ văn", "Ngữ văn", "Lịch sử", "Vật lý", "Hóa học"],
    t5: ["Tiếng Anh", "Tiếng Anh", "Tin học", "Đại số", "GDCD"],
    t6: ["Vật lý", "Hóa học", "Tin học", "Công nghệ", "Thể dục"],
    t7: ["Sinh học", "Địa lý", "GDQP-AN", "Sinh hoạt lớp", "—"]
};

const KEY_SCHEDULE = 'school_schedule';

const ScheduleManager = {
    // Lấy dữ liệu TKB từ localStorage, nếu chưa có thì lấy mặc định
    getSchedule() {
        const data = localStorage.getItem(KEY_SCHEDULE);
        return data ? JSON.parse(data) : defaultSchedule;
    },

    // Lưu dữ liệu TKB mới
    saveSchedule(newSchedule) {
        Storage.set(KEY_SCHEDULE, newSchedule);
        return true;
    }
};

export default ScheduleManager;