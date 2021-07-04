<template>
    <f7-page>
        <f7-navbar>
            <f7-nav-left>
                <f7-link popup-close icon-f7="chevron_left"></f7-link>
            </f7-nav-left>
            <f7-nav-title v-bind:title="selectedFile ? selectedFile.name : ''"></f7-nav-title>
            <f7-nav-right>
                <f7-link href="false" @click="editMode = true" icon-f7="pencil" v-if="!editMode && isType('text')"></f7-link>
                <f7-link href="false" @click="saveFile" icon-f7="floppy_disk" v-if="editMode && isType('text')"></f7-link>
                <f7-link href="false" @click="openWebURL" icon-f7="globe" v-if="isType('text/html') && !editMode && appSettings.hostRootFolder"></f7-link>
                <f7-link href="false" @click="downloadFile" icon-f7="arrow_down_line" v-if="!editMode"></f7-link>
            </f7-nav-right>
        </f7-navbar>

        <!-- Show a photo -->
        <span v-if="isType('image')" class="photo-frame-container">
            <img v-bind:src="fileURL" class="photo-frame">
        </span>

        <!-- Show a pdf -->
        <div v-if="isType('application/pdf')" class="pdf-frame-container">
            <iframe v-bind:src="fileURL + '&embedded=true'" width="100%" height="100%" class="pdf-iframe"></iframe>
        </div>

        <!-- Show a pdf -->
        <div v-if="isType('text/html') && !editMode && appSettings.hostRootFolder" class="html-frame-container">
            <iframe v-bind:src="webURL" width="100%" height="100%" class="html-iframe"></iframe>
        </div>

        <div v-else-if="isType('text/markdown') && !editMode" class="markdown-frame">
            <VueShowdown
                    :markdown="contents"
                    flavor="github"
                    :options="{ emoji: true }"
            ></VueShowdown>
        </div>

        <!-- Text editor -->
        <div v-else-if="isType('text')" class="editor-frame" style="height:100%">
            <v-ace-editor
                    v-model:value="contents"
                    v-bind:readonly="!editMode"
                    @init="editorInit"
                    v-bind:lang="editorMode"
                    theme="kr_theme"
                    v-bind:options="editorOptions"
                    style="height: 100%" />
        </div>

        <!-- In all other cases we do not support a preview -->
        <span v-else style="padding:20px; display: inline-block;">No preview available for this file type.</span>

    </f7-page>
</template>
<script>
    import useFileSystem from "../model/useFileSystem";
    import {ref, watch} from 'vue';
    import {VAceEditor} from 'vue3-ace-editor';
    import {VueShowdown} from 'vue-showdown';
    import 'ace-builds/src-noconflict/mode-javascript';
    import 'ace-builds/src-noconflict/mode-json';
    import 'ace-builds/src-noconflict/mode-html';
    import 'ace-builds/src-noconflict/mode-css';
    import 'ace-builds/src-noconflict/mode-markdown';
    import 'ace-builds/src-noconflict/mode-text';
    import 'ace-builds/src-noconflict/theme-kr_theme';
    import ace from 'ace-builds/src-noconflict/ace';

    const {path, getTextFileContents, saveTextFile, appSettings} = useFileSystem();

    // This is needed to prevent a console error.
    ace.config.set("basePath", "ace-builds/src-noconflict/");

    export default {
        name: 'view-file-panel',
        props: ['selectedFile'],
        components: {
            VAceEditor,
            VueShowdown
        },
        setup(props) {

            const contents = ref('');
            const editorMode = ref('javascript');
            const editorOptions = ref({});
            const fileURL = ref('');
            const webURL = ref('');
            const editMode = ref(false);

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
             * Gets the web address.
             */
            function getWebURL() {
                const settings = appSettings.value;
                if (!settings.baseURL) {
                    console.log('Cannot determine URL: baseURL not specified.');
                    return '';
                }
                const baseURL = settings.baseURL + '/public/';
                return baseURL + getFilePath();
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
                saveTextFile(getFilePath(), contents.value).then(()=>{
                    // On successful save leave the edit mode.
                    editMode.value = false;
                })
            }

            /**
             * Gets the contents of a text file.
             */
            function getContents() {
                if (props.selectedFile) {
                    contents.value = "";
                    getTextFileContents(getFilePath()).then(fileContents =>{
                        if (props.selectedFile.type === 'text/json') {
                            contents.value = JSON.stringify(fileContents, null, 2);
                        } else {
                            contents.value = fileContents ? fileContents : '';
                        }
                    });
                }
            }

            /**
             * Opens this file in a new browser tab.
             */
            function openWebURL() {
                const url = getWebURL();
                window.open(url, '_blank');
            }

            /**
             * Gets the editor mode.
             */
            function getEditorMode() {
                if (props.selectedFile) {
                    let wrap = false;
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
                        case 'text/css':
                            editorMode.value = 'css';
                            break;
                        case 'text/markdown':
                            editorMode.value = 'markdown';
                            wrap = true;
                            break;
                        case 'text/csv':
                            editorMode.value = 'text';
                            break;
                        default:
                            editorMode.value = 'text';
                            wrap = true;
                    }
                    // The way vue3-ace-editor was implemented unfortunately doesn't allow changing the mode
                    // using the 'lang' property. That is because there is no watcher for it.
                    // Luckily the same can be achieved by editing the properties, which does have a watcher.
                    // To see the source code: node_modules/vue3-ace-editor/index.js.
                    editorOptions.value = {
                        'mode' : 'ace/mode/' + editorMode.value,
                        'fontSize' : '16px',
                        'wrap': wrap
                    };
                }
            }
            // We trigger this when the selected file changed.
            watch(() => props.selectedFile, () => {
                fileURL.value = '';
                editMode.value = false;
                webURL.value = getWebURL();
                if (isType('text')) {
                    getEditorMode();
                    getContents();
                } else if (isType('image') || isType('application/pdf')) {
                    window.setTimeout(() => {
                        fileURL.value = getFileURL();
                    }, 100)
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
                isType,
                downloadFile,
                saveFile,
                fileURL,
                contents,
                editorMode,
                editorOptions,
                editMode,
                editorInit,
                webURL,
                appSettings,
                openWebURL
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
    .pdf-frame-container {
        height: 100%;
        overflow: hidden;
    }
    .pdf-iframe {
        border: 0;
    }
    .html-frame-container {
        height: 100%;
        overflow: hidden;
    }
    .html-iframe {
        border: 0;
        background-color: white;
        color: black;
    }
    .markdown-frame {
        padding: 10px;
        font-family: Verdana;
        font-size: 18px;
    }
</style>