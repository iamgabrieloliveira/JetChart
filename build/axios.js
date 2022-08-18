import axios from 'axios';
const instance = axios.create({ withCredentials: true, });
axios.defaults.headers.get['Content-Type'] = 'application/json;charset=utf-8';
axios.defaults.headers.get['Access-Control-Allow-Origin'] = '*';
axios.interceptors.response.use((response) => {
    return response;
}, error => {
    if (!error.response) {
        console.log("Please check your internet connection.");
    }
    return Promise.reject(error);
});
export default axios;
//# sourceMappingURL=axios.js.map