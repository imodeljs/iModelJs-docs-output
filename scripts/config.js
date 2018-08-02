var siteRoot = document.currentScript.getAttribute('siteRoot');

System.config({
  baseURL: siteRoot + "/scripts/",
  defaultJSExtensions: true,
  transpiler: "typescript",
});
