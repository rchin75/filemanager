import HomePage from './pages/home';
import AboutPage from './pages/about';
import LoginPage from './pages/loginPage';

const routes = [
    {
        path: '/',
        component: HomePage
    },
    {
        path: '/about/',
        component: AboutPage
    },
    {
        path: /login/,
        component: LoginPage
    }
];
export default routes;