// [ headline, line, ... ]
function code_to_block_list (code) {
    let lines = code.split ("\n");
    let block_list = [];
    while (lines.length !== 0) {
        let line = lines.shift ();
        let prefix = "//// ";
        if (line.startsWith (prefix)) {
            let headline = line.slice (prefix.length, line.length);
            block_list.push ([headline]);
            let next = lines.shift ();
            if (next.length !== 0) {
                lines.unshift (next);
            }
        } else {
            let block = block_list.pop ();
            if (block) {
                block.push (line);
                block_list.push (block);
            }
        }
    }
    return block_list;
}

function note_list_to_code (note_list) {
    let code = "";
    note_list.forEach ((note, index) => {
        code += "//// ";
        if (note.headline) {
            code += note.headline;
        } else {
            code += "# ";
            code += index.toString ();
        }
        code += "\n";
        code += "\n";
        code += note.input;
        code += "\n";
    });
    return code;
}

export default {
    code_to_block_list,
    note_list_to_code,
}
