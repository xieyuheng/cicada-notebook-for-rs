<template>
    <div class="NavBar">
        <a v-for="(headline, index) in headlines"
           :href="'#' + index.toString ()">
            <p>{{ headline }}</p>
        </a>
    </div>
</template>

<script>
 import Vue from "vue";

 export default {
     props: [
         "headlines",
     ],
 }
</script>

<style scoped>
 .NavBar {
     position: fixed;
     left: 0;
     top: 0;
     bottom: 0;
     overflow-y: auto;
     border: 0px;
     font-size: 0.875em;
     text-align: center;
 }

 a {
     text-decoration: none;
     color: black;
 }

 a:visited {
     color: black;
 }
</style>
