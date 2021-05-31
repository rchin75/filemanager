import {reactive, computed} from 'vue';
import axios from "axios";

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
        const url = 'api/files';
        const params = {
            path : path ? path : '/'
        }
        const result = await axios.get(url, {params});
        if (result.data) {
            state.files = result.data.files;
            state.path = result.data.path;
        }
    }

    /**
     * Gets the contents of a text file.
     * @param filePath file path.
     * @return {Promise<null|any>}
     */
    async function getTextFileContents(filePath) {
        const url = 'api/download';
        const params = {
            path : filePath ? filePath : ''
        }
        const result = await axios.get(url, {params});
        if (result.data) {
            return result.data;
        }
        return null;
    }

    return {
        files,
        path,
        listFiles,
        getTextFileContents
    }
}
