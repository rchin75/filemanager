import { f7 } from 'framework7-vue';

export function notify (title, text, params) {
    const notification = f7.notification.create({
        title: title,
        text: text,
        closeTimeout: (params && params.closeTimeOut) ? params.closeTimeOut :5000,
        closeButton: (params && params.closeButton) ? params.closeButton : true
    });
    notification.open();
}