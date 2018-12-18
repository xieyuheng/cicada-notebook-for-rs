<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>
 import Vue from "vue";
 import VueRouter from "vue-router";

 Vue.use (VueRouter);

 import NoteBook from "./NoteBook.vue";
 import Docs from "./Docs.vue";

 let routes = [
     { path: "/", component: NoteBook },
     { path: "/docs", component: Docs },
 ];

 let router = new VueRouter ({
     // mode: "history",
     // base: __dirname,
     routes,
 })

 export default {
     router,
 }
</script>
