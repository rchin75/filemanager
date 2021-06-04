import {reactive, computed} from 'vue';
import axios from "axios";

/**
 * Stores the current user.
 * @type {UnwrapNestedRefs<{user: null}>}
 */
const state = reactive({
    user: null
});

export default function useAuthentication() {

    const user = computed(() => state.user);

    async function login(username, password) {
        const url = 'api/login';
        const data = {
            username,
            password
        };

        const result = await axios.post(url, data);
        if (result.data) {
            state.user = result.data.user;
        }
        return state.user;
    }

    async function logout() {
        const url = 'api/logout';
        await axios.post(url, {});
        return true;
    }

    return {
        user,
        login,
        logout
    }
}
