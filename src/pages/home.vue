<template>
    <f7-page name="home">
        <!-- The NavBar -->
        <f7-navbar title="File Manager">
            <f7-nav-right>
                <f7-link icon-f7="plus" popover-open=".action-menu"></f7-link>
                <f7-link icon-f7="bars" popover-open=".popover-menu"></f7-link>
            </f7-nav-right>
            <f7-subnavbar>
                <breadcrumb></breadcrumb>
            </f7-subnavbar>
        </f7-navbar>
        <!-- The action menu in the navbar -->
        <f7-popover class="action-menu">
            <f7-list>
                <f7-list-item link="#" popover-close title="New file"></f7-list-item>
                <f7-list-item link="#" popover-close title="New folder"></f7-list-item>
            </f7-list>
        </f7-popover>
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
            <file-details-panel v-bind:selected-file="selectedFile"></file-details-panel>
        </f7-popup>

        <!-- A popup to view a file. -->
        <f7-popup tablet-fullscreen
                  :animate = "false"
                  class="file-details-popup"
                  :opened="viewFilePanelOpened"
                  @popup:closed="viewFilePanelOpened = false"
        >
            <view-file-panel v-bind:selected-file="selectedFile"></view-file-panel>
        </f7-popup>

    </f7-page>
</template>
<script>
    import useFileSystem from "../model/useFileSystem";
    import {ref, watch} from "vue";
    import { onMounted } from 'vue';
    import Breadcrumb from "../components/breadcrumb";
    import FileDetailsPanel from "../components/fileDetailsPanel";
    import ViewFilePanel from "../components/viewFilePanel";

    const {files, path, listFiles} = useFileSystem();

    const popupOpened = ref(false);
    const viewFilePanelOpened = ref(false);

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
        } else {
            // View the selected file.
            selectedFile.value = file;
            viewFilePanelOpened.value = true;
        }
    }

    /**
     * Shows details about the selected file.
     * @param file The selected file.
     */
    function onInfo(file) {
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

    // When the path changes we must reset the selectedFile otherwise errors will result because file and path don't match.
    watch(() => path.value, () => {
        selectedFile.value = null;
    });

    export default {
        components: {ViewFilePanel, FileDetailsPanel, Breadcrumb},
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
                popupOpened,
                viewFilePanelOpened,
                selectedFile
            };
        }
    }
</script>
<style scoped>
    .page {
        background-color: #eeeeee;
    }
</style>