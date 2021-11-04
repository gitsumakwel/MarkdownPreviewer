

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { connect, Provider } from 'react-redux';
import './index.css';
//import App from './App';
import $ from 'jquery';
//import reportWebVitals from './reportWebVitals';
// eslint-disable-next-line
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import reportWebVitals from './reportWebVitals';
import parse from 'html-react-parser';
import {marked} from "marked/src/marked";


//marked.setOptions({renderer,  breaks: true, });

//to use marked for FCC test, set in CSS 'hide > display' to 'initial'
//and set in CSS 'whenyouseeyoushitbrick > display' to 'none'
//if you want to use my own previewer-interpreter do the opposite
//Redux
/*
const GOLD = "color=#dbd548; fontStyle=italic;";
const VIOLET = "color=#912787;";
const GREEN = "color=#56b051;";
const BLUE = "color=#4eadbe";
const GRAY = "color=#978da4;";
const BROWN = "color=#9c6d42;";
*/

const RUN = 'RUN';
const RUNFCC = 'RUNFCC';
const RESIZE = 'RESIZE';
const EXPAND = 'EXPAND';

// todo: table
// resize containers
// for small device: full screen only for each, use toggle
// make this look professional

//check in order
//1. Will match everything inside and right of this
//do not use markdown elements inside %%
//do not use markdown elements and progStyle right of //
//comment, code
//comments and code must be in the first of a new line

const progTag = {
  "comment" : {tag:`<comment></comment>`, rule:'(?<!https:)//[^<>]*(?=<br/>)?', rule2:'<comment>.*?<\\/comment>'}, // treat as comment, once comment do nothing to the inside, most powerful tag
  "codes" : {tag:`<div className="codes container-fluid"></div>`, rule:`%%<br/>(?!%%)+.*?<br/>%%`, rule2:'<div className="codes">.*?</div>'}, // treat as code, will use progStyle for all character inside code
}

 //2.optional: use when inside %%
