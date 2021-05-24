<template>
  <f7-app v-bind="f7params">

    <f7-view main url="/"></f7-view>

  </f7-app>
</template>

<script>
import routes from './routes.js';

export default {
  data() {
    return {
      f7params: {
        routes,
        name: 'File Manager',
        id: 'nl.roychin.filemanager'
      }
    }
  }
}

</script>

<style>

</style>
