// Wait for document ready.
document.addEventListener('DOMContentLoaded', function() {

  // Only add library if playground is detected.
  let playgrounds = document.querySelectorAll('pre.language-playground');
  if(playgrounds[0]) {

    const siteRoot = document.body.dataset.siteRoot;

    require.config({ paths: { 'vs': siteRoot + '/scripts/monaco-editor/min/vs' }});

    require(['vs/editor/editor.main'], function() {

      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2016,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        typeRoots: ["node_modules/@types"]
      });

      let imports = {};
      for(let i = 0, len = playgrounds.length; i < len; ++i) {

        let lines = playgrounds[i].innerText.split("\n");
        for(let i = 0; i < lines.length; ++i) {
          if(lines[i].includes("import") && lines[i].includes("from")) {

            // Last word is imported from _module_.
            let module = lines[i].split(" ").splice(-1)[0].replace(/['";]+/g, '');
            if(imports[module]) {
              continue;
            }
            else {
              imports[module] = true;
              fetch(siteRoot + '/scripts/' + module + '.d.ts')
                .then(function(response) {
                  return response.text();
                })
              .then(function(text) {
                try {
                  monaco.languages.typescript.typescriptDefaults.addExtraLib(text, 'node_modules/@types/' + module + '.d.ts');
                }
                catch(e) {
                  console.log(e);
                }
              });
            }
          }
        }

        /* Canvas omit for now.
           fetch('')
           .then(function(response) {
           return response.text();
           })
           .then(function(text) {
           monaco.languages.typescript.typescriptDefaults.addExtraLib(`function print(x:any):void{} function print2(...data: any[]):void{}`, 'print.ts');
           });
           */

        let jsCode = playgrounds[i].innerText;

        playgrounds[i].parentNode.innerHTML = `
          <div class="ts-playgrounds">
            <div class="problem" style="color:white;"> problem </div>
            <div class="container-wrapper"> 
            <div class="border">
            <button class="runButton">Run</button>
            <button class="restart"> Restart </button>
            </div>
            <div class="playground-container" ></div>
            <iframe class="output" > </iframe>
            </div>
          </div>
          `;

        let monEditor = monaco.editor.create(document.getElementsByClassName("playground-container")[i], {
          model: monaco.editor.createModel(jsCode,"typescript", new monaco.Uri("ts-main-" + i + ".ts")), 
          wordWrap: "bounded",
          language: "typescript",
          minimap: {
            enabled: false
          }
        });


        function isError(decorations){
          if(decorations.options.className === "squiggly-error"){
            var msg = JSON.stringify(monaco.editor.getModelMarkers({}));
            var nonJSON = monaco.editor.getModelMarkers({});
            document.getElementsByClassName("problem")[i].innerHTML = `<span style='color:#FF0000; font-size: 12px'> ${nonJSON[0].message} </span>`;
            return decorations.options.className === "squiggly-error";
          }
          document.getElementsByClassName("problem")[i].innerHTML = "<span style='color:#ffffff; font-size: 12px'> ` </span>";
        }

        monEditor.model.onDidChangeContent((event) => {
          temp = monEditor.getSelection();
          let decorations = monEditor.getModel().getAllDecorations();
          let error = decorations.filter(isError).map( e => e);
        });

        let canvasImport = 
          `
          document.body.style.backgroundColor = "black";
          document.body.style.color = "whitesmoke";

        `;

        /* Omit for now.
           import {Canvas} from "geometry-core/Canvas";\n let System = new Canvas(document.body);
           function print(x: any){
           System.print(x);
           }

           function print2(...data:any[]){
           return System.print2(data);
           }
           */

        function transpileAndRun() {
          let editorValue = canvasImport + monEditor.getValue();
          let transpiled = ts.transpileModule(editorValue, { compilerOptions: {}});
          let base_tpl =
            "<!doctype html>\n" +
            "<html>\n\t" +
            "<head>\n\t\t" +
            "<meta charset=\"utf-8\">\n\t\t" +
            "<script src=\"" + siteRoot + "/scripts/systemjs/system.js\"></script>" +
            "<script src=\"" + siteRoot + "/scripts/config.js\" siteRoot=" + siteRoot + "></script>" +
            "<title>Test</title>\n\n\t\t\n\t" +
            "</head>\n\t" +
            "<body>\n\t\n\t" +
            "<div id=\"out\"></div>\n" +
            "<script>SystemJS.define(System.normalizeSync('output'), `replaceMe`)\n" +
            "</script>\n\t" +
            "</body>\n" +
            "</html>";

          base_tpl = base_tpl.replace('replaceMe', transpiled.outputText);
          let iframe = document.getElementsByClassName("output")[i];
          let iframe_doc = iframe.contentDocument;
          iframe_doc.open();
          iframe_doc.write(base_tpl);
          iframe_doc.close();
        }


        document.getElementsByClassName("runButton")[i].onclick = function fun() {
          transpileAndRun();
        };


        document.getElementsByClassName("restart")[i].onclick = function restart() {
          monEditor.setValue(jsCode);
          transpileAndRun();
        };
      }
    });
  }
}, false);
