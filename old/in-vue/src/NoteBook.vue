<template>
    <div class="NoteBook"
         :class="{ toc: state.toc_p }">
        <NavBar :headlines="headlines" />
        <div class="content">
            <MenuBar
                :title="state.title"
                @toc="toggle_toc"
                @load="load ($event)"
                @save="save"
                @title_change="change_title ($event)"
            />
            <div>
                <Note
                    v-for="(note, index) in state.note_list"
                    ref="note_list"
                    :key="note.unique_id"
                    :id="index.toString ()"
                    :headline="note.headline"
                    :index="index"
                    :input="note.input"
                    :output="note.output"
                    @input_change="change_input (index, $event)"
                    @headline_change="change_headline (index, $event)"
                    @headline_enter="enter_headline (index)"
                    @run="run_note ($event)"
                    @new="set_new_note ($event)"
                    @del="del_note ($event)"
                    @focus="set_focus ($event)"
                />
            </div>
        </div>
    </div>
</template>

<script>
 import Vue from "vue";
 import Note from "./Note.vue";
 import NavBar from "./NavBar.vue";
 import MenuBar from "./MenuBar.vue";

 import saveAs from "file-saver";
 const cicada = import ("cicada-wasm");

 import cic from "./cic.js";

 const init_note_list = [
     { unique_id: 0, headline: "#0", input: "", output: "" },
 ];

 export default {
     components: {
         Note,
         NavBar,
         MenuBar,
     },

     // note_t: {
     //     unique_id: "number",
     //     headline: "string",
     //     input: "string",
     //     output: "string",
     // },

     data () {
         return {
             state: {
                 title: "untitled.cic",
                 note_list: init_note_list,
                 focus: 0,
                 counter: init_note_list.length,
                 toc_p: false,
             },
         }
     },

     computed: {
         headlines () {
             return this.state.note_list.map ((note, index) => {
                 return note.headline;
             });
         },
     },

     methods: {
         change_input (index, input) {
             let note = this.state.note_list [index];
             note.input = input;
         },

         change_headline (index, headline) {
             // we need should not update page here
             //   because after updated
             ///  the focus will be set to state.focus
             this.set_focus (index);
             let note = this.state.note_list [index];
             note.headline = headline;
         },

         enter_headline (index) {
             // note that, after updated
             ///  the focus will be set to state.focus
             this.set_focus (index);
             let note = this.state.note_list [index];
             Vue.set (this.state.note_list, index, note);
             // can not even use `this.$forceUpdate ()` here
             //   because only effect on this.state.note_list
             //   will fire `this.headlines ()`
         },

         run_note (index) {
             cicada.then (cicada => {
                 let module = cicada.CicadaModule.new ();
                 let list = this.state.note_list;
                 list.forEach ((note, i) => {
                     if (i <= index) {
                         note.output = module.run (note.input);
                     }
                 });
                 this.state.note_list = list.slice (0, list.length);
             })
         },

         new_id () {
             this.state.counter += 1;
             console.log (`new_id : ${this.state.counter}`);
             return this.state.counter;
         },

         // if run `NEW` so fast
         // it is possible to get notes
         //   with different index
         //   but the same headline
         new_note (index) {
             return {
                 unique_id: this.new_id (),
                 headline: "#" + (index.toString ()),
                 input: "",
                 output: "",
             }
         },

         set_new_note (index) {
             this.run_note (index);
             let list = this.state.note_list;
             let ante = list.slice (0, index + 1);
             let succ = list.slice (index + 1, list.length);
             ante.push (this.new_note (index + 1));
             succ.forEach ((note) => {
                 note.index += 1;
             });
             this.state.note_list = ante.concat (succ);
             this.set_focus (index + 1);
         },

         set_focus (index) {
             this.state.focus = index;
         },

         del_note (index) {
             let list = this.state.note_list;
             console.log (list);
             if (list.length == 1) {
                 this.state.note_list = [{
                     unique_id: this.new_id (),
                     headline: "#0",
                     input: "",
                     output: "",
                 }];
                 this.set_focus (0);
                 return;
             }
             let ante = list.slice (0, index);
             let succ = list.slice (index + 1, list.length);
             succ.forEach ((note) => {
                 note.index -= 1;
             });
             this.state.note_list = ante.concat (succ);
             let length = this.state.note_list.length;
             if (index == length) {
                 this.set_focus (index - 1);
             } else {
                 this.set_focus (index);
             }
         },

         toggle_toc () {
             if (this.state.toc_p) {
                 this.state.toc_p = false;
             } else {
                 this.state.toc_p = true;
             }
         },

         load ({ title, code }) {
             let block_list = cic.code_to_block_list (code);
             if (block_list.length == 0) {
                 console.log (`fail to load ${title}`);
                 this.state.note_list = [{
                     unique_id: this.new_id (),
                     headline: "#0",
                     input: `// fail to load ${title}\n` +
                            `// no //// sections in file\n`,
                 }];
                 this.state.title = title;
                 this.state.focus = 0;
             } else {
                 let note_list = [];
                 for (let block of block_list) {
                     note_list.push ({
                         unique_id: this.new_id (),
                         headline: block.shift (),
                         input: block.join ("\n"),
                     });
                 }
                 this.state.note_list = note_list;
                 this.state.title = title;
                 this.state.focus = 0;
             }
         },

         save () {
             let code = cic.note_list_to_code (
                 this.state.note_list);
             let blob = new Blob (
                 [ code ],
                 { type: "text/plain;charset=utf-8" });
             saveAs (blob, this.state.title);
         },

         change_title (title) {
             this.state.title = title;
         },
     },

     updated () {
         // we need to set focus in after updated
         //   because before that
         //   the dom we want to focus on is not created yet
         // we can not just index the array of components
         //   because it is not ordered by index
         for (let note of this.$refs.note_list) {
             if (note.index == this.state.focus) {
                 note.focus ();
             }
         }
     },
 }
</script>

<style scoped>
 NoteBook {
     color: black;
     background-color: white;
 }

 .content {
     margin-left: 0%;
     transition: margin-left .5s ease .2s;
 }

 .NavBar {
     width: 0%;
     transition: width .5s ease .2s;
 }

 .toc .content {
     margin-left: 18%;
     transition: margin-left .5s ease .2s;
 }

 .toc .NavBar {
     width: 18%;
     transition: width .5s ease .2s;
 }
</style>
