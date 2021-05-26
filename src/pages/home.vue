<template>
    <f7-page name="home">
        <!-- The NavBar -->
        <f7-navbar title="File Manager">
            <f7-nav-right>
                <f7-link icon-f7="bars" popover-open=".popover-menu"></f7-link>
            </f7-nav-right>
            <f7-subnavbar>
                <div class="breadcrumb">
                    <f7-link class="breadcrumb-link" href="false" @click="onOpen(null)"><f7-icon f7="house"></f7-icon></f7-link>
                    <span class="breadcrumb-separator">/</span>
                    <span v-for="(folder,index) in path" :key="folder">
                        <f7-link class="breadcrumb-link" href="false" @click="onOpenPath(index)">{{folder}}</f7-link>
                        <span class="breadcrumb-separator">/</span>
                    </span>
                </div>
            </f7-subnavbar>
        </f7-navbar>
        <!-- The NavBar menu -->
        <f7-popover class="popover-menu">
            <f7-list>
                <f7-list-item link="/about/" popover-close title="About"></f7-list-item>
                <f7-list-item link="#" popover-close title="Logout"></f7-list-item>
            </f7-list>
        </f7-popover>

        <!-- Page content -->
        <f7-list>
            <f7-list-item
                    v-for="file in files" :key="file.name"
                    v-bind:title="file.name"
                    v-bind:footer="$filters.formatDate(file.updated) + ' , ' + $filters.formatSize(file.size)"
                    swipeout
                    @swipeout:deleted="onDelete(file)"
                    @click="onOpen(file)"
                    link="#">
                <template #media>
                    <f7-icon v-bind:f7="formatFileType(file.type)"></f7-icon>
                </template>
                <f7-swipeout-actions right>
                    <f7-swipeout-button @click="onInfo(file)">Info</f7-swipeout-button>
                    <f7-swipeout-button delete confirm-text="Are you sure you want to delete this item?">Delete</f7-swipeout-button>
                </f7-swipeout-actions>
            </f7-list-item>
        </f7-list>

        <!-- A popup with file details. -->
        <f7-popup class="file-details-popup" :opened="popupOpened" @popup:closed="popupOpened = false">
            <f7-page>
                <f7-navbar v-bind:title="selectedFile ? selectedFile.name : ''">
                    <f7-nav-right>
                        <f7-link popup-close>Close</f7-link>
                    </f7-nav-right>
                </f7-navbar>
                <f7-list>
                    <f7-list-item
                            header="Size"
                            v-bind:title="selectedFile ? $filters.formatSize(selectedFile.size): ''"
                    ></f7-list-item>
                    <f7-list-item
                            header="Type"
                            v-bind:title="selectedFile ? selectedFile.type : ''"
                    ></f7-list-item>
                    <f7-list-item
                            header="Created"
                            v-bind:title="selectedFile ?  $filters.formatDate(selectedFile.created) : ''"
                    ></f7-list-item>
                    <f7-list-item
                            header="Updated"
                            v-bind:title="selectedFile ?  $filters.formatDate(selectedFile.updated) : ''"
                    ></f7-list-item>
                    <f7-list-item
                            header="Last accessed"
                            v-bind:title="selectedFile ?  $filters.formatDate(selectedFile.accessed) : ''"
                    ></f7-list-item>
                    <f7-list-item
                            header="Owner"
                            v-bind:title="selectedFile ?  selectedFile.owner : ''"
                    ></f7-list-item>
                </f7-list>
            </f7-page>
        </f7-popup>

    </f7-page>
</template>
<script>
    import useFileSystem from "../model/useFileSystem";
    import {ref} from "vue";
    import { onMounted } from 'vue';

    const {files, path, listFiles} = useFileSystem();

    const popupOpened = ref(false);

    const selectedFile = ref(null);

    /**
     * Determines the icon for the file.
     * @return The icon to use.
     */
    function formatFileType(type) {
        let icon;
        switch (type) {
            case 'image/jpeg':
            case 'image/png':
            case 'image/gif':
                icon = 'photo';
                break;
            case 'text/plain':
            case 'text/html':
            case 'text/javascript':
            case 'text/markdown':
            case 'text/json':
                icon = 'doc_plaintext';
                break;
            case 'application/msword':
            case 'application/pdf':
                icon = 'doc_richtext';
                break;
            case 'folder':
                icon = 'folder';
                break;
            default:
                icon = 'doc';
        }

        return icon;
    }

    /**
     * Opens a file or folder.
     * @param file The selected file.
     */
    function onOpen(file) {
        if (!file) {
            // If no file was provided we open the root folder.
            listFiles();
        } else if (file.type === 'folder') {
            const folderPath = path.value.join('/') + '/' + file.name;
            listFiles(folderPath);
        } // else open file
    }

    /**
     * Opens the path based on the path index.
     * @param {number} index The index.
     */
    function onOpenPath(index) {
        let folderPath = '';
        for (let i=0; i<=index; i++) {
            folderPath += '/' + path.value[i]
        }
        console.log('index', index);
        console.log('folderPath', folderPath);
        listFiles(folderPath);
    }

    /**
     * Shows details about the selected file.
     * @param file The selected file.
     */
    function onInfo(file) {
        console.log('Info for file', file);
        selectedFile.value = file;
        popupOpened.value = true;
    }

    /**
     * Deletes the selected file.
     * @param file The selected file.
     */
    function onDelete(file) {
        console.log('Delete file', file);
    }

    export default {
        props: {},
        setup() {
            onMounted(() => {
                console.log('mounted!')
                listFiles();
            });

            return {
                files,
                path,
                formatFileType,
                onOpen,
                onDelete,
                onInfo,
                onOpenPath,
                popupOpened,
                selectedFile
            };
        }
    }
</script>
<style scoped>
    .page {
        background-color: #eeeeee;
    }
    .breadcrumb {
        font-size: 16px;
    }
    .breadcrumb .breadcrumb-separator {
        float: left;
        box-sizing: border-box;
        align-content: center;
        align-items: center;
        line-height: 48px;
    }
    .breadcrumb .breadcrumb-link {
        float:left;
        padding-left: 5px !important;
        padding-right: 5px !important;
    }
</style>