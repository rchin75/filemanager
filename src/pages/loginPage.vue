<template>
    <f7-page no-toolbar no-navbar no-swipeback login-screen>
        <f7-login-screen-title>Login</f7-login-screen-title>
        <f7-list form>
            <f7-list-input
                    label="Username"
                    type="text"
                    placeholder="Your username"
                    :value="username"
                    @input="username = $event.target.value"
            ></f7-list-input>
            <f7-list-input
                    label="Password"
                    type="password"
                    placeholder="Your password"
                    :value="password"
                    @input="password = $event.target.value"
            ></f7-list-input>
        </f7-list>
        <f7-list>
            <f7-list-button @click="signIn">Sign In</f7-list-button>
            <f7-block-footer v-if="loginError">Access denied</f7-block-footer>
        </f7-list>
    </f7-page>
</template>
<script>
    import {ref} from 'vue';
    import useAuthentication from "../model/useAuthentication";
    const {login} = useAuthentication();

    export default {
        name: 'login-panel',
        props: {
            f7router: Object,
        },
        setup(props) {
            const username = ref('');
            const password = ref('');
            const loginError = ref(false);

            function signIn() {
                login(username.value, password.value).then(user => {
                    console.log('user', user);
                    loginError.value = false;
                    props.f7router.navigate('/');
                }).catch(err => {
                    console.log('err', err);
                    loginError.value = true;
                });
            }

            return {
                username,
                password,
                loginError,
                signIn,
            }
        }
    }
</script>