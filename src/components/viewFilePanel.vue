<template>
    <f7-page>
        <f7-navbar v-bind:title="selectedFile ? selectedFile.name : ''">
            <f7-nav-right>
                <f7-link popup-close>Close</f7-link>
            </f7-nav-right>
        </f7-navbar>

        <span v-if="isType('image')" class="photo-frame-container">
            <img v-bind:src="getFileURL()" class="photo-frame">
        </span>

        <p v-else-if="isType('text')" v-html="contents" class="text-content"></p>
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
             * Determines if the file is of type.
             * @param type The type.
             * @return {boolean}
             */
            function isType(type) {
                if (props.selectedFile && props.selectedFile.type.startsWith(type)) {
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
                        if (props.selectedFile.type === 'text/json') {
                            // JSON will become an object so we must stringify it.
                            contents.value = '<pre style="margin:0;">' + JSON.stringify(fileContents, null, 2) + '</pre>';
                        } else {
                            contents.value = '<pre style="margin:0;">' + fileContents + '</pre>';
                        }
                    });
                }
            }
            // We trigger this when the selected file changed.
            watch(() => props.selectedFile, () => {
                if (isType('text')) {
                    getContents();
                }
            });

            return {
                getFileURL,
                isType,
                contents
            }
        }
    }
</script>
<style scoped>
    .text-content {
        padding: 10px;
    }
    .photo-frame-container {
        display:flex;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;
    }
    .photo-frame {
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
    }
</style>