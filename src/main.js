import saveAs from "file-saver"
let cicada = import ("cicada-wasm")

let note_book_elm = document.getElementById ("note-book")
// let nav_bar = document.getElementById ("nav-bar")
// let menu_bar = document.getElementById ("menu-bar")
let toc_button = document.getElementById ("toc-button")
let load_button = document.getElementById ("load-button")
let load_input = document.getElementById ("load-input")
let title = document.getElementById ("title")
let save_button = document.getElementById ("save-button")
let note_list_elm = document.getElementById ("note-list")
let note_href_list_elm = document.getElementById ("note-href-list")

function toggle_class (node, name) {
  let class_string = node.getAttribute ("class")
  let class_list = []
  if (class_string != null) {
    class_list = class_string.split (" ")
  }
  if (class_list.includes (name)) {
    class_list = class_list
      .filter ((x => x != name))
  } else {
    class_list.push (name)
  }
  node.setAttribute (
    "class",
    class_list.join (" "))
  return node
}

function elm (tag, attr, body) {
  let node = document.createElement (tag)
  if (attr !== undefined) {
    for (let k in attr) {
      node.setAttribute (k, attr [k])
    }
  }
  if (body !== undefined) {
    for (let x of body) {
      if (typeof x == "string") {
        node.appendChild (document.createTextNode (x))
      } else {
        node.appendChild (x)
      }
    }
  }
  return node
}

toc_button.addEventListener ("click", (event) => {
  toggle_class (note_book_elm, "toc")
})

let note_counter = 0

class note_t {
  constructor () {
    this.input = elm ("textarea", {
      "class": "input",
      "spellcheck": "false",
      "wrap": "off",
      "rows": "18",
    })

    this.output = elm ("pre", {
      "class": "output",
    })

    this.headline = elm ("input", {
      "class": "headline",
      "type": "text",
      "size": "16",
      "placeholder": "<headline>",
    })

    this.id = note_counter++

    this.default_headline = "#" + this.id.toString ()

    this.href_name = elm ("p", {
    }, [this.default_headline])

    this.href = elm ("a", {
      "href": this.default_headline,
    }, [this.href_name])

    this.set_headline (this.default_headline)

    this.headline.oninput = (event) => {
      this.set_headline (event.target.value)
    }

    this.del_button = elm ("button", {
      "class": "button",
    }, ["DEL"])

    this.run_button = elm ("button", {
      "class": "button",
    }, ["RUN"])

    this.new_button = elm ("button", {
      "class": "button",
    }, ["NEW"])

    this.head = elm ("p", {}, [
      this.headline,
      this.del_button,
      this.new_button,
      this.run_button,
    ])

    this.elm = elm ("div", {
      "class": "note",
      "id": this.id.toString (),
    }, [
      this.head,
      this.input,
      this.output,
      elm ("hr"),
    ])

    this.elm.com = this

    this.run_button.onclick = () => {
      cicada.then ((cicada) => {
        let module = cicada.CicadaModule.new ()
        let list = this.elm.parentNode.childNodes
        for (let e of Array.from (list)) {
          e.com.set_output_text (
            module.run (e.com.input.value))
          if (this.elm.isSameNode (e)) {
            this.input.focus ()
            return
          }
        }
      })
    }

    this.new_button.onclick = () => {
      let note = new note_t ()
      this.elm
        .insertAdjacentElement ("afterend", note.elm)
      this.href
        .insertAdjacentElement ("afterend", note.href)
      note.run_button.click ()
    }

    this.del_button.onclick = () => {
      let list = this.elm.parentNode.childNodes
      if (list.length == 1) {
        this.input.value = ""
        this.set_output_text ("")
      } else {
        let remain_elm =
          this.elm.nextSibling ||
          this.elm.previousSibling
        if (remain_elm) {
          remain_elm.com.input.focus ()
        }
        this.remove ()
      }
    }

    this.input.onkeydown = (event) => {
      if (event.key == "Enter" && event.ctrlKey) {
        this.run_button.click ()
      }
      if (event.key == "Enter" && event.altKey) {
        this.new_button.click ()
      }
    }
  }

  set_output_text (text) {
    let text_node = document.createTextNode (text)
    if (this.output.childNodes.length == 0) {
      this.output.appendChild (
        text_node)
    } else {
      this.output.childNodes [0] .replaceWith (
        text_node)
    }
  }

  set_headline (text) {
    this.headline.value = text
    this.set_href_name (text)
  }

  set_href_name (text) {
    let text_node = document.createTextNode (text)
    if (this.href_name.childNodes.length == 0) {
      this.href_name.appendChild (
        text_node)
    } else {
      this.href_name.childNodes [0] .replaceWith (
        text_node)
    }
  }

  remove () {
    this.elm.remove ()
    this.href.remove ()
  }
}

// [ headline, line, ... ]
function code_to_block_list (code) {
  let lines = code.split ("\n")
  let block_list = []
  while (lines.length !== 0) {
    let line = lines.shift ()
    let prefix = "//// "
    if (line.startsWith (prefix)) {
      let headline = line.slice (prefix.length, line.length)
      block_list.push ([headline])
      let next = lines.shift ()
      if (next.length !== 0) {
        lines.unshift (next)
      }
    } else {
      let block = block_list.pop ()
      if (block) {
        block.push (line)
        block_list.push (block)
      }
    }
  }
  return block_list
}

load_button.onclick = () => {
  load_input.click ()
}

load_input.onchange = (event) => {
  let file = event.target.files [0]
  console.log (`- loading file`)
  console.log (`  name = ${file.name}`)
  console.log (`  size = ${file.size}`)
  let reader = new FileReader ()
  reader.readAsText (file)
  reader.onload = (e) => {
    load (file.name, e.target.result)
  }

}

function load (name, code) {
  let block_list = code_to_block_list (code)
  if (block_list.length == 0) {
    window.alert (`fail to load ${name}`)
  } else {
    title.value = name
    for (let x of Array.from (note_list_elm.childNodes)) {
      x.com.remove ()
    }
    let first_block = block_list.shift ()
    let first_note = new note_t ()
    first_note.set_headline (first_block.shift ())
    first_note.input.value = first_block.join ("\n")
    note_list_elm.appendChild (first_note.elm)
    note_href_list_elm.appendChild (first_note.href)
    for (let block of block_list) {
      let note = new note_t ()
      note.set_headline (block.shift ())
      note.input.value = block.join ("\n")
      note_list_elm.appendChild (note.elm)
      note_href_list_elm.appendChild (note.href)
    }
  }
}

function note_list_to_code (note_list) {
  let code = ""
  note_list.forEach ((elm, index) => {
    let note = elm.com
    code += "//// "
    if (note.headline.value) {
      code += note.headline.value
    } else {
      code += "#" + index.toString ()
    }
    code += "\n"
    code += "\n"
    code += note.input.value
    code += "\n"
  })
  return code
}

save_button.onclick = () => {
  let code = note_list_to_code (
    Array.from (note_list_elm.childNodes))
  let blob = new Blob (
    [ code ],
    { type: "text/plaincharset=utf-8" })
  saveAs (blob, title.value)
}

let first_note = new note_t ()
note_list_elm.appendChild (first_note.elm)
note_href_list_elm.appendChild (first_note.href)
title.value = "untitled.cic"
