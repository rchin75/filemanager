<template>
    <f7-page style="background-color:white;">
        <f7-toolbar>
            <div class="left">
                <f7-link sheet-close icon-f7="chevron_left"></f7-link>
            </div>
            <div class="right">
                <f7-button outline sheet-close @click="createFile" :disabled="!valid" style="margin-right: 10px;">Create</f7-button>
            </div>
        </f7-toolbar>
        <f7-list no-hairlines-md>
            <f7-list-input
                    label="Name"
                    type="text"
                    placeholder="File name"
                    clear-button
                    error-message="Enter a valid file name."
                    required
                    validate
                    pattern="([a-zA-Z0-9\s_\\.\-\(\):])+(.txt|.html|.js|.json|.md|.csv)$"
                    :onValidate="(isValid) => {valid = isValid}"
                    v-model:value="fileName"
            ></f7-list-input>
        </f7-list>
    </f7-page>
</template>
<script>
    import {ref} from "vue";
    import { f7 } from 'framework7-vue';
    import useFileSystem from "../model/useFileSystem";
    const {createTextFile} = useFileSystem();

    export default {
        name: 'new-file-panel',
        props: ['type'],
        setup() {
            const fileName = ref(null);
            const valid = ref(false);

            function createFile() {
                if (valid.value) {
                    console.log('Creating file ' + fileName.value);

                    createTextFile(fileName.value).then(()=>{
                        // Reset:
                        fileName.value = null;
                    }).catch((err) => {
                        console.log("Failed to create file", err);
                        fileName.value = null;
                        f7.preloader.hide();
                    });
                }
            }

            return {
                fileName,
                valid,
                createFile
            }
        }
    }
</script>