// you need to make a rule per item :/
//'=':{container:'<violet>=</violet>', rule:'(?<=(<br\/>)?) \w+ =(?= )'}
const progStyle = {
  '=' : {tag:'<violet>=</violet>', rule:'(?<=(<br/>)?[ (&emsp;)]*[a-zA-Z]([\\w-_]*\\w+)?[ (&emsp;)]*)={1,3}(?=[ (&emsp;)]*([\'"][a-zA-Z]([\\w-_]*\\w+)?[\'"]))'},
  "&" : {tag:'<violet>&</violet>', rule:'(?<!=<br/>//.*?)(?<=\\([ (&emsp;)]*[\'"][a-zA-Z]([\\w-_]*\\w+)?[\'"])&{1,2}(?=[ (&emsp;)]*[\'"][a-zA-Z](\\w-_]*\\w+)?[\'"]\\))'},
  'function' : {tag:'<gold>function</gold>', rule:'(?<=(<br/>) *)function(?= *\\()|(?<== *)function(?=[ (]+)|(?<=\\( *([a-zA-Z]([\\w-_]*[a-zA-Z0-9]+)? *,)? *)function(?= *\\()|(?<=[a-zA-Z]([\\w-_]*\\w+)? *: *)function(?= *\\( *)'},
  'this' : {tag:'<gold>this</gold>', rule:'(?<=(<br/>)[ (&emsp;)]*)this(?=.)|(?<=[=;] *)this(?=.)|(?<=[a-zA-Z]([\\w-_]*\\w+)? *: *)this(?=.)'},
  'extends' : {tag:'<gold>extends</gold>',rule:'(?<=<br/>[ (&emsp;)]*class [a-zA-Z]([\\w-_]*\\w+)? )extends(?= +)|(?<=@)extends(?= +)'},
  'super' :  {tag:'<gold>super</gold>', rule:'(<!=<br/>.*?//.*?)(?<=constructor\\(([a-zA-Z]([\\w-_]*\\w+)?|props)?\\) ?{ ?<br/>[ (&emsp;)]*)super(?= ?\\()'},
  'for' : {tag:'<gold>if</gold>', rule:'(?<=[(<br/>);\\{][ (&emsp;)]*)for(?= *\\()'},
  'return' : {tag:'<violet>return</violet>', rule:'(?<=[<br/>{][ (&emsp;)]*(else|(default|case) ?(\'[a-zA-Z]([\\w-_]*\\w+)?\'|[a-zA-Z](\\w-_]*\\w+)?)? *: *(\'[a-zA-Z]([\\w-_]*\\w+)?\'|[a-zA-Z]([\\w-_]*\\w+)?;)? *)?[ (&emsp;)]*)return(?=[ *|;])|(?<=(else )?if *\\((true|[a-zA-Z](\\w-_]*\\w+)?|false)\\) *)return(?=[ ;])'},
  'while' : {tag:'<gold>if</gold>', rule:'(?<=({(<br/>)?|<br/>)[ (&emsp;)]*(do[ {] *.*?})? *)while(?=[ (])'},
  'do' : {tag:'<gold>if</gold>', rule:'(?<=[(<br/>){]?[ (&emsp;)]*)do(?=[ {] *)'},
  'const' : {tag:'<violet>const</violet>', rule:'(?<=(<br/>)?[ (&emsp;)]*)const(?= +[a-zA-Z]([0-9A-Z-_]*[a-zA-Z0-9]+)?)'},
  'let' : {tag:'<violet>let</violet>', rule:'(?<=(<br/>)?[ (&emsp;)]*)let(?= +[a-zA-Z]([\\w-_]*\\w+)?)'},
  'def' : {tag:'<violet>def</violet>', rule:'(?<=(<br/>)[ (&emsp;)]*)def(?= [a-zA-Z]([\\w-_]*\\w+)?:)'},
  'var' : {tag:'<violet>var</violet>', rule:'(?<=(<br/>)?[ (&emsp;)]*)var(?= +[a-zA-Z]([0-9a-zA-Z-_]*[a-zA-Z0-9]+)?)'},
  'if' : {tag:'<gold>if</gold>', rule:'(?<=({|<br/>)[ (&emsp;)]*(else)?[ (&emsp;)]*)if(?=[ (])'},
  'else' : {tag:'<gold>else</gold>', rule:'(?<=(if \\(true|[a-zA-Z]([\\w-_]*\\w+)?|false\\)[ (&emsp;)]*({.*?}|.*?)(<br/>))?)else(?=[ ])'},
  'case' : {tag:'<gold>case</gold>', rule:'(?<=((switch *(\\([a-zA-Z]([\\w-_]*\\w+)?\\)|\\((\'|")[a-zA-Z]([\\w-_]*\\w+)?(\'|")\\)) *\\{<br/>)|(case ((\'[a-zA-Z]([\\w-_]*\\w+)?\')|([a-zA-Z]([\\w-_]*\\w+)?)) *:.*?;<br/>))[ (&emsp;)]*)case(?=[ ])'},
   'default' : {tag:'<gold>default</gold>', rule:'(?<=<gold>case</gold>.*?; *<br/>[ (&emsp;)]*)default(?= *:)'},
  'switch' : {tag:'<gold>switch</gold>', rule:'(?<=({(<br/>)|<br/>) *)switch(?=[ (])'},
  'String' : {tag:'<blue>String</blue>', rule:'(?<=(<br/>)?[ (&emsp;)]*[(=]?[ (&emsp;)]*)String(?=[.(])'},
  'Number' : {tag:'<blue>Number</blue>', rule:'(?<=(<br/>)?[ (&emsp;)]*[(=]?[ (&emsp;)]*)String(?=[.(])'},
  ':' : {tag:'<violet>:</violet>', rule:'(?<=([\'"][a-zA-Z]([\\w-_]*\\w+)?[\'"]|[a-zA-Z]([\\w-_]*\\w+)?) *):(?= *([\'"][a-zA-Z]([\\w-_]*\\w+)?[\'"]|[a-zA-Z]([\\w-_]*\\w+)?))'},
  'class' : {tag:'<gold>class</gold>', rule:'(?<=(<br/>)? *(&emsp;)*)class(?= +)'},
  'quote' : {tag:'<green>\'"quote"\'</green>', rule:'(?<=(</gold>|</violet>|:|<br/>)[ (&emsp;)]*)(&#39;[a-zA-Z]([\\w-_]*\\w+)?&#39;|&#34;[a-zA-Z]([\\w-_]*\\w+)?&#34;)|(?<=()((&#39;[a-zA-Z]([\\w-_]*\\w+)?&#39;)|(&#34;[a-zA-Z]([\\w-_]*\\w+)?&#34;))(?=))'}, //special we need to include the items enclose with '' or ""
};

