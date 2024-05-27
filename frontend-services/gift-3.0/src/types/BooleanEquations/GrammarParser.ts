import {Grammars,IToken} from 'ebnf';
import { OperatorEnum, Operators } from '../Operators';


/**
 * Aufbauen der Grammatik die an die aktuell verwendeten Operatosymbole angepasst ist
 * Setze dazu die aktuell verwendeten Operatoren in die standardmaessig verwendete Grammatik ein
 * Aenderungen an der Grammatik erfoerdern Aenderungen an der Auswertung des geparsten Baumes in {@link transformAST} bzw. {@link binaryStringToGeneralTree}
 * und ggf. in den unten angegebenen Funktionen : {@link changeGrammarOperator}
 */
function makeGrammar(operators:Operators):string{
    return  `{ ws=explicit }
or ::= WS* and (OR_OP and)* WS*
and ::= WS* term (AND_OP term)* WS* 
neg ::= NOT_OP term 
term ::= WS* (const | var | neg | bracket) WS*
bracket::= LGROUP or RGROUP 
 
var ::= ((".")?[a-zA-Z]((".")?[a-zA-Z0-9]+|((".")?"_"[a-zA-Z0-9]+)*|((".")?"_{"[a-zA-Z0-9]+"}")*)*(".")?)
const ::= '${operators.defaultLogicOne}' | '${operators.defaultLogicZero}'
OR_OP::= "${operators.customOrOperator.validName}"
AND_OP::= "${operators.customAndOperator.validName}"
NOT_OP::= "${operators.customNotOperator.validName}"
 
LGROUP ::= '('
RGROUP ::= ')' 
 
WS::= [#x20#x09#x0A#x0D]
/* eof */`;
    
}


//Innerhalb der Variablen werden via "{ws=explicit}" keine Leerzeichen erlaubt , an allen anderen Stellen koennen sie beliebig auftreten 
// ggf. "{fragment=true}" hinter dem Block "term" ergaenzen um ihn nicht im geparsten Baum anzuzeigen



// variablen Ausdruck ohne Punkt: [a-zA-Z]([a-zA-Z0-9]+|("_"[a-zA-Z0-9]+)*|("_{"[a-zA-Z0-9]+"}")*)*
/**
 * Kapselung des EBNF Parsers in einer Klasse
 */
export class GrammarParser{
 private grammar:string
 private parser:Grammars.Custom.Parser

 /**
  * Erstellt einen neuen Grammatikparser der die gegebenen Operatorsymbole und Variablen erkennt
  * @param operators Operatorsymbole
  * @param variableList Liste aller erlaubten Variablen
  */
    constructor(operators:Operators){
        //Passe die Grammatik an die nutzerdefinierten Operatoren an
        this.grammar = makeGrammar(operators);

        this.parser = new Grammars.Custom.Parser(this.grammar);
    }

    /**
     * Erstellt einen AST auf Basis des uebergebenen logischen Ausdrucks
     * @param logicEquation logischer Ausdruck der umgewandelt werden soll
     * @returns 
     */
     public parseStringToAst(logicEquation:string):IToken{
        return this.parser.getAST(logicEquation)
    }
    

}