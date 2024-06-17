import { LitElement, html, customElement, css, property } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { connect } from 'pwa-helpers';
import { store } from './store/configureStore';
import { MetaState } from './types/NormalizedState/MetaState';
import "@material/mwc-icon-button";
import "@material/mwc-button";
import { getCustomNameFromInternalRepresentation } from './actioncreator/helperfunctions';

export interface TableBaseEntry {
  id: number;
  name: string;
  equation: string;
}

export interface TableInteractionEntry extends TableBaseEntry {
  onCommitCb: (entry: TableBaseEntry) => void;
  onRejectCb: (entry: TableBaseEntry) => void;
  subLine: (entry: TableBaseEntry) => void;
}

export interface TableMeta{
  addLine: () => void;
  
}

@customElement('generic-table-element')
export class GenericTableElement extends connect(store)(LitElement) {

  @property({ type: Array, reflect: true })
  entryList: TableInteractionEntry[] = [];

  @property({ type: Array, reflect: true })
  resetList: TableInteractionEntry[] = [];

  @property({ type: String, reflect: true })
  headerName: string = "";

  @property({ type: String, reflect: true })
  headerSignal: string = "";

  @property({ type: Array, reflect: true })
  metaFunctions: TableMeta;

  @property({ type: Number }) yScroll: number = 0;

  @property({ type: Number }) buttonOffset: number = 156;


  constructor() {
    super();
    this.addEventListener('wheel', function (event) {
      event.preventDefault();
      if(event.deltaY<0){
        (this as GenericTableElement).yScroll==0? (this as GenericTableElement).yScroll=0 : (this as GenericTableElement).yScroll--;
      }else{
        (this as GenericTableElement).yScroll>=(this as GenericTableElement).entryList.length-5? (this as GenericTableElement).yScroll=(this as GenericTableElement).yScroll : (this as GenericTableElement).yScroll++;
      }
    })
  }


  static styles = css`
    mwc-button {
  --mdc-theme-primary: black;
  --mdc-theme-on-primary: white;
}
mwc-textfield{
  --mdc-theme-primary: black;
  --mdc-theme-on-primary: white;
}
.grid{
  display: grid;
  border-collapse: collapse;
  background-color: white;
}.left{
    min-width:150px;
}td {
  border-right: solid 2px #343E48;
}tr:nth-child(even) td {
  background: #4f5d6e;
  color: white;
}th {
  position: sticky;
  top: 0;
  background: #343E48;
  text-align: left;
  font-weight: normal;
  font-size: 1.1rem;
  color: white;
}tr{
  display: grid;
  border-collapse: collapse;
grid-template-columns: 
    minmax(150px, 1.67fr)
    minmax(150px, 1.67fr)
    minmax(50px, 0.2fr)
    minmax(50px, 0.2fr)
    minmax(50px, 0.2fr)
}
input[type=text]{
  border:0px;
  background:inherit;
  color:inherit;
  padding:0px;
  font-size:inherit;
  size:inherit;
}

input[type=text]:focus {
  border:0px;
  color:inherit;
  background:inherit;
  outline: none;
  width:100%;
  height:100%;
}

  .top-left-cell {
    border-top-left-radius:6px;
  }
  .top-right-cell{
    border-top-right-radius:6px;
  }
  .bottom-left-cell{
    border-bottom-left-radius:6px;border-bottom: 2px solid #343E48;
  }
  .bottom-right-cell{
    border-bottom-right-radius:6px;border-bottom: 2px solid #343E48;
  }
  .top-block{
    margin-top: -250px;
  }
  .bottom-block{
    margin-top: -50px;
  }

  /* ... */

  `;


  // @property({ type: Array }) tableList: Array<Array<string>> = [["test1", "test2"], ["test3", "test4"],["test5","test6"]];
  // @property({ type: Array }) topRow: Array<string> = ["Signal","Belegung"];


  render() {
    // this.buttonOffset = <number><unknown>(<number>this.shadowRoot?.getElementById("top-left-cell")?.getBoundingClientRect().width+"")
    let shownList = this.entryList.slice(this.yScroll,this.yScroll+5);
    
    this.resetList = [];
    shownList.forEach(entry => this.resetList.push(Object.assign({}, entry)))
    return html`
        <table class="grid" id="table">
        <tr><th id="top-left-cell" class="top-left-cell">${this.headerName}</th><th class="top-right-cell">${this.headerSignal}</th><th style="background:white;"><mwc-icon-button icon="add" style="width:50px;background:white; color:#343E48 " @click=${()=>{this.metaFunctions.addLine()}}></mwc-icon-button></th></tr>
        ${shownList.map((entry, i, arr) => html`


        <tr>
          
        <td style="border-left:2px solid #343E48" class=${classMap({ "bottom-left-cell": i === arr.length - 1 })}> 
        <input value=${entry.name} type="text"></td>

        <td class=${classMap({ "bottom-right-cell": i === arr.length - 1 })}>
        <input 
        value=${entry.equation}
        id=${"cell"+i}
        @input=${(e: InputEvent) => { if ((<HTMLInputElement>e.target).value != undefined) { shownList[i].equation = (<HTMLInputElement>e.target).value };}} type="text">
      </td>
      
      <td style="background:white;color:#343E48;border:none"><mwc-icon-button icon="check_circle" @click=${() => (entry.onCommitCb(shownList[i]))}></mwc-icon-button></td>
      
      <td style="background:white;color:#343E48;border:none"><mwc-icon-button icon="undo" @click=${() => {(shownList[i]=Object.assign({}, this.resetList[i])); 
        (<HTMLInputElement>this.shadowRoot?.querySelector("#cell"+i)).value=this.resetList[i].equation; entry.onRejectCb(shownList[i])}}></mwc-icon-button></td>
      <td style="background:white;color:#343E48;border:none"><mwc-icon-button icon="delete" style="width:50px; color:#343E48" @click=${()=>{entry.subLine(shownList[i])}}></mwc-icon-button></td>
    </tr>`)}
        
        </table>
        <mwc-icon-button icon="expand_more" style="visibility:${(this.entryList.length>5&&!(this.yScroll==this.entryList.length-5))? "visible" : "hidden"}; margin-left:${this.buttonOffset}px; position:absolute" class="bottom-block" @click=${()=>{this.yScroll>=this.entryList.length-5? this.yScroll=this.yScroll : this.yScroll++;}}></mwc-icon-button>
        <mwc-icon-button icon="expand_less" type="button" style="visibility:${(this.entryList.length>5&&!(this.yScroll==0))? "visible" : "hidden"}; margin-left:${this.buttonOffset}px" class="top-block" @click=${()=>{this.yScroll==0? this.yScroll=0 : this.yScroll-- }}></mwc-icon-button>

        `;
  }


}



declare global {
  interface HTMLElementTagNameMap {
    'generic-table-element': GenericTableElement;
  }
}