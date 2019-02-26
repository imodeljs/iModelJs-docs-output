!function(e){var t={};function r(i){if(t[i])return t[i].exports;var n=t[i]={i:i,l:!1,exports:{}};return e[i].call(n.exports,n,n.exports,r),n.l=!0,n.exports}r.m=e,r.c=t,r.d=function(e,t,i){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(r.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)r.d(i,n,function(t){return e[t]}.bind(null,n));return i},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="D:\\vsts_b\\4\\tempDocsBuild",r(r.s=0)}([function(e,t,r){const i=r(1),n=r(2),s=typeof AbortController;let o,a,u;onmessage=(e=>{if("fetch"===e.data.type&&fetch(e.data.searchUrl).then(e=>e.arrayBuffer()).then(e=>{const t=new Uint8Array(e),r=n.decompressFromUint8Array(t),s=JSON.parse(r);o=i.Index.load(s)}),"filter"===e.data.type){if(void 0===o)return void setTimeout(postMessage({loading:!0}),50);let t=e.data.impartialQuery.replace(/\s+/g," ").trim().split(" "),r=o.pipeline.run(i.tokenizer(t)),n="";let l=0;for(t.length;l<t.length;++l){t.length>1&&(n+=t[l]);let e=t[l];(e="title:"+t[l]+"^1000 "+t[l]).indexOf("*")<0&&(e+=" title:"+t[l]+"*^100 "+t[l]+"*"),t[l]=e}""!==n&&(n="title:"+n+"^1000 "+n+" "+n+"* ");const c=n+t.join(" ");if(a&&a.abort(),"undefined"!==s){const e=new AbortController;u=e.signal,a=e}(function(){(function({signal:e}){return e&&e.aborted?Promise.reject("Search Promise aborted"):new Promise(function(t,r){setTimeout(function(){const e=o.search(c);t(e)},0),e&&e.addEventListener("abort",()=>{r("Search Promise aborted")})})})({signal:u}).then(function(e){postMessage({results:e,queryTokens:r})}).catch(function(e){})})()}})},function(e,t,r){var i,n;
/**
 * lunr - http://lunrjs.com - A bit like Solr, but much smaller and not as bright - 2.3.6
 * Copyright (C) 2019 Oliver Nightingale
 * @license MIT
 */!function(){var s=function(e){var t=new s.Builder;return t.pipeline.add(s.trimmer,s.stopWordFilter,s.stemmer),t.searchPipeline.add(s.stemmer),e.call(t,t),t.build()};s.version="2.3.6"
/*!
 * lunr.utils
 * Copyright (C) 2019 Oliver Nightingale
 */,s.utils={},s.utils.warn=function(e){return function(t){e.console&&console.warn&&console.warn(t)}}(this),s.utils.asString=function(e){return void 0===e||null===e?"":e.toString()},s.utils.clone=function(e){if(null===e||void 0===e)return e;for(var t=Object.create(null),r=Object.keys(e),i=0;i<r.length;i++){var n=r[i],s=e[n];if(Array.isArray(s))t[n]=s.slice();else{if("string"!=typeof s&&"number"!=typeof s&&"boolean"!=typeof s)throw new TypeError("clone is not deep and does not support nested objects");t[n]=s}}return t},s.FieldRef=function(e,t,r){this.docRef=e,this.fieldName=t,this._stringValue=r},s.FieldRef.joiner="/",s.FieldRef.fromString=function(e){var t=e.indexOf(s.FieldRef.joiner);if(-1===t)throw"malformed field ref string";var r=e.slice(0,t),i=e.slice(t+1);return new s.FieldRef(i,r,e)},s.FieldRef.prototype.toString=function(){return void 0==this._stringValue&&(this._stringValue=this.fieldName+s.FieldRef.joiner+this.docRef),this._stringValue}
/*!
 * lunr.Set
 * Copyright (C) 2019 Oliver Nightingale
 */,s.Set=function(e){if(this.elements=Object.create(null),e){this.length=e.length;for(var t=0;t<this.length;t++)this.elements[e[t]]=!0}else this.length=0},s.Set.complete={intersect:function(e){return e},union:function(e){return e},contains:function(){return!0}},s.Set.empty={intersect:function(){return this},union:function(e){return e},contains:function(){return!1}},s.Set.prototype.contains=function(e){return!!this.elements[e]},s.Set.prototype.intersect=function(e){var t,r,i,n=[];if(e===s.Set.complete)return this;if(e===s.Set.empty)return e;this.length<e.length?(t=this,r=e):(t=e,r=this),i=Object.keys(t.elements);for(var o=0;o<i.length;o++){var a=i[o];a in r.elements&&n.push(a)}return new s.Set(n)},s.Set.prototype.union=function(e){return e===s.Set.complete?s.Set.complete:e===s.Set.empty?this:new s.Set(Object.keys(this.elements).concat(Object.keys(e.elements)))},s.idf=function(e,t){var r=0;for(var i in e)"_index"!=i&&(r+=Object.keys(e[i]).length);var n=(t-r+.5)/(r+.5);return Math.log(1+Math.abs(n))},s.Token=function(e,t){this.str=e||"",this.metadata=t||{}},s.Token.prototype.toString=function(){return this.str},s.Token.prototype.update=function(e){return this.str=e(this.str,this.metadata),this},s.Token.prototype.clone=function(e){return e=e||function(e){return e},new s.Token(e(this.str,this.metadata),this.metadata)}
/*!
 * lunr.tokenizer
 * Copyright (C) 2019 Oliver Nightingale
 */,s.tokenizer=function(e,t){if(null==e||void 0==e)return[];if(Array.isArray(e))return e.map(function(e){return new s.Token(s.utils.asString(e).toLowerCase(),s.utils.clone(t))});for(var r=e.toString().trim().toLowerCase(),i=r.length,n=[],o=0,a=0;o<=i;o++){var u=o-a;if(r.charAt(o).match(s.tokenizer.separator)||o==i){if(u>0){var l=s.utils.clone(t)||{};l.position=[a,u],l.index=n.length,n.push(new s.Token(r.slice(a,o),l))}a=o+1}}return n},s.tokenizer.separator=/[\s\-]+/
/*!
 * lunr.Pipeline
 * Copyright (C) 2019 Oliver Nightingale
 */,s.Pipeline=function(){this._stack=[]},s.Pipeline.registeredFunctions=Object.create(null),s.Pipeline.registerFunction=function(e,t){t in this.registeredFunctions&&s.utils.warn("Overwriting existing registered function: "+t),e.label=t,s.Pipeline.registeredFunctions[e.label]=e},s.Pipeline.warnIfFunctionNotRegistered=function(e){e.label&&e.label in this.registeredFunctions||s.utils.warn("Function is not registered with pipeline. This may cause problems when serialising the index.\n",e)},s.Pipeline.load=function(e){var t=new s.Pipeline;return e.forEach(function(e){var r=s.Pipeline.registeredFunctions[e];if(!r)throw new Error("Cannot load unregistered function: "+e);t.add(r)}),t},s.Pipeline.prototype.add=function(){Array.prototype.slice.call(arguments).forEach(function(e){s.Pipeline.warnIfFunctionNotRegistered(e),this._stack.push(e)},this)},s.Pipeline.prototype.after=function(e,t){s.Pipeline.warnIfFunctionNotRegistered(t);var r=this._stack.indexOf(e);if(-1==r)throw new Error("Cannot find existingFn");r+=1,this._stack.splice(r,0,t)},s.Pipeline.prototype.before=function(e,t){s.Pipeline.warnIfFunctionNotRegistered(t);var r=this._stack.indexOf(e);if(-1==r)throw new Error("Cannot find existingFn");this._stack.splice(r,0,t)},s.Pipeline.prototype.remove=function(e){var t=this._stack.indexOf(e);-1!=t&&this._stack.splice(t,1)},s.Pipeline.prototype.run=function(e){for(var t=this._stack.length,r=0;r<t;r++){for(var i=this._stack[r],n=[],s=0;s<e.length;s++){var o=i(e[s],s,e);if(void 0!==o&&""!==o)if(Array.isArray(o))for(var a=0;a<o.length;a++)n.push(o[a]);else n.push(o)}e=n}return e},s.Pipeline.prototype.runString=function(e,t){var r=new s.Token(e,t);return this.run([r]).map(function(e){return e.toString()})},s.Pipeline.prototype.reset=function(){this._stack=[]},s.Pipeline.prototype.toJSON=function(){return this._stack.map(function(e){return s.Pipeline.warnIfFunctionNotRegistered(e),e.label})}
/*!
 * lunr.Vector
 * Copyright (C) 2019 Oliver Nightingale
 */,s.Vector=function(e){this._magnitude=0,this.elements=e||[]},s.Vector.prototype.positionForIndex=function(e){if(0==this.elements.length)return 0;for(var t=0,r=this.elements.length/2,i=r-t,n=Math.floor(i/2),s=this.elements[2*n];i>1&&(s<e&&(t=n),s>e&&(r=n),s!=e);)i=r-t,n=t+Math.floor(i/2),s=this.elements[2*n];return s==e?2*n:s>e?2*n:s<e?2*(n+1):void 0},s.Vector.prototype.insert=function(e,t){this.upsert(e,t,function(){throw"duplicate index"})},s.Vector.prototype.upsert=function(e,t,r){this._magnitude=0;var i=this.positionForIndex(e);this.elements[i]==e?this.elements[i+1]=r(this.elements[i+1],t):this.elements.splice(i,0,e,t)},s.Vector.prototype.magnitude=function(){if(this._magnitude)return this._magnitude;for(var e=0,t=this.elements.length,r=1;r<t;r+=2){var i=this.elements[r];e+=i*i}return this._magnitude=Math.sqrt(e)},s.Vector.prototype.dot=function(e){for(var t=0,r=this.elements,i=e.elements,n=r.length,s=i.length,o=0,a=0,u=0,l=0;u<n&&l<s;)(o=r[u])<(a=i[l])?u+=2:o>a?l+=2:o==a&&(t+=r[u+1]*i[l+1],u+=2,l+=2);return t},s.Vector.prototype.similarity=function(e){return this.dot(e)/this.magnitude()||0},s.Vector.prototype.toArray=function(){for(var e=new Array(this.elements.length/2),t=1,r=0;t<this.elements.length;t+=2,r++)e[r]=this.elements[t];return e},s.Vector.prototype.toJSON=function(){return this.elements}
/*!
 * lunr.stemmer
 * Copyright (C) 2019 Oliver Nightingale
 * Includes code from - http://tartarus.org/~martin/PorterStemmer/js.txt
 */,s.stemmer=function(){var e={ational:"ate",tional:"tion",enci:"ence",anci:"ance",izer:"ize",bli:"ble",alli:"al",entli:"ent",eli:"e",ousli:"ous",ization:"ize",ation:"ate",ator:"ate",alism:"al",iveness:"ive",fulness:"ful",ousness:"ous",aliti:"al",iviti:"ive",biliti:"ble",logi:"log"},t={icate:"ic",ative:"",alize:"al",iciti:"ic",ical:"ic",ful:"",ness:""},r="[aeiouy]",i="[^aeiou][^aeiouy]*",n=new RegExp("^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*"),s=new RegExp("^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*"),o=new RegExp("^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*([aeiouy][aeiou]*)?$"),a=new RegExp("^([^aeiou][^aeiouy]*)?[aeiouy]"),u=/^(.+?)(ss|i)es$/,l=/^(.+?)([^s])s$/,c=/^(.+?)eed$/,h=/^(.+?)(ed|ing)$/,d=/.$/,f=/(at|bl|iz)$/,p=new RegExp("([^aeiouylsz])\\1$"),y=new RegExp("^"+i+r+"[^aeiouwxy]$"),m=/^(.+?[^aeiou])y$/,g=/^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/,v=/^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/,x=/^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/,w=/^(.+?)(s|t)(ion)$/,Q=/^(.+?)e$/,b=/ll$/,k=new RegExp("^"+i+r+"[^aeiouwxy]$"),S=function(r){var i,S,E,P,L,T,O;if(r.length<3)return r;if("y"==(E=r.substr(0,1))&&(r=E.toUpperCase()+r.substr(1)),L=l,(P=u).test(r)?r=r.replace(P,"$1$2"):L.test(r)&&(r=r.replace(L,"$1$2")),L=h,(P=c).test(r)){var I=P.exec(r);(P=n).test(I[1])&&(P=d,r=r.replace(P,""))}else if(L.test(r)){i=(I=L.exec(r))[1],(L=a).test(i)&&(T=p,O=y,(L=f).test(r=i)?r+="e":T.test(r)?(P=d,r=r.replace(P,"")):O.test(r)&&(r+="e"))}(P=m).test(r)&&(r=(i=(I=P.exec(r))[1])+"i");(P=g).test(r)&&(i=(I=P.exec(r))[1],S=I[2],(P=n).test(i)&&(r=i+e[S]));(P=v).test(r)&&(i=(I=P.exec(r))[1],S=I[2],(P=n).test(i)&&(r=i+t[S]));if(L=w,(P=x).test(r))i=(I=P.exec(r))[1],(P=s).test(i)&&(r=i);else if(L.test(r)){i=(I=L.exec(r))[1]+I[2],(L=s).test(i)&&(r=i)}(P=Q).test(r)&&(i=(I=P.exec(r))[1],L=o,T=k,((P=s).test(i)||L.test(i)&&!T.test(i))&&(r=i));return L=s,(P=b).test(r)&&L.test(r)&&(P=d,r=r.replace(P,"")),"y"==E&&(r=E.toLowerCase()+r.substr(1)),r};return function(e){return e.update(S)}}(),s.Pipeline.registerFunction(s.stemmer,"stemmer")
/*!
 * lunr.stopWordFilter
 * Copyright (C) 2019 Oliver Nightingale
 */,s.generateStopWordFilter=function(e){var t=e.reduce(function(e,t){return e[t]=t,e},{});return function(e){if(e&&t[e.toString()]!==e.toString())return e}},s.stopWordFilter=s.generateStopWordFilter(["a","able","about","across","after","all","almost","also","am","among","an","and","any","are","as","at","be","because","been","but","by","can","cannot","could","dear","did","do","does","either","else","ever","every","for","from","get","got","had","has","have","he","her","hers","him","his","how","however","i","if","in","into","is","it","its","just","least","let","like","likely","may","me","might","most","must","my","neither","no","nor","not","of","off","often","on","only","or","other","our","own","rather","said","say","says","she","should","since","so","some","than","that","the","their","them","then","there","these","they","this","tis","to","too","twas","us","wants","was","we","were","what","when","where","which","while","who","whom","why","will","with","would","yet","you","your"]),s.Pipeline.registerFunction(s.stopWordFilter,"stopWordFilter")
/*!
 * lunr.trimmer
 * Copyright (C) 2019 Oliver Nightingale
 */,s.trimmer=function(e){return e.update(function(e){return e.replace(/^\W+/,"").replace(/\W+$/,"")})},s.Pipeline.registerFunction(s.trimmer,"trimmer")
/*!
 * lunr.TokenSet
 * Copyright (C) 2019 Oliver Nightingale
 */,s.TokenSet=function(){this.final=!1,this.edges={},this.id=s.TokenSet._nextId,s.TokenSet._nextId+=1},s.TokenSet._nextId=1,s.TokenSet.fromArray=function(e){for(var t=new s.TokenSet.Builder,r=0,i=e.length;r<i;r++)t.insert(e[r]);return t.finish(),t.root},s.TokenSet.fromClause=function(e){return"editDistance"in e?s.TokenSet.fromFuzzyString(e.term,e.editDistance):s.TokenSet.fromString(e.term)},s.TokenSet.fromFuzzyString=function(e,t){for(var r=new s.TokenSet,i=[{node:r,editsRemaining:t,str:e}];i.length;){var n=i.pop();if(n.str.length>0){var o,a=n.str.charAt(0);a in n.node.edges?o=n.node.edges[a]:(o=new s.TokenSet,n.node.edges[a]=o),1==n.str.length&&(o.final=!0),i.push({node:o,editsRemaining:n.editsRemaining,str:n.str.slice(1)})}if(0!=n.editsRemaining){if("*"in n.node.edges)var u=n.node.edges["*"];else{u=new s.TokenSet;n.node.edges["*"]=u}if(0==n.str.length&&(u.final=!0),i.push({node:u,editsRemaining:n.editsRemaining-1,str:n.str}),n.str.length>1&&i.push({node:n.node,editsRemaining:n.editsRemaining-1,str:n.str.slice(1)}),1==n.str.length&&(n.node.final=!0),n.str.length>=1){if("*"in n.node.edges)var l=n.node.edges["*"];else{l=new s.TokenSet;n.node.edges["*"]=l}1==n.str.length&&(l.final=!0),i.push({node:l,editsRemaining:n.editsRemaining-1,str:n.str.slice(1)})}if(n.str.length>1){var c,h=n.str.charAt(0),d=n.str.charAt(1);d in n.node.edges?c=n.node.edges[d]:(c=new s.TokenSet,n.node.edges[d]=c),1==n.str.length&&(c.final=!0),i.push({node:c,editsRemaining:n.editsRemaining-1,str:h+n.str.slice(2)})}}}return r},s.TokenSet.fromString=function(e){for(var t=new s.TokenSet,r=t,i=0,n=e.length;i<n;i++){var o=e[i],a=i==n-1;if("*"==o)t.edges[o]=t,t.final=a;else{var u=new s.TokenSet;u.final=a,t.edges[o]=u,t=u}}return r},s.TokenSet.prototype.toArray=function(){for(var e=[],t=[{prefix:"",node:this}];t.length;){var r=t.pop(),i=Object.keys(r.node.edges),n=i.length;r.node.final&&(r.prefix.charAt(0),e.push(r.prefix));for(var s=0;s<n;s++){var o=i[s];t.push({prefix:r.prefix.concat(o),node:r.node.edges[o]})}}return e},s.TokenSet.prototype.toString=function(){if(this._str)return this._str;for(var e=this.final?"1":"0",t=Object.keys(this.edges).sort(),r=t.length,i=0;i<r;i++){var n=t[i];e=e+n+this.edges[n].id}return e},s.TokenSet.prototype.intersect=function(e){for(var t=new s.TokenSet,r=void 0,i=[{qNode:e,output:t,node:this}];i.length;){r=i.pop();for(var n=Object.keys(r.qNode.edges),o=n.length,a=Object.keys(r.node.edges),u=a.length,l=0;l<o;l++)for(var c=n[l],h=0;h<u;h++){var d=a[h];if(d==c||"*"==c){var f=r.node.edges[d],p=r.qNode.edges[c],y=f.final&&p.final,m=void 0;d in r.output.edges?(m=r.output.edges[d]).final=m.final||y:((m=new s.TokenSet).final=y,r.output.edges[d]=m),i.push({qNode:p,output:m,node:f})}}}return t},s.TokenSet.Builder=function(){this.previousWord="",this.root=new s.TokenSet,this.uncheckedNodes=[],this.minimizedNodes={}},s.TokenSet.Builder.prototype.insert=function(e){var t,r=0;if(e<this.previousWord)throw new Error("Out of order word insertion");for(var i=0;i<e.length&&i<this.previousWord.length&&e[i]==this.previousWord[i];i++)r++;this.minimize(r),t=0==this.uncheckedNodes.length?this.root:this.uncheckedNodes[this.uncheckedNodes.length-1].child;for(i=r;i<e.length;i++){var n=new s.TokenSet,o=e[i];t.edges[o]=n,this.uncheckedNodes.push({parent:t,char:o,child:n}),t=n}t.final=!0,this.previousWord=e},s.TokenSet.Builder.prototype.finish=function(){this.minimize(0)},s.TokenSet.Builder.prototype.minimize=function(e){for(var t=this.uncheckedNodes.length-1;t>=e;t--){var r=this.uncheckedNodes[t],i=r.child.toString();i in this.minimizedNodes?r.parent.edges[r.char]=this.minimizedNodes[i]:(r.child._str=i,this.minimizedNodes[i]=r.child),this.uncheckedNodes.pop()}}
/*!
 * lunr.Index
 * Copyright (C) 2019 Oliver Nightingale
 */,s.Index=function(e){this.invertedIndex=e.invertedIndex,this.fieldVectors=e.fieldVectors,this.tokenSet=e.tokenSet,this.fields=e.fields,this.pipeline=e.pipeline},s.Index.prototype.search=function(e){return this.query(function(t){new s.QueryParser(e,t).parse()})},s.Index.prototype.query=function(e){for(var t=new s.Query(this.fields),r=Object.create(null),i=Object.create(null),n=Object.create(null),o=Object.create(null),a=Object.create(null),u=0;u<this.fields.length;u++)i[this.fields[u]]=new s.Vector;e.call(t,t);for(u=0;u<t.clauses.length;u++){var l=t.clauses[u],c=null,h=s.Set.complete;c=l.usePipeline?this.pipeline.runString(l.term,{fields:l.fields}):[l.term];for(var d=0;d<c.length;d++){var f=c[d];l.term=f;var p=s.TokenSet.fromClause(l),y=this.tokenSet.intersect(p).toArray();if(0===y.length&&l.presence===s.Query.presence.REQUIRED){for(var m=0;m<l.fields.length;m++){o[F=l.fields[m]]=s.Set.empty}break}for(var g=0;g<y.length;g++){var v=y[g],x=this.invertedIndex[v],w=x._index;for(m=0;m<l.fields.length;m++){var Q=x[F=l.fields[m]],b=Object.keys(Q),k=v+"/"+F,S=new s.Set(b);if(l.presence==s.Query.presence.REQUIRED&&(h=h.union(S),void 0===o[F]&&(o[F]=s.Set.complete)),l.presence!=s.Query.presence.PROHIBITED){if(i[F].upsert(w,l.boost,function(e,t){return e+t}),!n[k]){for(var E=0;E<b.length;E++){var P,L=b[E],T=new s.FieldRef(L,F),O=Q[L];void 0===(P=r[T])?r[T]=new s.MatchData(v,F,O):P.add(v,F,O)}n[k]=!0}}else void 0===a[F]&&(a[F]=s.Set.empty),a[F]=a[F].union(S)}}}if(l.presence===s.Query.presence.REQUIRED)for(m=0;m<l.fields.length;m++){o[F=l.fields[m]]=o[F].intersect(h)}}var I=s.Set.complete,R=s.Set.empty;for(u=0;u<this.fields.length;u++){var F;o[F=this.fields[u]]&&(I=I.intersect(o[F])),a[F]&&(R=R.union(a[F]))}var C=Object.keys(r),j=[],_=Object.create(null);if(t.isNegated()){C=Object.keys(this.fieldVectors);for(u=0;u<C.length;u++){T=C[u];var A=s.FieldRef.fromString(T);r[T]=new s.MatchData}}for(u=0;u<C.length;u++){var N=(A=s.FieldRef.fromString(C[u])).docRef;if(I.contains(N)&&!R.contains(N)){var D,M=this.fieldVectors[A],B=i[A.fieldName].similarity(M);if(void 0!==(D=_[N]))D.score+=B,D.matchData.combine(r[A]);else{var z={ref:N,score:B,matchData:r[A]};_[N]=z,j.push(z)}}}return j.sort(function(e,t){return t.score-e.score})},s.Index.prototype.toJSON=function(){var e=Object.keys(this.invertedIndex).sort().map(function(e){return[e,this.invertedIndex[e]]},this),t=Object.keys(this.fieldVectors).map(function(e){return[e,this.fieldVectors[e].toJSON()]},this);return{version:s.version,fields:this.fields,fieldVectors:t,invertedIndex:e,pipeline:this.pipeline.toJSON()}},s.Index.load=function(e){var t={},r={},i=e.fieldVectors,n=Object.create(null),o=e.invertedIndex,a=new s.TokenSet.Builder,u=s.Pipeline.load(e.pipeline);e.version!=s.version&&s.utils.warn("Version mismatch when loading serialised index. Current version of lunr '"+s.version+"' does not match serialized index '"+e.version+"'");for(var l=0;l<i.length;l++){var c=(d=i[l])[0],h=d[1];r[c]=new s.Vector(h)}for(l=0;l<o.length;l++){var d,f=(d=o[l])[0],p=d[1];a.insert(f),n[f]=p}return a.finish(),t.fields=e.fields,t.fieldVectors=r,t.invertedIndex=n,t.tokenSet=a.root,t.pipeline=u,new s.Index(t)}
/*!
 * lunr.Builder
 * Copyright (C) 2019 Oliver Nightingale
 */,s.Builder=function(){this._ref="id",this._fields=Object.create(null),this._documents=Object.create(null),this.invertedIndex=Object.create(null),this.fieldTermFrequencies={},this.fieldLengths={},this.tokenizer=s.tokenizer,this.pipeline=new s.Pipeline,this.searchPipeline=new s.Pipeline,this.documentCount=0,this._b=.75,this._k1=1.2,this.termIndex=0,this.metadataWhitelist=[]},s.Builder.prototype.ref=function(e){this._ref=e},s.Builder.prototype.field=function(e,t){if(/\//.test(e))throw new RangeError("Field '"+e+"' contains illegal character '/'");this._fields[e]=t||{}},s.Builder.prototype.b=function(e){this._b=e<0?0:e>1?1:e},s.Builder.prototype.k1=function(e){this._k1=e},s.Builder.prototype.add=function(e,t){var r=e[this._ref],i=Object.keys(this._fields);this._documents[r]=t||{},this.documentCount+=1;for(var n=0;n<i.length;n++){var o=i[n],a=this._fields[o].extractor,u=a?a(e):e[o],l=this.tokenizer(u,{fields:[o]}),c=this.pipeline.run(l),h=new s.FieldRef(r,o),d=Object.create(null);this.fieldTermFrequencies[h]=d,this.fieldLengths[h]=0,this.fieldLengths[h]+=c.length;for(var f=0;f<c.length;f++){var p=c[f];if(void 0==d[p]&&(d[p]=0),d[p]+=1,void 0==this.invertedIndex[p]){var y=Object.create(null);y._index=this.termIndex,this.termIndex+=1;for(var m=0;m<i.length;m++)y[i[m]]=Object.create(null);this.invertedIndex[p]=y}void 0==this.invertedIndex[p][o][r]&&(this.invertedIndex[p][o][r]=Object.create(null));for(var g=0;g<this.metadataWhitelist.length;g++){var v=this.metadataWhitelist[g],x=p.metadata[v];void 0==this.invertedIndex[p][o][r][v]&&(this.invertedIndex[p][o][r][v]=[]),this.invertedIndex[p][o][r][v].push(x)}}}},s.Builder.prototype.calculateAverageFieldLengths=function(){for(var e=Object.keys(this.fieldLengths),t=e.length,r={},i={},n=0;n<t;n++){var o=s.FieldRef.fromString(e[n]),a=o.fieldName;i[a]||(i[a]=0),i[a]+=1,r[a]||(r[a]=0),r[a]+=this.fieldLengths[o]}var u=Object.keys(this._fields);for(n=0;n<u.length;n++){var l=u[n];r[l]=r[l]/i[l]}this.averageFieldLength=r},s.Builder.prototype.createFieldVectors=function(){for(var e={},t=Object.keys(this.fieldTermFrequencies),r=t.length,i=Object.create(null),n=0;n<r;n++){for(var o=s.FieldRef.fromString(t[n]),a=o.fieldName,u=this.fieldLengths[o],l=new s.Vector,c=this.fieldTermFrequencies[o],h=Object.keys(c),d=h.length,f=this._fields[a].boost||1,p=this._documents[o.docRef].boost||1,y=0;y<d;y++){var m,g,v,x=h[y],w=c[x],Q=this.invertedIndex[x]._index;void 0===i[x]?(m=s.idf(this.invertedIndex[x],this.documentCount),i[x]=m):m=i[x],g=m*((this._k1+1)*w)/(this._k1*(1-this._b+this._b*(u/this.averageFieldLength[a]))+w),g*=f,g*=p,v=Math.round(1e3*g)/1e3,l.insert(Q,v)}e[o]=l}this.fieldVectors=e},s.Builder.prototype.createTokenSet=function(){this.tokenSet=s.TokenSet.fromArray(Object.keys(this.invertedIndex).sort())},s.Builder.prototype.build=function(){return this.calculateAverageFieldLengths(),this.createFieldVectors(),this.createTokenSet(),new s.Index({invertedIndex:this.invertedIndex,fieldVectors:this.fieldVectors,tokenSet:this.tokenSet,fields:Object.keys(this._fields),pipeline:this.searchPipeline})},s.Builder.prototype.use=function(e){var t=Array.prototype.slice.call(arguments,1);t.unshift(this),e.apply(this,t)},s.MatchData=function(e,t,r){for(var i=Object.create(null),n=Object.keys(r||{}),s=0;s<n.length;s++){var o=n[s];i[o]=r[o].slice()}this.metadata=Object.create(null),void 0!==e&&(this.metadata[e]=Object.create(null),this.metadata[e][t]=i)},s.MatchData.prototype.combine=function(e){for(var t=Object.keys(e.metadata),r=0;r<t.length;r++){var i=t[r],n=Object.keys(e.metadata[i]);void 0==this.metadata[i]&&(this.metadata[i]=Object.create(null));for(var s=0;s<n.length;s++){var o=n[s],a=Object.keys(e.metadata[i][o]);void 0==this.metadata[i][o]&&(this.metadata[i][o]=Object.create(null));for(var u=0;u<a.length;u++){var l=a[u];void 0==this.metadata[i][o][l]?this.metadata[i][o][l]=e.metadata[i][o][l]:this.metadata[i][o][l]=this.metadata[i][o][l].concat(e.metadata[i][o][l])}}}},s.MatchData.prototype.add=function(e,t,r){if(!(e in this.metadata))return this.metadata[e]=Object.create(null),void(this.metadata[e][t]=r);if(t in this.metadata[e])for(var i=Object.keys(r),n=0;n<i.length;n++){var s=i[n];s in this.metadata[e][t]?this.metadata[e][t][s]=this.metadata[e][t][s].concat(r[s]):this.metadata[e][t][s]=r[s]}else this.metadata[e][t]=r},s.Query=function(e){this.clauses=[],this.allFields=e},s.Query.wildcard=new String("*"),s.Query.wildcard.NONE=0,s.Query.wildcard.LEADING=1,s.Query.wildcard.TRAILING=2,s.Query.presence={OPTIONAL:1,REQUIRED:2,PROHIBITED:3},s.Query.prototype.clause=function(e){return"fields"in e||(e.fields=this.allFields),"boost"in e||(e.boost=1),"usePipeline"in e||(e.usePipeline=!0),"wildcard"in e||(e.wildcard=s.Query.wildcard.NONE),e.wildcard&s.Query.wildcard.LEADING&&e.term.charAt(0)!=s.Query.wildcard&&(e.term="*"+e.term),e.wildcard&s.Query.wildcard.TRAILING&&e.term.slice(-1)!=s.Query.wildcard&&(e.term=e.term+"*"),"presence"in e||(e.presence=s.Query.presence.OPTIONAL),this.clauses.push(e),this},s.Query.prototype.isNegated=function(){for(var e=0;e<this.clauses.length;e++)if(this.clauses[e].presence!=s.Query.presence.PROHIBITED)return!1;return!0},s.Query.prototype.term=function(e,t){if(Array.isArray(e))return e.forEach(function(e){this.term(e,s.utils.clone(t))},this),this;var r=t||{};return r.term=e.toString(),this.clause(r),this},s.QueryParseError=function(e,t,r){this.name="QueryParseError",this.message=e,this.start=t,this.end=r},s.QueryParseError.prototype=new Error,s.QueryLexer=function(e){this.lexemes=[],this.str=e,this.length=e.length,this.pos=0,this.start=0,this.escapeCharPositions=[]},s.QueryLexer.prototype.run=function(){for(var e=s.QueryLexer.lexText;e;)e=e(this)},s.QueryLexer.prototype.sliceString=function(){for(var e=[],t=this.start,r=this.pos,i=0;i<this.escapeCharPositions.length;i++)r=this.escapeCharPositions[i],e.push(this.str.slice(t,r)),t=r+1;return e.push(this.str.slice(t,this.pos)),this.escapeCharPositions.length=0,e.join("")},s.QueryLexer.prototype.emit=function(e){this.lexemes.push({type:e,str:this.sliceString(),start:this.start,end:this.pos}),this.start=this.pos},s.QueryLexer.prototype.escapeCharacter=function(){this.escapeCharPositions.push(this.pos-1),this.pos+=1},s.QueryLexer.prototype.next=function(){if(this.pos>=this.length)return s.QueryLexer.EOS;var e=this.str.charAt(this.pos);return this.pos+=1,e},s.QueryLexer.prototype.width=function(){return this.pos-this.start},s.QueryLexer.prototype.ignore=function(){this.start==this.pos&&(this.pos+=1),this.start=this.pos},s.QueryLexer.prototype.backup=function(){this.pos-=1},s.QueryLexer.prototype.acceptDigitRun=function(){var e,t;do{t=(e=this.next()).charCodeAt(0)}while(t>47&&t<58);e!=s.QueryLexer.EOS&&this.backup()},s.QueryLexer.prototype.more=function(){return this.pos<this.length},s.QueryLexer.EOS="EOS",s.QueryLexer.FIELD="FIELD",s.QueryLexer.TERM="TERM",s.QueryLexer.EDIT_DISTANCE="EDIT_DISTANCE",s.QueryLexer.BOOST="BOOST",s.QueryLexer.PRESENCE="PRESENCE",s.QueryLexer.lexField=function(e){return e.backup(),e.emit(s.QueryLexer.FIELD),e.ignore(),s.QueryLexer.lexText},s.QueryLexer.lexTerm=function(e){if(e.width()>1&&(e.backup(),e.emit(s.QueryLexer.TERM)),e.ignore(),e.more())return s.QueryLexer.lexText},s.QueryLexer.lexEditDistance=function(e){return e.ignore(),e.acceptDigitRun(),e.emit(s.QueryLexer.EDIT_DISTANCE),s.QueryLexer.lexText},s.QueryLexer.lexBoost=function(e){return e.ignore(),e.acceptDigitRun(),e.emit(s.QueryLexer.BOOST),s.QueryLexer.lexText},s.QueryLexer.lexEOS=function(e){e.width()>0&&e.emit(s.QueryLexer.TERM)},s.QueryLexer.termSeparator=s.tokenizer.separator,s.QueryLexer.lexText=function(e){for(;;){var t=e.next();if(t==s.QueryLexer.EOS)return s.QueryLexer.lexEOS;if(92!=t.charCodeAt(0)){if(":"==t)return s.QueryLexer.lexField;if("~"==t)return e.backup(),e.width()>0&&e.emit(s.QueryLexer.TERM),s.QueryLexer.lexEditDistance;if("^"==t)return e.backup(),e.width()>0&&e.emit(s.QueryLexer.TERM),s.QueryLexer.lexBoost;if("+"==t&&1===e.width())return e.emit(s.QueryLexer.PRESENCE),s.QueryLexer.lexText;if("-"==t&&1===e.width())return e.emit(s.QueryLexer.PRESENCE),s.QueryLexer.lexText;if(t.match(s.QueryLexer.termSeparator))return s.QueryLexer.lexTerm}else e.escapeCharacter()}},s.QueryParser=function(e,t){this.lexer=new s.QueryLexer(e),this.query=t,this.currentClause={},this.lexemeIdx=0},s.QueryParser.prototype.parse=function(){this.lexer.run(),this.lexemes=this.lexer.lexemes;for(var e=s.QueryParser.parseClause;e;)e=e(this);return this.query},s.QueryParser.prototype.peekLexeme=function(){return this.lexemes[this.lexemeIdx]},s.QueryParser.prototype.consumeLexeme=function(){var e=this.peekLexeme();return this.lexemeIdx+=1,e},s.QueryParser.prototype.nextClause=function(){var e=this.currentClause;this.query.clause(e),this.currentClause={}},s.QueryParser.parseClause=function(e){var t=e.peekLexeme();if(void 0!=t)switch(t.type){case s.QueryLexer.PRESENCE:return s.QueryParser.parsePresence;case s.QueryLexer.FIELD:return s.QueryParser.parseField;case s.QueryLexer.TERM:return s.QueryParser.parseTerm;default:var r="expected either a field or a term, found "+t.type;throw t.str.length>=1&&(r+=" with value '"+t.str+"'"),new s.QueryParseError(r,t.start,t.end)}},s.QueryParser.parsePresence=function(e){var t=e.consumeLexeme();if(void 0!=t){switch(t.str){case"-":e.currentClause.presence=s.Query.presence.PROHIBITED;break;case"+":e.currentClause.presence=s.Query.presence.REQUIRED;break;default:var r="unrecognised presence operator'"+t.str+"'";throw new s.QueryParseError(r,t.start,t.end)}var i=e.peekLexeme();if(void 0==i){r="expecting term or field, found nothing";throw new s.QueryParseError(r,t.start,t.end)}switch(i.type){case s.QueryLexer.FIELD:return s.QueryParser.parseField;case s.QueryLexer.TERM:return s.QueryParser.parseTerm;default:r="expecting term or field, found '"+i.type+"'";throw new s.QueryParseError(r,i.start,i.end)}}},s.QueryParser.parseField=function(e){var t=e.consumeLexeme();if(void 0!=t){if(-1==e.query.allFields.indexOf(t.str)){var r=e.query.allFields.map(function(e){return"'"+e+"'"}).join(", "),i="unrecognised field '"+t.str+"', possible fields: "+r;throw new s.QueryParseError(i,t.start,t.end)}e.currentClause.fields=[t.str];var n=e.peekLexeme();if(void 0==n){i="expecting term, found nothing";throw new s.QueryParseError(i,t.start,t.end)}switch(n.type){case s.QueryLexer.TERM:return s.QueryParser.parseTerm;default:i="expecting term, found '"+n.type+"'";throw new s.QueryParseError(i,n.start,n.end)}}},s.QueryParser.parseTerm=function(e){var t=e.consumeLexeme();if(void 0!=t){e.currentClause.term=t.str.toLowerCase(),-1!=t.str.indexOf("*")&&(e.currentClause.usePipeline=!1);var r=e.peekLexeme();if(void 0!=r)switch(r.type){case s.QueryLexer.TERM:return e.nextClause(),s.QueryParser.parseTerm;case s.QueryLexer.FIELD:return e.nextClause(),s.QueryParser.parseField;case s.QueryLexer.EDIT_DISTANCE:return s.QueryParser.parseEditDistance;case s.QueryLexer.BOOST:return s.QueryParser.parseBoost;case s.QueryLexer.PRESENCE:return e.nextClause(),s.QueryParser.parsePresence;default:var i="Unexpected lexeme type '"+r.type+"'";throw new s.QueryParseError(i,r.start,r.end)}else e.nextClause()}},s.QueryParser.parseEditDistance=function(e){var t=e.consumeLexeme();if(void 0!=t){var r=parseInt(t.str,10);if(isNaN(r)){var i="edit distance must be numeric";throw new s.QueryParseError(i,t.start,t.end)}e.currentClause.editDistance=r;var n=e.peekLexeme();if(void 0!=n)switch(n.type){case s.QueryLexer.TERM:return e.nextClause(),s.QueryParser.parseTerm;case s.QueryLexer.FIELD:return e.nextClause(),s.QueryParser.parseField;case s.QueryLexer.EDIT_DISTANCE:return s.QueryParser.parseEditDistance;case s.QueryLexer.BOOST:return s.QueryParser.parseBoost;case s.QueryLexer.PRESENCE:return e.nextClause(),s.QueryParser.parsePresence;default:i="Unexpected lexeme type '"+n.type+"'";throw new s.QueryParseError(i,n.start,n.end)}else e.nextClause()}},s.QueryParser.parseBoost=function(e){var t=e.consumeLexeme();if(void 0!=t){var r=parseInt(t.str,10);if(isNaN(r)){var i="boost must be numeric";throw new s.QueryParseError(i,t.start,t.end)}e.currentClause.boost=r;var n=e.peekLexeme();if(void 0!=n)switch(n.type){case s.QueryLexer.TERM:return e.nextClause(),s.QueryParser.parseTerm;case s.QueryLexer.FIELD:return e.nextClause(),s.QueryParser.parseField;case s.QueryLexer.EDIT_DISTANCE:return s.QueryParser.parseEditDistance;case s.QueryLexer.BOOST:return s.QueryParser.parseBoost;case s.QueryLexer.PRESENCE:return e.nextClause(),s.QueryParser.parsePresence;default:i="Unexpected lexeme type '"+n.type+"'";throw new s.QueryParseError(i,n.start,n.end)}else e.nextClause()}},void 0===(n="function"==typeof(i=function(){return s})?i.call(t,r,t,e):i)||(e.exports=n)}()},function(e,t,r){var i,n=function(){var e=String.fromCharCode,t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",i={};function n(e,t){if(!i[e]){i[e]={};for(var r=0;r<e.length;r++)i[e][e.charAt(r)]=r}return i[e][t]}var s={compressToBase64:function(e){if(null==e)return"";var r=s._compress(e,6,function(e){return t.charAt(e)});switch(r.length%4){default:case 0:return r;case 1:return r+"===";case 2:return r+"==";case 3:return r+"="}},decompressFromBase64:function(e){return null==e?"":""==e?null:s._decompress(e.length,32,function(r){return n(t,e.charAt(r))})},compressToUTF16:function(t){return null==t?"":s._compress(t,15,function(t){return e(t+32)})+" "},decompressFromUTF16:function(e){return null==e?"":""==e?null:s._decompress(e.length,16384,function(t){return e.charCodeAt(t)-32})},compressToUint8Array:function(e){for(var t=s.compress(e),r=new Uint8Array(2*t.length),i=0,n=t.length;i<n;i++){var o=t.charCodeAt(i);r[2*i]=o>>>8,r[2*i+1]=o%256}return r},decompressFromUint8Array:function(t){if(null===t||void 0===t)return s.decompress(t);for(var r=new Array(t.length/2),i=0,n=r.length;i<n;i++)r[i]=256*t[2*i]+t[2*i+1];var o=[];return r.forEach(function(t){o.push(e(t))}),s.decompress(o.join(""))},compressToEncodedURIComponent:function(e){return null==e?"":s._compress(e,6,function(e){return r.charAt(e)})},decompressFromEncodedURIComponent:function(e){return null==e?"":""==e?null:(e=e.replace(/ /g,"+"),s._decompress(e.length,32,function(t){return n(r,e.charAt(t))}))},compress:function(t){return s._compress(t,16,function(t){return e(t)})},_compress:function(e,t,r){if(null==e)return"";var i,n,s,o={},a={},u="",l="",c="",h=2,d=3,f=2,p=[],y=0,m=0;for(s=0;s<e.length;s+=1)if(u=e.charAt(s),Object.prototype.hasOwnProperty.call(o,u)||(o[u]=d++,a[u]=!0),l=c+u,Object.prototype.hasOwnProperty.call(o,l))c=l;else{if(Object.prototype.hasOwnProperty.call(a,c)){if(c.charCodeAt(0)<256){for(i=0;i<f;i++)y<<=1,m==t-1?(m=0,p.push(r(y)),y=0):m++;for(n=c.charCodeAt(0),i=0;i<8;i++)y=y<<1|1&n,m==t-1?(m=0,p.push(r(y)),y=0):m++,n>>=1}else{for(n=1,i=0;i<f;i++)y=y<<1|n,m==t-1?(m=0,p.push(r(y)),y=0):m++,n=0;for(n=c.charCodeAt(0),i=0;i<16;i++)y=y<<1|1&n,m==t-1?(m=0,p.push(r(y)),y=0):m++,n>>=1}0==--h&&(h=Math.pow(2,f),f++),delete a[c]}else for(n=o[c],i=0;i<f;i++)y=y<<1|1&n,m==t-1?(m=0,p.push(r(y)),y=0):m++,n>>=1;0==--h&&(h=Math.pow(2,f),f++),o[l]=d++,c=String(u)}if(""!==c){if(Object.prototype.hasOwnProperty.call(a,c)){if(c.charCodeAt(0)<256){for(i=0;i<f;i++)y<<=1,m==t-1?(m=0,p.push(r(y)),y=0):m++;for(n=c.charCodeAt(0),i=0;i<8;i++)y=y<<1|1&n,m==t-1?(m=0,p.push(r(y)),y=0):m++,n>>=1}else{for(n=1,i=0;i<f;i++)y=y<<1|n,m==t-1?(m=0,p.push(r(y)),y=0):m++,n=0;for(n=c.charCodeAt(0),i=0;i<16;i++)y=y<<1|1&n,m==t-1?(m=0,p.push(r(y)),y=0):m++,n>>=1}0==--h&&(h=Math.pow(2,f),f++),delete a[c]}else for(n=o[c],i=0;i<f;i++)y=y<<1|1&n,m==t-1?(m=0,p.push(r(y)),y=0):m++,n>>=1;0==--h&&(h=Math.pow(2,f),f++)}for(n=2,i=0;i<f;i++)y=y<<1|1&n,m==t-1?(m=0,p.push(r(y)),y=0):m++,n>>=1;for(;;){if(y<<=1,m==t-1){p.push(r(y));break}m++}return p.join("")},decompress:function(e){return null==e?"":""==e?null:s._decompress(e.length,32768,function(t){return e.charCodeAt(t)})},_decompress:function(t,r,i){var n,s,o,a,u,l,c,h=[],d=4,f=4,p=3,y="",m=[],g={val:i(0),position:r,index:1};for(n=0;n<3;n+=1)h[n]=n;for(o=0,u=Math.pow(2,2),l=1;l!=u;)a=g.val&g.position,g.position>>=1,0==g.position&&(g.position=r,g.val=i(g.index++)),o|=(a>0?1:0)*l,l<<=1;switch(o){case 0:for(o=0,u=Math.pow(2,8),l=1;l!=u;)a=g.val&g.position,g.position>>=1,0==g.position&&(g.position=r,g.val=i(g.index++)),o|=(a>0?1:0)*l,l<<=1;c=e(o);break;case 1:for(o=0,u=Math.pow(2,16),l=1;l!=u;)a=g.val&g.position,g.position>>=1,0==g.position&&(g.position=r,g.val=i(g.index++)),o|=(a>0?1:0)*l,l<<=1;c=e(o);break;case 2:return""}for(h[3]=c,s=c,m.push(c);;){if(g.index>t)return"";for(o=0,u=Math.pow(2,p),l=1;l!=u;)a=g.val&g.position,g.position>>=1,0==g.position&&(g.position=r,g.val=i(g.index++)),o|=(a>0?1:0)*l,l<<=1;switch(c=o){case 0:for(o=0,u=Math.pow(2,8),l=1;l!=u;)a=g.val&g.position,g.position>>=1,0==g.position&&(g.position=r,g.val=i(g.index++)),o|=(a>0?1:0)*l,l<<=1;h[f++]=e(o),c=f-1,d--;break;case 1:for(o=0,u=Math.pow(2,16),l=1;l!=u;)a=g.val&g.position,g.position>>=1,0==g.position&&(g.position=r,g.val=i(g.index++)),o|=(a>0?1:0)*l,l<<=1;h[f++]=e(o),c=f-1,d--;break;case 2:return m.join("")}if(0==d&&(d=Math.pow(2,p),p++),h[c])y=h[c];else{if(c!==f)return null;y=s+s.charAt(0)}m.push(y),h[f++]=s+y.charAt(0),s=y,0==--d&&(d=Math.pow(2,p),p++)}}};return s}();void 0===(i=function(){return n}.call(t,r,t,e))||(e.exports=i)}]);