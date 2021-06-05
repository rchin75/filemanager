<template>
    <f7-page style="background-color:white;">
        <f7-toolbar>
            <div class="left">
                <f7-link sheet-close icon-f7="chevron_left"></f7-link>
            </div>
            <div class="right">
                <f7-button outline sheet-close @click="upload" style="margin-right: 10px;">Upload</f7-button>
            </div>
        </f7-toolbar>
        <f7-block-title>Select a file to upload.</f7-block-title>
        <f7-block>
            <form>
                <input type="file" id="upload_file">
            </form>
        </f7-block>
    </f7-page>
</template>
<script>
    import useFileSystem from "../model/useFileSystem";
    const {uploadFile} = useFileSystem();

    export default {
        name: 'upload-file-panel',
        props: [],
        setup() {
            function upload() {
                const file = document.querySelector('#upload_file');
                uploadFile(file);
            }
            return {
                upload
            }
        }
    }
</script>