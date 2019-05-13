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

      fetch(siteRoot + '/scripts/playground-scripts/PlaygroundHelper.d.ts')
      .then(function(response) {
        return response.text();
      })
      .then(function(text) {
        monaco.languages.typescript.typescriptDefaults.addExtraLib('function print(x:any):void{}', 'playgroundhelper.ts');
      });

      let imports = {};

      function dynamicImports(module) {

        if(imports[module]) {
          return;
        }

        fetch(siteRoot + '/scripts/' + module + '.d.ts')
          .then(function(response) {
            status = response.status;
            return response.text();
          })
        .then(function(text) {
          try {
            if(status === "200") {
              monaco.languages.typescript.typescriptDefaults.addExtraLib(text, 'node_modules/@types/' + module + '.d.ts');
              imports[module] = true;
            }
          }
          catch(e) {
            console.log(e);
          }
        });

      }

      for(let i = 0, len = playgrounds.length; i < len; ++i) {
        let jsCode = playgrounds[i].innerText;
        playgrounds[i].parentNode.innerHTML = `
          <div class="ts-playgrounds">
            <div class="challenge">  </div>
            <div class="problem" style="color:white;"> problem  </div>
            <div class="container-wrapper"> 
              <div class="border">
                <button class="runButton">Run</button>
                <button class="restart"> Restore Code</button>
                <div class="dropdownWrapper">
                  <button class="theme"> Theme </button>
                    <div class="themeDropDown dropdown-content">
                      <a onclick="monaco.editor.setTheme('vs')">vs</a>
                      <a onclick="monaco.editor.setTheme('vs-dark')">vs-dark</a>
                      <a onclick="monaco.editor.setTheme('hc-black')">hc-black</a>
                    </div>
                </div>
              </div>
              <div class="playground-container" ></div>
              <iframe class="output" > </iframe>
            </div>
          </div>
          `;

        document.getElementsByClassName("theme")[i].onclick = function() {
          document.getElementsByClassName("themeDropDown")[i].classList.toggle("show");
        };

        let monEditor = monaco.editor.create(document.getElementsByClassName("playground-container")[i], {
          model: monaco.editor.createModel(jsCode,"typescript", new monaco.Uri("ts-main-" + i + ".ts")), 
          wordWrap: "on",
          language: "typescript",
          theme: "vs-dark",
          minimap: {
            enabled: false
          }
        });

        monEditor.model.onDidChangeDecorations((event) => {
          let decorations = monEditor.getModel().getAllDecorations();

          let firstError = "";
          let error = decorations.filter(decoration => decoration.options.className === "squiggly-error").map(error => {
            let errorValue = error.options.hoverMessage.value.replace(/[`]/g, '');
            if(errorValue.includes('Cannot find module')) {
              let module = errorValue.match(/Cannot find module (.*)/)[1].replace(/['";.]+/g, '');
              dynamicImports(module);

            }
            if(firstError === "") {
              firstError = errorValue;
            }
          });
          document.getElementsByClassName("problem")[i].innerHTML = `<span style='color:#FF0000; font-size: 12px'> ${firstError} </span>`;
        });

        let canvasImport = `document.body.style.backgroundColor = "black";
                document.body.style.color = "whitesmoke";
                import {print} from "playground-scripts/PlaygroundHelper";
        `;


        function transpileAndRun() {
          editorValue = canvasImport + monEditor.getValue();
          
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

        window.addEventListener("resize", function(){
           monEditor.layout();
        });
    
        document.getElementsByClassName("runButton")[i].onclick = function fun() {
          transpileAndRun();
        };

        document.getElementsByClassName("restart")[i].onclick = function restart() {
          monEditor.setValue(" ");
          transpileAndRun();
          monEditor.setValue(jsCode);
        };
      }
    });
  }
}, false);
