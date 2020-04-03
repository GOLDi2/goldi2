enum Language {
  EN,
  DE,
  FR,
  PL
}

interface Greeting {  // nur während Transpilation verwendet
  msg: string;
  lang: Language;
}

class Greeter {
  constructor(private greeting: Greeting = {msg: "Guten Tag!", lang: Language.DE}) { }
  greet() {
    return "<h1>" + this.greeting + "</h1>";
  }
};

const greeter = new Greeter({msg: "Hello, world!", lang: Language.EN});  // const!
document.body.innerHTML = greeter.greet();
