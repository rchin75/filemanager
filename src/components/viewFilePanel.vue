<template>
    <f7-page>
        <f7-navbar>
            <f7-nav-left>
                <f7-link popup-close icon-f7="chevron_left"></f7-link>
            </f7-nav-left>
            <f7-nav-title v-bind:title="selectedFile ? selectedFile.name : ''"></f7-nav-title>
            <f7-nav-right>
                <f7-link href="false" @click="saveFile" icon-f7="floppy_disk" v-if="isType('text')"></f7-link>
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

        <!-- Show a photo -->
        <span v-if="isType('image')" class="photo-frame-container">
            <img v-bind:src="getFileURL()" class="photo-frame">
        </span>

        <!-- Text editor (for now readonly) -->
        <div v-else-if="isType('text')" class="editor-frame" style="height:100%">
            <v-ace-editor
                    v-model:value="contents"
                    readonly
                    @init="editorInit"
                    v-bind:lang="editorMode"
                    theme="kr_theme"
                    v-bind:options="editorOptions"
                    style="height: 100%" />
        </div>

        <!-- In all other cases we do not support a preview -->
        <span v-else>No file preview available for this file type.</span>

    </f7-page>
</template>
<script>
    import useFileSystem from "../model/useFileSystem";
    import {ref, watch} from 'vue';
    import {VAceEditor} from 'vue3-ace-editor';
    import 'ace-builds/src-noconflict/mode-javascript';
    import 'ace-builds/src-noconflict/mode-json';
    import 'ace-builds/src-noconflict/mode-html';
    import 'ace-builds/src-noconflict/mode-text';
    import 'ace-builds/src-noconflict/theme-kr_theme';
    import ace from 'ace-builds/src-noconflict/ace';
    import { f7 } from 'framework7-vue';

    const {path, getTextFileContents} = useFileSystem();

    // This is needed to prevent a console error.
    ace.config.set("basePath", "ace-builds/src-noconflict/");

    export default {
        name: 'view-file-panel',
        props: ['selectedFile'],
        components: {
            VAceEditor
        },
        setup(props) {

            const contents = ref('');
            const editorMode = ref('javascript');
            const editorOptions = ref({});

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
                    // Note: this download iframe is in index.html, so it won't reload every time this panel opens.
                    document.getElementById('download_iframe').src = getFileURL();
                }
            }

            /**
             * Saves the file. Applies only to text files.
             */
            function saveFile() {
                // To be implemented.
            }

            /**
             * Gets the contents of a text file.
             */
            function getContents() {
                if (props.selectedFile) {
                    contents.value = "";
                    f7.preloader.show();
                    getTextFileContents(getFilePath()).then(fileContents =>{
                        if (props.selectedFile.type === 'text/json') {
                            contents.value = JSON.stringify(fileContents, null, 2);
                        } else {
                            contents.value = fileContents;
                        }
                        f7.preloader.hide();
                    });
                }
            }
            /**
             * Gets the editor mode.
             */
            function getEditorMode() {
                if (props.selectedFile) {
                    switch (props.selectedFile.type) {
                        case 'text/json':
                            editorMode.value = 'json';
                            break;
                        case 'text/javascript':
                            editorMode.value = 'javascript';
                            break;
                        case 'text/html':
                            editorMode.value = 'html';
                            break;
                        default:
                            editorMode.value = 'text';
                    }
                    // The way vue3-ace-editor was implemented unfortunately doesn't allow changing the mode
                    // using the 'lang' property. That is because there is no watcher for it.
                    // Luckily the same can be achieved by editing the properties, which does have a watcher.
                    // To see the source code: node_modules/vue3-ace-editor/index.js.
                    editorOptions.value = {'mode' : 'ace/mode/' + editorMode.value};
                }
            }
            // We trigger this when the selected file changed.
            watch(() => props.selectedFile, () => {
                if (isType('text')) {
                    getEditorMode();
                    getContents();
                }
            });

            /**
             * Called when the editor initialized.
             */
            function editorInit() {
                console.log('Ace editor initialized.');
                // Does nothing yet. If not needed we may delete this later on.
            }

            return {
                getFileURL,
                isType,
                downloadFile,
                saveFile,
                contents,
                editorMode,
                editorOptions,
                editorInit
            }
        }
    }
</script>
<style scoped>
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