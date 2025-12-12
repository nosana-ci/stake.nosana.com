<template>
  <div id="app">
    <section class="columns ml-0 mr-0 mt-0 mb-0">
      <div
        id="content"
        class="column has-navbar-fixed-top-mobile ultrawide-centered"
      >
        <div class="section">
          <div>
            <slot />
          </div>
        </div>
        <site-footer class="mt-auto" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
#content {
  min-height: 100vh;
  max-width: 1600px;
  min-width: 0;
}

.ultrawide-centered {
  margin-left: auto;
  margin-right: auto;
  padding-left: 2rem;
  padding-right: 2rem;
}
</style>
