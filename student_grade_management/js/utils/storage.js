const Storage = {
    // Hàm lấy dữ liệu ra khỏi LocalStorage
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },
    // Hàm lưu dữ liệu vào LocalStorage
    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
};
export default Storage;