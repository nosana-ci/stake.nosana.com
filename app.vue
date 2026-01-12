<template>
  <div>
    <NuxtLayout>
      <NuxtPwaManifest />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Nosana Stake',
  ogTitle: 'Nosana Stake',
  twitterTitle: 'Nosana Stake',
  description: 'Stake NOS and earn rewards',
  ogDescription: 'Stake NOS and earn rewards',
  twitterDescription: 'Stake NOS and earn rewards',
  ogImage: 'https://stake.nosana.com/img/screenshot.png',
  twitterImage: 'https://stake.nosana.com/img/screenshot.png',
  twitterCard: 'summary_large_image'
})

useHead({
  htmlAttrs: {
    lang: 'en'
  },
  link: [
    {
      rel: 'icon',
      type: 'image/ico',
      href: '/favicon.ico',
      sizes: 'any'
    }
  ]
})

</script>