export class BrowserInteractor {
    static storeToLocalStorage(key: string, obj: Object) {
      window.localStorage[key] = JSON.stringify(obj);
    }
  
    static downloadFile(filename: string, obj: Object) {
      const blob = new Blob([JSON.stringify(obj)], { type: 'text/json' });
      const elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = filename;
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    }
  }
