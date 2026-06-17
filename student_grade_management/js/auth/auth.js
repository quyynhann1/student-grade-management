import Storage from '../utils/storage.js';

const Auth = {
    login(email, password) {
        const users = Storage.get('users');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify({
                email: user.email,
                name: user.name,
                homeroomClass: user.homeroomClass
            }));
            return true;
        }
        return false;
    },

    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    },

    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    checkAuth() {
        const user = this.getCurrentUser();
        const isAuthPage = window.location.pathname.endsWith('index.html')
            || window.location.pathname === '/'
            || window.location.pathname.endsWith('/');

        if (!user && !isAuthPage) {
            window.location.href = 'index.html';
        } else if (user && isAuthPage) {
            window.location.href = 'dashboard.html';
        }
    }
};

export default Auth;
