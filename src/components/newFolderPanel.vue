<template>
    <f7-page style="background-color:white;">
        <f7-toolbar>
            <div class="left">
                <f7-link sheet-close icon-f7="chevron_left"></f7-link>
            </div>
            <div class="right">
                <f7-button outline sheet-close @click="createNewFolder" :disabled="!valid" style="margin-right: 10px;">Create</f7-button>
            </div>
        </f7-toolbar>
        <f7-list no-hairlines-md>
            <f7-list-input
                    label="Name"
                    type="text"
                    placeholder="Folder name"
                    clear-button
                    error-message="Enter a valid folder name."
                    required
                    validate
                    pattern="([a-zA-Z0-9\s_\\.\-\(\):])+$"
                    :onValidate="(isValid) => {valid = isValid}"
                    v-model:value="folderName"
            ></f7-list-input>
        </f7-list>
    </f7-page>
</template>
<script>
    import {ref} from "vue";
    import useFileSystem from "../model/useFileSystem";
    const {createFolder} = useFileSystem();

    export default {
        name: 'new-folder-panel',
        props: [],
        setup() {
            const folderName = ref(null);
            const valid = ref(false);

            function createNewFolder() {
                if (valid.value) {
                    console.log('Creating folder ' + folderName.value);

                    createFolder(folderName.value).then(()=>{
                        // Reset:
                        folderName.value = null;
                    }).catch((err) => {
                        console.log("Failed to create folder", err);
                        folderName.value = null;
                    });
                }
            }

            return {
                folderName,
                valid,
                createNewFolder
            }
        }
    }
</script>