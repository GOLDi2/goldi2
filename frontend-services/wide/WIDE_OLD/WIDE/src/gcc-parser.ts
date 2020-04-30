// Credit partly goes to https://github.com/particle-iot/gcc-output-parser


class Message{
    filename:string;
    line:number;
    column:number;
    type:string;
    text:string;
    codeWhitespace:string;
    code:string;

    fromGcc(components, stdout) {
        this.filename = components[1];
        this.line = parseInt(components[2]);
        this.column = parseInt(components[3]);
        this.type = components[4];
        this.text = components[5];
        this.codeWhitespace = components[6] ? components[6] : '';
        this.code = components[7] ? components[7] : '';
    
        return this;
    }
}

export class GccParser{

    static parseString(stdout: string) {
        var messages: Message[] = [].concat(
            this.parseGcc(stdout)
        );
        return messages;
    }

    static parseGcc(stdout: string) {
        var messages: Message[] = [];
        var match = null;
    
        var deepRegex = /([^:^\n]+):(\d+):(\d+):\s(\w+\s*\w*):\s(.+)\n(\s+)(.*)\s+\^+/gm;
        //            ^          ^     ^       ^       ^     ^    ^
        //            |          |     |       |       |     |    +- affected code
        //            |          |     |       |       |     +- whitespace before code
        //            |          |     |       |       +- message text
        //            |          |     |       +- type (error|warning|note)
        //            |          |     +- column
        //            |          +- line
        //            +- filename
        while (match = deepRegex.exec(stdout)) {
            messages.push(new Message().fromGcc(match, stdout));
        }
    
        var simpleRegex = /([^:^\n]+):(\d+):(\d+):\s(\w+\s*\w*):\s(.+)\n(?!\s)/gm;
        //            ^          ^     ^       ^       ^     ^    ^
        //            |          |     |       |       |     |    +- affected code
        //            |          |     |       |       |     +- whitespace before code
        //            |          |     |       |       +- message text
        //            |          |     |       +- type (error|warning|note)
        //            |          |     +- column
        //            |          +- line
        //            +- filename
        match = null;
        while (match = simpleRegex.exec(stdout)) {
            messages.push(new Message().fromGcc(match, stdout));
        }
    
        return messages;
    }
}