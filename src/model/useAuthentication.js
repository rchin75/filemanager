import {reactive, computed} from 'vue';
import axios from "axios";
import {notify} from "../notifications";
import {f7} from "framework7-vue";

/**
 * Stores the current user.
 * @type {UnwrapNestedRefs<{user: null}>}
 */
const state = reactive({
    user: null
});

export default function useAuthentication() {

    const user = computed(() => state.user);

    /**
     * Login.
     * @param username Username.
     * @param password Password.
     * @return {Promise<void>}
     */
    async function login(username, password) {
        f7.preloader.show();
        const url = 'api/login';
        const data = {
            username,
            password
        };

        try {
            const result = await axios.post(url, data);
            f7.preloader.hide();
            if (result.data) {
                state.user = result.data.user;
            }
            return state.user;
        } catch (ex) {
            f7.preloader.hide();
            notify('Login Failed', 'Please try again.');
            throw (ex);
        }
    }

    /**
     * Logout.
     * @return {Promise<boolean>}
     */
    async function logout() {
        f7.preloader.show();
        const url = 'api/logout';
        try {
            await axios.post(url, {});
            f7.preloader.hide();
            return true;
        } catch (ex) {
            f7.preloader.hide();
            notify('Logout Failed', 'Please try again.');
            throw (ex);
        }
    }

    /**
     * Gets the user.
     * @return {Promise<void>}
     */
    async function getUser() {
        f7.preloader.show();
        const url = 'api/user';
        try {
            const result = await axios.get(url);
            f7.preloader.hide();
            if (result.data) {
                state.user = result.data.user;
            }
            return state.user;
        } catch (ex) {
            console.log('getUser error', ex);
            f7.preloader.hide();
            throw (ex);
        }
    }

    /**
     * Initializes the login when the app starts. Use in onMounted in the main page..
     * @param cb Callback when logged in (load the data).
     * @param err Callback when not logged in (redirect to the login page)
     */
    function initializeLogin(cb, err) {
        if (!user.value) {
            // Timeout is needed to prevent F7 render errors.
            window.setTimeout(function(){
                getUser().then(()=>{
                    cb();
                }).catch(()=>{
                    err();
                });
            }, 100);
        } else {
            // Timeout is needed to prevent F7 render errors.
            window.setTimeout(function(){
                cb();
            }, 100);
        }
    }

    return {
        user,
        login,
        logout,
        getUser,
        initializeLogin
    }
}