//4. get all
//((?!<div className="codes">.*?</div>)|(?!<comment>.*?</comment>))
const markNewLine = {
  "table" : {tag:'<table>', rule:'(?<=<br/>)[\\w-_ ~!\\*\\.\\+\\?$&()/\\\\]+(( *\\| *[\\w-_~ !\\?\\*\\.\\+$&()/\\\\]* *)*(<br/> *\\*{5,} *<br/>[\\w-_ ~!\\*\\.\\?\\+$&())/\\\\]+( *\\| *[\\w-_~ !\\*\\.\\?\\+$&()/\\\\]* *)*)*)*<br/> *\\*{5,}'}, // item|item
  ">" : {tag:'<blockquote>', rule:'(?<=<br/>[ (&emsp;)]*)&#62{1,}.*?(?=<br/>)'},
  "-" : {tag:'<li>', rule:'<br/>[ (&emsp;)]*-+.*?<b/>([ (&emsp;)]*-+.*?<br/>)*'}, //ol, enclose with another ol the more it have
  "." : {tag:'<li>', rule:'<br/>[ (&emsp;)]*\\.+.*?<br/>([ (&emsp;)]*\\.+.*?<br/>)*'}, //ul, enclose with another ul the more it have
  "#" : {tag:'<h', rule:'(?<=<br/>)#+.*?(?=<br/>)'},
}
//only evaluate outside progTag
const markdown = {
  "!!" : {tag:'<b>', rule:'(?<=!!).*?(?=!!)'}, //bold item !!BOLD!!
  "@@" : {tag:'<i>', rule:'(?<=@@).*?(?=@@)'}, //italicize item @@Italic@@
  "__" : {tag:'<u>', rule:'(?<=__).*?(?=__)'}, //underline __Underline__
  "~~" : {tag:'<span className="overline">', rule:'(?<=~~).*?(?=~~)'}, //~~Overline~~
  "_~" : {tag:'<span className="midline">', rule:'(?<=_~).*?(?=_~)'}, //_~Strike_~
  "[img]" : {tag:'<img className="container-fluid" src=', rule:'(?<=\\[img\\]).*?(?=\\[img\\])'},
  "[link]" : {tag:'<a href=', rule:'(?<=\\[link\\]).*?(?=\\[link\\])'},
   "incode" : {tag:'<code>', rule:'(?<=\\`).*?(?=\\`)'},
}
//table


const INPUTFCC = `# Welcome to my React Markdown Previewer!

## This is a sub-heading...
### And here's some other cool stuff:

Heres some code, \`<div></div>\`, between 2 backticks.

\`\`\`
// this is multi-line code:

function anotherExample(firstLine, lastLine) {
  if (firstLine === '\`\`\`' && lastLine === '\`\`\`') {
    return multiLineCode;
  }
}
\`\`\`

You can also make text **bold**... whoa!
Or _italic_.
Or... wait for it... **_both!_**
And feel free to go crazy ~~crossing stuff out~~.

There's also [links](https://www.freecodecamp.org), and
> Block Quotes!

And if you want to get really crazy, even tables:

Wild Header | Crazy Header | Another Header?
------------ | ------------- | -------------
Your content can | be here, and it | can be here....
And here. | Okay. | I think we get it.

- And of course there are lists.
  - Some are bulleted.
     - With different indentation levels.
        - That look like this.


1. And there are numbered lists too.
1. Use just 1s if you want!
1. And last but not least, let's not forget embedded images:

![freeCodeCamp Logo](https://cdn.freecodecamp.org/testable-projects-fcc/images/fcc_secondary.svg)

`;





