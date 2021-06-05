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
    path: []
});

export default function useFileSystem() {

    const files = computed(() => state.files);
    const path = computed( () => state.path);

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
            notify('Error', 'Could not create text file.');
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
            notify('Error', 'Could not create folder.');
            throw (ex);
        }
    }

    return {
        files,
        path,
        listFiles,
        getTextFileContents,
        saveTextFile,
        createTextFile,
        createFolder
    }
}
