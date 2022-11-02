let wrapper: HTMLDivElement;
let iFrame: HTMLIFrameElement;
let button: HTMLButtonElement;

/**
 * Reads and parses the URL parameter
 * https://www.malcontentboffin.com/2016/11/TypeScript-Function-Decodes-URL-Parameters.html
 * @param queryString
 */
function parseQueryString(queryString?: string): any {
    // if the query string is NULL or undefined
    if (!queryString) {
        queryString = window.location.search.substring(1);
    }
    const params = {};
    const queries = queryString.split("&");
    queries.forEach((indexQuery: string) => {
        const indexPair = indexQuery.split("=");
        const queryKey = decodeURIComponent(indexPair[0]);
        const queryValue = decodeURIComponent(indexPair.length > 1 ? indexPair[1] : "");
        params[queryKey] = queryValue;
    });
    return params;
}

declare let Settings: any;
function init(){
    button=document.createElement('button');
    button.type="button";
    button.className="btn btn-default navbar-btn";
    button['data-toggle']="modal";
    button.innerText="Open WIDE";
    button.onclick=open;
    // Wait for DOM element to show up:
    let try_attach=()=>{
        let element=document.querySelector('#TopNavigationBar .nav');
        if(element){
            element.append(button);
        }else{
            window.requestAnimationFrame(try_attach);
        }
    };
    try_attach();

    wrapper=document.createElement('div');
    wrapper.style.position='fixed';
    wrapper.style.top='0px';
    wrapper.style.bottom='0px';
    wrapper.style.left='0px';
    wrapper.style.right='0px';
    wrapper.style.display='none';
    wrapper.style.zIndex='5000';
    wrapper.style.backgroundColor='#fff';

    iFrame=document.createElement('iframe');
    let paramstring = window.location.search.substring(1);
    iFrame.src = './index.html?' + paramstring;
    iFrame.style.width='100%';
    iFrame.style.height='100%';
    iFrame.style.border='0';
    iFrame.style.overflow='hidden';

    wrapper.append(iFrame);
    document.body.append(wrapper);

    window.addEventListener('wide-close', ()=>{
        onClose();
    });

    window.addEventListener('wide-upload', ()=>{
        onUpload();
    });

    window.addEventListener('wide-ready', ()=>{
        setTimeout(() => {
            iFrame.contentWindow.dispatchEvent(new CustomEvent("wide-set-pspu",{
                detail: {
                    PSPUType: Settings.ECPPhysicalSystemName
                }
            }));
            iFrame.contentWindow.dispatchEvent(new CustomEvent("wide-set-user-data",{
                detail: {
                    SessionID: Settings.SessionID,
                    ExperimentID: Settings.ExperimentID
                }
            }))
        },1000);
    });
}

declare var $: any;
declare var CommandMessage: any;
declare var EnumCommand: any;
declare var EventHandler: any;
let onUpload=()=>{
    close();
    $('#WaitingDialog').modal('show');
    $('#ProgrammingProgressBar').css('width', '0%');
    $('#UploadingProgressBar').css('width', '0%');

    var Message = new CommandMessage();
    Message.setType(EnumCommand.LoadDesign);
    EventHandler.fireCommandEvent(Message);
};

let onClose=()=>{
    close();
};

function close(){
    wrapper.style.display='none';
}

function open(){
    wrapper.style.display='block';
    iFrame.contentWindow.dispatchEvent(new CustomEvent('wide-open-frame'));
}

$(document).ready(() => {
    init()
});