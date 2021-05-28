<template>
    <f7-page>
        <f7-navbar>
            <f7-nav-left>
                <f7-link popup-close icon-f7="chevron_left"></f7-link>
            </f7-nav-left>
            <f7-nav-title v-bind:title="selectedFile ? selectedFile.name : ''"></f7-nav-title>
            <f7-nav-right>
                <f7-link href="false" @click="downloadFile" icon-f7="arrow_down_line"></f7-link>
                <f7-link href="false" popover-open=".file-action-menu" icon-f7="ellipsis_vertical"></f7-link>
                <!--<f7-link popup-close><f7-icon f7="multiply"></f7-icon></f7-link>-->
            </f7-nav-right>
        </f7-navbar>

        <!-- The file action menu in the navbar -->
        <f7-popover class="file-action-menu">
            <f7-list>
                <f7-list-item link popover-close title="Move to"></f7-list-item>
                <f7-list-item link popover-close title="Rename"></f7-list-item>
                <f7-list-item link popover-close title="Delete"></f7-list-item>
            </f7-list>
        </f7-popover>

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
             * Downloads the selected file.
             */
            function downloadFile() {
                if (props.selectedFile) {
                    const url = getFileURL();
                    // Note: this download iframe is in index.html, so it won't reload every time this panel opens.
                    document.getElementById('download_iframe').src = url;
                }
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
                downloadFile,
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