const INPUT = `Namae wa Bronx Desu.
#Yoroshiku Onigaishimasu..
%%
sample coder
%%
##Namae wa Bronx Desu.
Yoroshiku Onigaishimasu..
%%
//inside the coder
onigaishimasu
class TestClass{
  if (true) return;
  else if(false) return false;
  else return again;
	return 1 + 1;
  switch (x) {
    case 'z': return;
    case a : return; "newman"
    default: return x;
"newman";
a = 'newman';
{b:'newman'};
  }
}
%%

words that will be followed by an  \`inline code\` and words after it.

freecodecamp: [link]https://freecodecamp.org[link]

hanabishi | musashi
*****
deku | father
*****
salamander | strider
*****

Brill|autonomous|nekomamushi
*****
hello
*****
 |ganbatte|
*****

[img]https://lh3.googleusercontent.com/3GF3OkxCF1U1s9s1n3USnrW8gpZNZaVNkDhhonprikKP43AoCc4XUIolsbEgiXpih06ZJQCuqkqneeHt20iXiA8fAYWnvj8Urt6qn076BZekOqzXXPjUSsOC6MYXMjEgEiMZIF9_Pg=w2400[img]

@@stay with me@@
!!bold!!
_~strike_~
~~over~~
__underline__

-hello
---hi
---insert hi
-how are you

.unorder list
.next in the list
..another layer
...super layer
.back to the first layer

>blockquote
%%
another coder
%%
>>block quote
//comment is love
I need to put Enter something...
//comment %%do not put in coder %%`;


//states that changes
const runState = {
  input: '',
  inputFCC: '',
  output: 'HI',
}
const sizeState = {
  toggleExpand: false,
  width: "50vw",
  height: "100vh",
}
const runActionFCC = (inputFCC) => {
   return {
      type: RUNFCC,
      inputFCC: inputFCC,
   }
}
const runAction = (input) => {

  return {
    type: RUN,
    input: input,
  }
}
// eslint-disable-next-line
const resizeAction = () => {
  return {
    type: RESIZE,
  }
}
// eslint-disable-next-line
const expandAction = ()=>{
  return {
    type: EXPAND,
  }
}
//will evaluate markdown
const runReducer = (state = runState, action)=>{
  const newState = Object.assign({},state);
  switch (action.type) {
     case RUNFCC:
      newState.inputFCC = action.inputFCC;
      return newState;
    case RUN:
      newState.input = action.input;
      return newState;
    default:
      return state;
  }
}

const sizeReducer = (state = sizeState, action)=>{
  const newState = Object.assign({},state);
  switch (action.type) {
    case RESIZE:
      return newState;
    case EXPAND:
      return newState;
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  run: runReducer,
  size: sizeReducer,
})

const store = createStore(rootReducer,applyMiddleware(thunk));

//React-Redux
//React

//'https://unpkg.com/html-react-parser@latest/dist/html-react-parser.min.js';
//'https://cdn.skypack.dev/html-react-parser';

class Previewer extends React.Component {
   constructor(props){
      super(props);
      this.state = {
         input: '',
      }
   }

