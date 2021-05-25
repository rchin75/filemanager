/**
 * Initializes global filters that can be used throughout the app.
 * Use the filters in a template like this {{$filters.formateDate(someDate)}}
 * @param app The app. (See main.js)
 * @returns {string}
 */
export default function registerFilters(app) {
    app.config.globalProperties.$filters = {
        formatDate(date) {
            let theDate = date;
            if (typeof date === 'string' || date instanceof String) {
                theDate = new Date(date);
            }
            return theDate.toLocaleDateString("en-US");
        },
        formatSize(size) {
            if (size >= 1024 * 1024) {
               return Math.round(size / (1024 * 1024)) + ' MB';
            } else if (size >= 1024) {
                return Math.round(size / 1024) + ' KB';
            } else {
                return size + ' bytes';
            }
        }
    }
}