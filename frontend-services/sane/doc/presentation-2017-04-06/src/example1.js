var Language;
(function (Language) {
    Language[Language["EN"] = 0] = "EN";
    Language[Language["DE"] = 1] = "DE";
    Language[Language["FR"] = 2] = "FR";
    Language[Language["PL"] = 3] = "PL";
})(Language || (Language = {}));
var Greeter = (function () {
    function Greeter(greeting) {
        if (greeting === void 0) { greeting = { msg: "Guten Tag!", lang: Language.DE }; }
        this.greeting = greeting;
    }
    Greeter.prototype.greet = function () {
        return "<h1>" + this.greeting + "</h1>";
    };
    return Greeter;
}());
;
var greeter = new Greeter({ msg: "Hello, world!", lang: Language.EN }); // const!
document.body.innerHTML = greeter.greet();