    seepreview(input){
       marked.use({breaks:true});
       $('#preview').html(marked(input)==null?'<h1>error</h1>':marked(input));
    }
   render() {
      return (
         <div className='hidden container-fluid hide' style={{width:this.props.state.size.width, height:this.props.state.size.height}}>
            <div id="preview">
            </div>
            {this.seepreview(this.props.state.run.inputFCC)}

      </div>);
   }
}
//ninja mode
class Interpreter extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      input: '',
    }
    this.interpret = this.interpret.bind(this);
  }

  //toggleIcon :  sizeState.toggleExpand?<i class="fas fa-window-maximize"></i>:<i class="fas fa-window-minimize"></i>,
  //.state is given from mapStateToProps
  //.run was the connector given by the store from rootReducer

  //interpreter
  interpret (input){
    //interpret input
    //lets test
    //working
    //newline, newline:hello
    //this.props.state.run.output = <div><br/>hello</div>;
    //newline, newline:hello, newline:hi
    //this.props.state.run.output =<div><div><br/>hello</div><div>hi</div></div>;

    //planning...
    //lets process input: this.props.state.run.input
    //i will use data to style inside codes and comment
    let DATA = input.slice();
    const coders = [];
    let replace = "";
    let willWrite = true;

    //transform all < and > to HTML Code
    //this will help us separate strings
    DATA = DATA.replace(new RegExp('<','g'),'&#60;');
    DATA = DATA.replace(new RegExp('>','g'),'&#62;');
    // eslint-disable-next-line
    DATA = DATA.replace(new RegExp('\t','g'),'&emsp;');
    // eslint-disable-next-line
    DATA = DATA.replace(new RegExp('\n','g'),'<br/>');

    //Lets use regex to replace things
    //...get comment pattern
    //can only comment every single line
    //this is a comment sample
    let pattern = '';
    let regexp = null;
    for (let tag in progTag){
      regexp = new RegExp(progTag[tag].rule,'g');
      if (regexp.test(DATA)){
        replace = DATA.match(regexp);
        // eslint-disable-next-line
        replace.forEach(item => {
          switch (tag) {
            case 'comment':
               DATA = DATA.replace(item,'<comment>$&</comment>');
              break;
            case 'codes':
              //coder must have %% first line and last line of the code pattern
              //##
              //function () {}
              //##
              pattern = /(?<=%%<br\/>).*(?=<br\/>%%)/g;
              if (pattern.test(item)) {
                let newItem = item.match(pattern);
                const r = '<pre className="codes container-fluid"><code>'+newItem+'</code></pre>';
                //lets save the coders string to manipulate to look for tags
                coders.push({str:newItem[0]})
                DATA = DATA.replace(item,r);
              }
              break;
            default:
              break;
          } //switch
        });//replace.forEach
      } //if
    } //for


    //iterate each key in Object.keys(progStyle)
    //use regex to find and replace inside the div.codes
    coders.forEach(item => {
      let xitem = item.str.slice();
      let temp = "";
      let r = null;
      Object.keys(progStyle).forEach(tag =>{
        //if (tag!='quote')return;    //remove this after testing

        if (tag==='quote'){
          temp = xitem.slice();
          xitem = xitem.replace(new RegExp("'",'g'),'&#39;');
          xitem = xitem.replace(new RegExp('"','g'),'&#34;');
          const pattern = progStyle[tag].rule;
          const regex = new RegExp(pattern,'gi');
          if (regex.test(xitem)) {
            r = xitem.replace(regex,`<green>$&</green>`);
            DATA = DATA.replace(temp,r);
          }
        }
        else {
          const pattern = progStyle[tag].rule;
          const regex = new RegExp(pattern,'g');
          if (regex.test(xitem)) {
             r = xitem.replace(regex,progStyle[tag].tag);
             DATA = DATA.replace(xitem,r);
          }
        }
        if (r!==null) xitem = r;
      }) //progTag
      item.str = xitem;
    })//coders

    const specialTags = () => {
       //find all codes and comment indexes, to be use later in style
       const tags = {codes:{pattern:progTag['codes'].rule2,found:[]}, comment:{pattern:progTag['comment'].rule2,found:[]},};

       for (let item in tags){
         const regexp = new RegExp(tags[item].pattern,'gi');

         let mattch = null;
         //do not use test unless you will use match afterward
         //the index for exec will move to the next search if you use test without match
         do  {
           mattch = regexp.exec(DATA);
           //lets find the index, onigaishimasu, sil te plait, sil vu plait
           if (mattch) tags[item].found.push({text:mattch[0],index:mattch.index})
         } while (mattch);
       }
      return tags;
    }


   //cycle marks in markNewLine: blockquote, ordered list, unordered list
   for (let m in markNewLine) {
      const tags = specialTags();
      const mark = markNewLine[m];
      const regexp = new RegExp(mark.rule,'g');
      //if (m==='table') console.log(regexp)
     //if you use test it wont include the first exec
      let execMark = null;
      do {
        //use regexpression to find them
        execMark = regexp.exec(DATA);
        if (execMark) {

          willWrite = true;
          //cycle through comments and codes
          //see if exec is inside
          //if found, you cannot alter the DATA
          const indx = execMark.index;
          for (let tag in tags){
            // eslint-disable-next-line
            tags[tag].found.every((item,itemdex) => {

              if (indx > item.index && indx < item.index + item.text.length) {
                willWrite = false;
                return false;
              }
              return true;
            })
          }
          if (willWrite) {
            //i need to have rules for list and blockquote, they are different
            //blockquote will ignore if another '>' is found inside
            //list will add another layer of list inside itself if found '.' or '-'
            //1.copy
            let xData = DATA.split('');

            let em = execMark[0].slice(); // execMark[0] found characters with markdown(newline)

            //2. slice and insert
            let catenateMark = '';

            if  (m==='table'){
               //console.log(em);
               const emcount = em.length; //we need this in exec, since were going to alter our extracted data, maybe reduced so we will adjust the last index of our regex.
               let emreducedcount = 0;
               em = em.split('*****').map(item => {
                  item = item.split('<br/>').join('');

                  if ((/\\|/).test(item)) {
                     emreducedcount += item.length; // need to adjust regex last index
                     return item.split("|");
                  }else {

                  return [item];
                  }
               });
               em.splice(em.length-1);
               em = em.map((row,rowdex) => {
                  return (`<tr>${ row.map(item=>rowdex===0?'<th scope="col">'+item+'</th>':'<td>'+item+'</td>').join('')}</tr>`);
               })

               const thead = `<thead className="elegant-color-dark">${em[0]}</thead>`;
               const tbody = `<tbody>${em.slice(1).join('')}</tbody>`

               //set regex last index
               regexp.lastIndex -= (emcount - emreducedcount);
               //process em to place in a table
               //put in catenateMark
               //bootstrap: table-striped
               catenateMark = `<table className="table table-hover">${thead+tbody}</table>`;
            }

             else if (m==='>')catenateMark = `${mark.tag}${em.slice(5)}${mark.tag[0]+'/'+mark.tag.slice(1)}`;             //sliced 5 because of &#62;

            else if (m==='.'||m==='-') {
              //remove first <br/>
              //convert into a list using split by <br/>
              //create a html list out of the items
              const list = em.slice(5).split('<br/>');
              //only four layers of ul, ol

              let preLayer = 1; //preLayer
              const rpattern = new RegExp(m==='.'?'^\\.+':'^-+');
              //initialize ul,ol for cloning
              const layer = (m==='.')?document.createElement('ul'):document.createElement('ol');
              //initialize li for cloning
              const node = document.createElement('li');
              const branches = [layer.cloneNode(true)];
               branches[0].setAttribute('id','firstLayer');
              let curNode = branches[0];
              list.forEach(item =>{
                if (rpattern.test(item)){
                  const len = item.match(rpattern).join('').length; //current Layer

                  const data = item.slice(len)
                  //check different layer
                  //automate
                  if (len === 1){
                    const n = node.cloneNode(true);
                    n.innerHTML = data;
                    branches[0].append(n);
                    curNode = branches[0];
                  }
                  else if (len > preLayer){
                    const nlayer = [];
                    let diff = len - preLayer;
                    //create instance of node in array
                    while (diff > 0){
                      nlayer.push(layer.cloneNode(true));
                      diff -= 1;
                    }
                    //create an li element, insert the data, and append to last layer
                    const x = node.cloneNode(true);
                    x.innerHTML = data;
                    nlayer[nlayer.length-1].append(x);
                    //stack them layers
                    diff = len - preLayer;
                    while (diff > 1){
                      nlayer[diff-2].append(nlayer[diff-1]);
                      diff -= 1;
                    }
                    curNode.append(nlayer[0]);
                    curNode = nlayer[nlayer.length-1];
                  } else if (len === preLayer) {
                    const x =node.cloneNode(true);
                    x.innerHTML = data
                    curNode.append(x);
                  } else if (len < preLayer){
                    let diff = preLayer - len;
                    while(diff > 0){
                    curNode = curNode.parentNode;
                    diff -= 1;
                    }
                    const x = node.cloneNode(true);
                    x.innerHTML = data;
                    curNode.append(x);
                  }
                  preLayer = len;

                }
              });
              catenateMark = `${m==='.'?'<ul>':'<ol>'}${branches[0].innerHTML}</${m==='.'?'ul>':'ol>'}`;
            } //li
             else if (m==='#'){
               const hashlen = em.slice().match(new RegExp('^#*',))[0].length
               const item = em.slice(hashlen);
               catenateMark = `${mark.tag+hashlen+'>'+item+mark.tag[0]+'/'+mark.tag.slice(1)+hashlen+'>'}`;
            }

            xData = xData.slice(0,indx)+catenateMark+xData.slice(indx+execMark[0].length,);
            DATA = xData.split(',').join('');
          }
        }
      }while (execMark);
   } //markNewLine

  //cycle through markdown
 for (let m in markdown) {

      const tags = specialTags(); //this is comment and coders
      const mark = markdown[m];
      const regexp = new RegExp(mark.rule,'g');
     //if you use test it wont include the first exec
      let execMark = null;
      do {
        //use regexpression to find them
        execMark = regexp.exec(DATA);
        if (execMark) {
          willWrite = true;
          //cycle through comments and codes
          //see if exec is inside
          //if found, you cannot alter the DATA
          const indx = execMark.index;

          for (let tag in tags){
            // eslint-disable-next-line
            tags[tag].found.every((item,itemdex) => {
              if (indx > item.index && indx < item.index + item.text.length) {
                willWrite = false;
                return false;
              }
              return true;
            })
          }
          if (willWrite) {

            //1 copy
            let xData = DATA.split('');
            let em = execMark[0].slice();

             //2 slice and insert
            let catenateMark = '';
            //sliced 5 because of &#62;
            //babel jsx will automatically remove the other properties from </tag>

            if(m==='[img]') catenateMark = `${mark.tag}'${em}'/>`;
            else if(m==='[link]') catenateMark = `${mark.tag}'${em}'>link</a>`;
            else if (m!=='[img]') catenateMark = `${mark.tag}${em}${mark.tag[0]+'/'+mark.tag.slice(1)}`;
            let adjust = 0;
            if (m==='incode')adjust=5;
            xData = xData.slice(0,execMark.index+adjust-m.length)+catenateMark+xData.slice(execMark.index-adjust+execMark[0].length+m.length,);

            DATA = xData.split(',').join('');
          }
        }
      }while (execMark);
   } //markNewLine
    //last: enclosed with <div></div>
    //htmlReactParser();
    //parse();
    //final retouch
    /*
    const options = {
      replace: ({ attribs, children }) => {
        if (!attribs) {
          return;
        }

        if (attribs.class === 'comment') {
          return (
            <comment style={{ color: 'blue'}}>
              {domToReact(children, options)}
            </comment>
          );
        }
      },
     replace: domNode =>{
       if (!domNode) return;
       if (domNode.name =="comment"){
         return (
           <comment style={{ color: 'green'}}>
             {domToReact(domNode.children, options)}
           </comment>
          );
       }
     }
    };
    return parse('<div>'+DATA+'</div>',options);
    */
   //return marked('<div>'+DATA+'</div>');

   //we have to substitute to remove warning :)
   DATA = DATA.replace(new RegExp('<gold>','gi'),'<span className="gold">');
   DATA = DATA.replace(new RegExp('<violet>','gi'),'<span className="violet">');
   DATA = DATA.replace(new RegExp('<green>','gi'),'<span className="green">');
   DATA = DATA.replace(new RegExp('<blue>','gi'),'<span className="blue">');
   DATA = DATA.replace(new RegExp('<gray>','gi'),'<span className="gray">');
   DATA = DATA.replace(new RegExp('<comment>','gi'),'<span className="comment">');
   DATA = DATA.replace(/<\/[gvb][olri]\w{1,3}[tneyd]>/gi,'</span>');
   DATA = DATA.replace(/<\/comment>/gi,'</span>');
  
   return parse('<div>'+DATA+'</div>');
  }

  render(){
    return (
      <div className="container-fluid flex-d whenyouseeyoushitbrick align-items-start" style={{width:this.props.state.size.width, height:this.props.state.size.height}}>
        <div id="interpreter" className="container container-fluid scroll">{this.interpret(this.props.state.run.input)}</div>
      </div>
    )
  }
}
class Editor extends React.Component {
   constructor(props){
      super(props);
      this.state = {
         inputFCC: INPUTFCC,
      }
   }
   coderDidChange = ()=>{
    this.setState((state)=>({
      inputFCC: $('textarea#editor').val(),
    }));
    this.props.runPreviewer(this.state.inputFCC)
  }
  coderKeyDown = (event)=>{
    switch (event.key) {
      case 'Enter':
        this.props.state.run.inputFCC += `\r\n`;
        break;
      case 'Tab':
        //https://stackoverflow.com/questions/6140632/how-to-handle-tab-in-textarea
        const START = event.target.selectionStart;
        const END = event.target.selectionEnd;
        //add \t between start and end
        event.target.value = event.target.value.substr(0,START) + "\t" + event.target.value.substr(END);
        event.target.selectionStart = event.target.selectionEnd = START+1;
        //set caret
        this.props.state.run.inputFCC = event.target.value;
        event.preventDefault();
        break;
      default:
        break;
    }
  }
  componentDidMount() {
    $('textarea#editor').on('input',this.coderDidChange);
    $('textarea#editor').on('keydown',this.coderKeyDown);
    this.props.runPreviewer(this.state.inputFCC);
  }
    render(){
      return (
        <div className="hide container-fluid">
          <textarea id="editor" className="" style={{width:this.props.state.size.width, height:'100%'}} cols="50" rows="5" defaultValue={this.state.inputFCC} />
        </div>
      )
    }
}

