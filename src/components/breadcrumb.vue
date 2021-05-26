<template>
    <div class="breadcrumb">
        <f7-link class="breadcrumb-link" href="false" @click="onOpenRoot()"><f7-icon f7="house"></f7-icon></f7-link>
        <span class="breadcrumb-separator">/</span>
        <span v-for="(folder,index) in path" :key="folder">
            <f7-link class="breadcrumb-link" href="false" @click="onOpenPath(index)">{{folder}}</f7-link>
            <span class="breadcrumb-separator">/</span>
        </span>
    </div>
</template>
<script>
    import useFileSystem from "../model/useFileSystem";
    const {path, listFiles} = useFileSystem();

    /**
     * Opens the root folder.
     */
    function onOpenRoot() {
        listFiles();
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
        listFiles(folderPath);
    }

    export default {
        name: 'breadcrumb',
        props: {},
        setup() {
            return {
                path,
                onOpenRoot,
                onOpenPath
            }
        }
    }
</script>
<style scoped>
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