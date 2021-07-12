import {reactive, computed} from 'vue';
import axios from "axios";
import { f7 } from 'framework7-vue';
import {notify} from "../notifications";

/**
 * State representing the current folder of the file system.
 * @type {UnwrapNestedRefs<{path: [], files: []}>}
 */
const state = reactive({
    files: [],
    // Folders of the path. Note root is [].
    path: [],
    clipboard: null,
    settings: {}
});

export default function useFileSystem() {

    const files = computed(() => state.files);
    const path = computed( () => state.path);
    const clipboard = computed( () => state.clipboard);
    const appSettings = computed( () => state.settings);

    /**
     * Loads app settings.
     * @return {Promise<void>}
     */
    async function getAppSettings() {
        f7.preloader.show();
        const url = 'api/settings';
        const params = {}
        try {
            const result = await axios.get(url, {params});
            f7.preloader.hide();
            if (result.data) {
                state.settings = result.data;
            }
        } catch(ex) {
            notify('Error', 'Could not load app settings.');
            f7.preloader.hide();
            throw (ex);
        }
    }

    /**
     * Lists the available files and folders.
     * @param [path] The path in this format: 'folder1/folder2'. If not provided we will load the root folder.
     * @returns {Promise<void>}
     */
    async function listFiles(path) {
        f7.preloader.show();
        const url = 'api/files';
        const params = {
            path : path ? path : '/'
        }
        try {
            const result = await axios.get(url, {params});
            f7.preloader.hide();
            if (result.data) {
                state.files = result.data.files;
                state.path = result.data.path;
            }
        } catch(ex) {
            state.files = [];
            state.path = [];
            f7.preloader.hide();
            notify('Error', 'Could not list files.');
            throw (ex);
        }
    }

    /**
     * Gets the contents of a text file.
     * @param filePath file path.
     * @return {Promise<null|any>}
     */
    async function getTextFileContents(filePath) {
        f7.preloader.show();
        const url = 'api/download';
        const params = {
            path : filePath ? filePath : ''
        }
        try {
            const result = await axios.get(url, {params});
            f7.preloader.hide();
            if (result.data) {
                return result.data;
            }
        } catch (ex) {
            f7.preloader.hide();
            notify('Error', 'Could not load file.');
            throw (ex);
        }
        return null;
    }

    /**
     * Saves a text file.
     * @param filePath The file path.
     * @param contents The contents to save.
     * @return {Promise<any>}
     */
    async function saveTextFile(filePath, contents) {
        f7.preloader.show();
        const url = 'api/save';
        const params = {
            path : filePath ? filePath : ''
        }
        const data = {
            contents
        };
        try {
            const result = await axios.post(url, data, {params});
            f7.preloader.hide();
            return result.data;
        } catch(ex) {
            f7.preloader.hide();
            notify('Error', 'Could not save file.');
            throw (ex);
        }
    }

    /**
     * Creates a new text file.
     * @param filename Filename.
     * @return {Promise<any>}
     */
    async function createTextFile(filename) {
        f7.preloader.show();
        const url = 'api/create';
        const thePath = '/' + state.path.join('/');
        const params = {
            path : thePath
        }
        const data = {
            filename
        };
        try {
            const result = await axios.post(url, data, {params});
            await listFiles(thePath);
            f7.preloader.hide();
            return result.data;
        } catch(ex) {
            f7.preloader.hide();
            const msg = (ex.response.data && ex.response.data.error) ? ex.response.data.error : 'Could not create text file.';
            notify('Error', msg);
            throw (ex);
        }

    }

    /**
     * Creates a new folder.
     * @param folderName Folder name.
     * @return {Promise<any>}
     */
    async function createFolder(folderName) {
        f7.preloader.show();
        const url = 'api/createFolder';
        const thePath = '/' + state.path.join('/');
        const params = {
            path : thePath
        }
        const data = {
            folderName
        };
        try {
            const result = await axios.post(url, data, {params});
            await listFiles(thePath);
            f7.preloader.hide();
            return result.data;
        } catch(ex) {
            f7.preloader.hide();
            const msg = (ex.response.data && ex.response.data.error) ? ex.response.data.error : 'Could not create folder.';
            notify('Error', msg);
            throw (ex);
        }
    }

    /**
     * Deletes multiple files.
     * @param {Array} filenames Filenames to delete.
     * @return {Promise<any>}
     */
    async function deleteFiles(filenames) {
        if (!filenames || (filenames.length === 0)) {
            notify('Error', 'No files selected to delete.');
            return;
        }

        f7.preloader.show();
        const url = 'api/delete';
        const thePath = '/' + state.path.join('/');
        const params = {
            path : thePath
        }
        const data = {
            filenames
        }
        try {
            const result = await axios.delete(url,{params, data});
            await listFiles(thePath);
            f7.preloader.hide();
            if (result.data) {
                return result.data;
            }
        } catch (ex) {
            await listFiles(thePath);
            f7.preloader.hide();
            if (filenames.length > 1) {
                notify('Error', 'Could not delete files.');
            } else {
                notify('Error', 'Could not delete file.');
            }
            throw (ex);
        }
    }

    /**
     * Uploads a file.
     * @param file The file to upload.
     * @return {Promise<void>}
     */
    async function uploadFile(file) {
        f7.preloader.show();
        const formData = new FormData();
        formData.append("theFile", file.files[0]);
        const url = 'api/upload';
        const thePath = '/' + state.path.join('/');
        const params = {
            path : thePath
        }
        try {
            await axios.post(url, formData, { params,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            await listFiles(thePath);
            f7.preloader.hide();
        } catch (ex) {
            f7.preloader.hide();
            const msg = (ex.response.data && ex.response.data.error) ? ex.response.data.error : 'Could not upload file.';
            notify('Upload failed', msg);
            throw(ex);
        }
    }

    /**
     * Renames a file or folder.
     * @param filePath Full file path.
     * @param newName New name.
     * @return {Promise<any>}
     */
    async function renameFile(filePath, newName) {
        f7.preloader.show();
        const url = 'api/rename';
        const thePath = '/' + state.path.join('/');
        const params = {
            path : filePath ? filePath : ''
        }
        const data = {
            newName
        };
        try {
            const result = await axios.post(url, data, {params});
            await listFiles(thePath);
            f7.preloader.hide();
            return result.data;
        } catch(ex) {
            f7.preloader.hide();
            const msg = (ex.response.data && ex.response.data.error) ? ex.response.data.error : 'Could not rename file.';
            notify('Renaming failed', msg);
            throw (ex);
        }
    }

    /**
     * Adds a file to the clipboard.
     * @param {string} sourceFolder The source folder.
     * @param {Array} filenames Filenames.
     * @param {string} action Either "CUT" or "COPY"
     */
    function addToClipboard(sourceFolder, filenames, action) {
        if (filenames.length === 0) {
            state.clipboard = null;
            return;
        }
        state.clipboard = {
            sourceFolder,
            filenames,
            action
        }
    }

    /**
     * Clears the clipboard.
     */
    function clearClipboard() {
        state.clipboard = null;
    }

    /**
     * Paste the file on the clipboard, if any.
     * @return {Promise<any>}
     */
    async function paste() {
        if (state.clipboard === null) {
            notify('Paste', 'No file to paste');
            return;
        }
        f7.preloader.show();
        const url = 'api/paste';
        const thePath = '/' + state.path.join('/');
        const params = {
            path : thePath
        }
        const data = {
            sourceFolder: state.clipboard.sourceFolder,
            filenames: state.clipboard.filenames,
            action: state.clipboard.action
        };
        try {
            const result = await axios.post(url, data, {params});
            await listFiles(thePath);
            state.clipboard = null;
            f7.preloader.hide();
            return result.data;
        } catch(ex) {
            f7.preloader.hide();
            await listFiles(thePath);
            const msg = (ex.response.data && ex.response.data.error) ? ex.response.data.error : 'Could not paste file.';
            notify('Pasting file failed', msg);
            // Let's clear the clipboard even if it failed. (May need to be changed later if not convenient.)
            state.clipboard = null;
            throw (ex);
        }
    }

    return {
        files,
        path,
        clipboard,
        appSettings,
        getAppSettings,
        listFiles,
        getTextFileContents,
        saveTextFile,
        createTextFile,
        createFolder,
        deleteFiles,
        uploadFile,
        renameFile,
        addToClipboard,
        clearClipboard,
        paste
    }
}
