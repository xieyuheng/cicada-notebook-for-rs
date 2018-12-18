<template>
    <div class="MenuBar">
        <button class="button" @click="$emit ('toc')">
            #
        </button>
        <button class="button" @click="click_load">
            LOAD
        </button>
        <input ref="load"
               type="file"
               accept=".cic"
               style="display: none"
               @change="load_file ($event)"
        >
        <button class="button" @click="$emit ('save')">
            SAVE
        </button>
        <button class="button">
            <router-link to="/docs">
                DOCS
            </router-link>
        </button>
        <input class="title"
               spellcheck="false"
               type="text"
               v-model="state.title"
               placeholder="<title>.cic"
               @change="$emit ('title_change', state.title)"
        />
    </div>
</template>

<script>
 import Vue from "vue";

 export default {
     props: [
         "title",
     ],
     data () {
         return {
             state: {
                 title: this.title,
             }
         }
     },
     methods: {
         click_load () {
             this.$refs.load.click ();
         },
         load_file (event) {
             let file = event.target.files [0];
             let reader = new FileReader ();
             console.log (`- loading file`);
             console.log (`  name = ${file.name}`);
             console.log (`  size = ${file.size}`);
             this.state.title = file.name;
             reader.readAsText (file);
             reader.onload = e => {
                 this.$emit ("load", {
                     title: file.name,
                     code: e.target.result,
                 });
             };
         }
     }
 };
</script>

<style scoped>
 .MenuBar {
     position: sticky;
     top: 0;
 }

 .title {
     font-size: 1em;
     border: 0px;
     border-left: 2px dashed;
     background-color: white;
     padding-left: 0.2em;
     padding-right: 0.2em;
     width: available;
 }

 .button {
     font-size: 1em;
     border: 0px;
     background-color: white;
 }

 a {
     text-decoration: none;
     color: black;
 }
</style>
