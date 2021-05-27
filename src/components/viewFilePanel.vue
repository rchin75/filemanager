<template>
    <f7-page>
        <f7-navbar v-bind:title="selectedFile ? selectedFile.name : ''">
            <f7-nav-right>
                <f7-link popup-close>Close</f7-link>
            </f7-nav-right>
        </f7-navbar>

        <img v-bind:src="getFileURL()" v-if="isImage()">
        <p v-else-if="isText" v-html="contents" class="text-content"></p>
        <span v-else>No file preview available for this file type.</span>

    </f7-page>
</template>
<script>
    import useFileSystem from "../model/useFileSystem";
    import {ref, watch} from 'vue';
    const {path, getTextFileContents} = useFileSystem();

    export default {
        name: 'view-file-panel',
        props: ['selectedFile'],
        setup(props) {

            const contents = ref('');

            /**
             * Gets the path of the file.
             * @return {string} The file path.
             */
            function getFilePath() {
                if (!props.selectedFile) {
                    return '';
                }
                let filePath = '';
                path.value.forEach(element => {
                    filePath += element + '/';
                })
                const filename = props.selectedFile.name;
                filePath += filename
                return filePath;
            }

            /**
             * Gets the URL of the file.
             * @return {string} The full URL.
             */
            function getFileURL() {
                if (!props.selectedFile) {
                    return '';
                }
                return 'api/download?path=' + getFilePath();
            }

            /**
             * Determines if the file is an image.
             * @return {boolean}
             */
            function isImage() {
                if (props.selectedFile && props.selectedFile.type.startsWith('image')) {
                    return true;
                }
                return false;
            }

            /**
             * Determines if the file contains text.
             * @return {boolean}
             */
            function isText() {
                if (props.selectedFile && props.selectedFile.type.startsWith('text')) {
                    return true;
                }
                return false;
            }

            /**
             * Gets the contents of a text file.
             */
            function getContents() {
                if (props.selectedFile) {
                    getTextFileContents(getFilePath()).then(fileContents =>{
                        contents.value = '<pre>' + fileContents + '</pre>';
                    });
                }
            }
            // We trigger this when the selected file changed.
            watch(() => props.selectedFile, () => {
                if (isText()) {
                    getContents();
                }
            })

            return {
                getFileURL,
                isImage,
                isText,
                contents
            }
        }
    }
</script>
<style scoped>
    .text-content {
        padding: 10px;
    }
</style>