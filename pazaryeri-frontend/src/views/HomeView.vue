<template>
  <div>
    <ProductList />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useProductStore } from '@/stores/counter';
import ProductList from '@/components/ProductList.vue';

</script>

<style scoped>
</style>
