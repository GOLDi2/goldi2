class Task{
    constructor(id, language, content, resStream, upload){
        this.id = id;
        this.language = language;
        this.content = content;
        this.estimate = 0;
        this.resStream = resStream;
        this.upload = upload;
        this.value = 0;
        this.sendEstimateInterval = setInterval(() => {
            resStream.sendEstimate(this.estimate);  
        }, 2000);
    }
    updateEstimate (value) {
        this.estimate = value;
    }

}

module.exports = Task;