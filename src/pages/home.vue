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
                <f7-list-item link="#" popover-close title="New file" @click="newFileOpened = true"></f7-list-item>
                <f7-list-item link="#" popover-close title="New folder" @click="newFolderOpened = true"></f7-list-item>
            </f7-list>
        </f7-popover>
        <!-- The NavBar menu -->
        <f7-popover class="popover-menu">
            <f7-list>
                <f7-list-item link="/about/" popover-close title="About"></f7-list-item>
                <f7-list-item link="#" @click="onLogout" popover-close title="Logout"></f7-list-item>
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
                    @swipeout:open="swipingOut = true"
                    @swipeout:closed="swipingOut = false"
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
        <f7-popup theme-dark color-theme="orange"
                class="file-details-popup"
                :opened="popupOpened"
                @popup:closed="popupOpened = false">
            <file-details-panel v-bind:selected-file="selectedFile"></file-details-panel>
        </f7-popup>

        <!-- A popup to view a file. -->
        <f7-popup tablet-fullscreen theme-dark color-theme="orange"
                  :animate = "false"
                  class="file-details-popup"
                  :opened="viewFilePanelOpened"
                  @popup:closed="viewFilePanelOpened = false"
        >
            <view-file-panel v-bind:selected-file="selectedFile"></view-file-panel>
        </f7-popup>

        <!-- Form to create a new file. -->
        <f7-sheet  class="new-file-sheet" :opened="newFileOpened" @sheet:closed="newFileOpened = false">
           <new-file-panel></new-file-panel>
        </f7-sheet>

        <!-- Form to create a new folder. -->
        <f7-sheet  class="new-folder-sheet" :opened="newFolderOpened" @sheet:closed="newFolderOpened = false">
            <new-folder-panel></new-folder-panel>
        </f7-sheet>

    </f7-page>
</template>
<script>
    import useFileSystem from "../model/useFileSystem";
    import {ref, watch} from "vue";
    import { onMounted } from 'vue';
    import Breadcrumb from "../components/breadcrumb";
    import FileDetailsPanel from "../components/fileDetailsPanel";
    import ViewFilePanel from "../components/viewFilePanel";
    import useAuthentication from "../model/useAuthentication";
    import NewFilePanel from "../components/newFilePanel";
    import NewFolderPanel from "../components/newFolderPanel";
    const {logout, user} = useAuthentication();
    const {files, path, listFiles, deleteFile} = useFileSystem();

    /** True to open the file details popup. */
    const popupOpened = ref(false);

    /** True to open the file panel. */
    const viewFilePanelOpened = ref(false);

    /** True if performing a swipe out on a file. */
    const swipingOut = ref(false);

    const newFileOpened = ref(false);
    const newFolderOpened = ref(false);

    /** Keeps track of the selected file, */
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
        // Prevent opening the file when in swipe out mode.
        if (swipingOut.value) {
            return;
        }
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
        const filePath = path.value.join('/') + '/' + file.name;
        deleteFile(filePath).then( () => {
            swipingOut.value = false;
        }).catch(()=>{
            swipingOut.value = false;
        });
    }

    // When the path changes we must reset the selectedFile otherwise errors will result because file and path don't match.
    watch(() => path.value, () => {
        selectedFile.value = null;
    });

    export default {
        components: {NewFolderPanel, NewFilePanel, ViewFilePanel, FileDetailsPanel, Breadcrumb},
        props: {
            f7router: Object
        },
        setup(props) {
            onMounted(() => {
                console.log('mounted!');
                // Login if no user, otherwise list the files.
                if (!user || !user.value) {
                    // Timeout is needed to prevent F7 render errors.
                    window.setTimeout(function(){
                        props.f7router.navigate('/login');
                    }, 100);
                } else {
                    // Timeout is needed to prevent F7 render errors.
                    window.setTimeout(function(){
                        listFiles();
                    }, 100);
                }
            });

            /**
             * Logout.
             */
            function onLogout() {
                logout().then(()=>{
                    props.f7router.navigate('/login');
                });
            }

            return {
                files,
                path,
                formatFileType,
                onOpen,
                onDelete,
                onInfo,
                onLogout,
                popupOpened,
                viewFilePanelOpened,
                selectedFile,
                swipingOut,
                newFileOpened,
                newFolderOpened
            };
        }
    }
</script>
<style scoped>
    .page {
        background-color: #333333;
    }
</style>