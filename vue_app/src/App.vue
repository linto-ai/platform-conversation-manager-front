<template>
  <div id="app">
    <AppVerticalNavigation></AppVerticalNavigation>
    <div id="app-view" class="flex col flex1">
      <AppHeader></AppHeader>
      <router-view class="app-view-content flex1"></router-view>
    </div>
  </div>

</template>
<script>
  import AppHeader from '@/components/AppHeader.vue'
  import AppVerticalNavigation from '@/components/AppVerticalNavigation.vue'
  export default {
    data () {
      return {}
    },
    components: {
      AppHeader,
      AppVerticalNavigation
    }
  }
</script>
