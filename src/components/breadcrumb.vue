<template>
    <div class="breadcrumb">
        <f7-link class="breadcrumb-link" href="false" @click="onOpenRoot()"><f7-icon f7="house"></f7-icon></f7-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-shortener" v-if="shortened">../</span>
        <span v-for="(folder,index) in shortPath" :key="folder">
            <f7-link class="breadcrumb-link" href="false" @click="onOpenPath(index)">{{folder}}</f7-link>
            <span class="breadcrumb-separator">/</span>
        </span>
    </div>
</template>
<script>
    import {ref, watch} from "vue";
    import useFileSystem from "../model/useFileSystem";
    const {path, listFiles} = useFileSystem();
    /** The max. number of path items to show. */
    const itemsToShow = 2;

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
        for (let i=0; i<=index + getStart(); i++) {
            folderPath += '/' + path.value[i]
        }
        listFiles(folderPath);
    }

    /**
     * Gets the start index for the path to show.
     */
    function getStart() {
        return path.value.length <= itemsToShow ? 0 : path.value.length - itemsToShow;
    }

    export default {
        name: 'breadcrumb',
        props: {},
        setup() {

            // Determine the shortened path to make sure it fits in the screen.
            const shortPath = ref([]);
            const shortened = ref(false);
            watch(() => path.value, () => {
                const items = path.value;
                shortPath.value.length = 0;
                const start = getStart();
                shortened.value = start > 0 ? true : false;
                for (let i=start; i < items.length; i++) {
                    shortPath.value.push(items[i]);
                }
            });

            return {
                shortPath,
                shortened,
                onOpenRoot,
                onOpenPath
            }
        }
    }
</script>
<style scoped>
    .breadcrumb {
        font-size: 16px;
        height: 100%;
    }
    .breadcrumb .breadcrumb-separator,
    .breadcrumb .breadcrumb-shortener {
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