class Coder extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      input: INPUT,

    }
  }
  coderDidChange = ()=>{
    this.setState((state)=>({
      input: $('textarea#coder').val(),
    }));

    this.props.runCoder(this.state.input)
  }
  coderKeyDown = (event)=>{
    switch (event.key) {
      case 'Enter':
        this.props.state.run.input += `\r\n`;
        break;
      case 'Tab':
        //https://stackoverflow.com/questions/6140632/how-to-handle-tab-in-textarea
        const START = event.target.selectionStart;
        const END = event.target.selectionEnd;
        //add \t between start and end
        event.target.value = event.target.value.substr(0,START) + "\t" + event.target.value.substr(END);
        event.target.selectionStart = event.target.selectionEnd = START+1;
        //set caret
        this.props.state.run.input = event.target.value;
        event.preventDefault();
        break;
      default:
        break;
    }
  }
  componentDidMount() {
    $('textarea#coder').on('input',this.coderDidChange);
    $('textarea#coder').on('keydown',this.coderKeyDown);
    this.props.runCoder(this.state.input);
  }
    render(){
      return (
        <div className="whenyouseeyoushitbrick noscrollbar flex-d align-items-start" style={{width:this.props.state.size.width, height:this.props.state.size.height}}>
          <textarea id="coder" className="container-fluid" style={{height:'100%'}} cols="50" rows="5" defaultValue={this.state.input} />
        </div>
      )
    }
}


const mapStateToProps = (state) => {
  return {state: state}
};

const mapDispatchToProps = (dispatch) => {
  return {
    runCoder: (input) => {
      dispatch(runAction(input))
    },
    runPreviewer: (inputFCC) => {
      dispatch(runActionFCC(inputFCC))
    },
  }
};
const CoderBox = connect(mapStateToProps, mapDispatchToProps)(Coder);
const TransformBox = connect(mapStateToProps, mapDispatchToProps)(Interpreter);
const EditorBox = connect(mapStateToProps, mapDispatchToProps)(Editor);
const PreviewerBox = connect(mapStateToProps, mapDispatchToProps)(Previewer);

class AppWrapper extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <div className="d-flex align-items-start justify-content-center">
          <CoderBox/>
          <TransformBox/>
          <EditorBox/>
          <PreviewerBox/>
        </div>
      </Provider>
    );
  }
};

ReactDOM.render(<AppWrapper/>,document.getElementById('root'));


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
