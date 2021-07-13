import { f7 } from 'framework7-vue';

/**
 * Shows a notification.
 * @param {string} title 
 * @param {string} text 
 * @param {*} params 
 */
export function notify (title, text, params) {
    const notification = f7.notification.create({
        title: title,
        text: text,
        closeTimeout: (params && params.closeTimeOut) ? params.closeTimeOut :5000,
        closeButton: (params && params.closeButton) ? params.closeButton : true
    });
    notification.open();
}