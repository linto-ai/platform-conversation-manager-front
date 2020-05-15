<template>
  <div id="app-header" class="flex row">
    <div class="user-menu flex row">
      <span class="user-menu--name">John Doe</span>
      <button href="#" class="user-menu-btn">
        <span class="user-menu-btn--img"></span>
        <span class="user-menu-btn--arrow flex col" :class="userMenuOpened ? 'user-menu-btn--arrow__opened' : 'user-menu-btn--arrow__closed'"></span>
        <div class="user-menu-links" :class="userMenuOpened ? 'user-menu-links__opened' : 'user-menu-links__closed'">
          <a class="user-menu-links--item" href="#">Disconnect</a>
        </div>
      </button>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      userMenuOpened: false
    }
  }
}
</script>