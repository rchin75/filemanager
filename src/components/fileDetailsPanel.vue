<template>
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
</template>
<script>
    export default {
        name: 'file-details-panel',
        props: ['selectedFile']
    }
</script>