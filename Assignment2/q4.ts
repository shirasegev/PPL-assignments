import { Exp, Program, isProgram, isBoolExp, isNumExp, isVarRef, isPrimOp, isDefineExp, isProcExp, isIfExp, isAppExp} from '../imp/L2-ast';
import {makeOk, makeFailure, Result, bind, mapResult, safe2, safe3} from '../imp/result';
import { map } from 'ramda';

/*
Purpose: given L2 program, the procedure transforms it to a JavaScript program 
    (The procedure gets an L2 AST and returns a string of the equivalent JavaScript program).
Signature: l2ToJS(l2AST)
Type: [Exp | Program] => Result<string>
*/
export const l2ToJS = (exp: Exp | Program): Result<string> => 
    isProgram(exp) ? bind(mapResult(l2ToJS, exp.exps), (exps: string[]) => 
    (exps.length > 1) ? makeOk(`${exps.slice(0,exps.length-1).join(";\n")};\nconsole.log(${exps[exps.length-1]});`) : 
    makeOk(`console.log(${exps});`)) :
    isBoolExp(exp) ? makeOk(exp.val ? "true" : "false") :
    isNumExp(exp) ? makeOk(exp.val.toString()) :
    isVarRef(exp) ? makeOk(exp.var) :
    isPrimOp(exp) ? exp.op === "not" ? makeOk("!") :
                    exp.op === "and" ? makeOk("&&") :
                    exp.op === "or" ? makeOk("||") :
                    (exp.op === "=" || exp.op === "eq?") ? makeOk("===") :
                    (exp.op === "number?" || exp.op === "boolean?") ? makeOk(`typeof `) :
                    makeOk(exp.op) :
    isDefineExp(exp) ? bind(l2ToJS(exp.val), (val: string) => makeOk(`const ${exp.var.var} = ${val}`)) :
    isProcExp(exp) ? (exp.body.length > 1) ?
                    bind(mapResult(l2ToJS, exp.body), (body: string[]) => 
                    makeOk(`((${map(v => v.var, exp.args).join(",")}) => {${body.slice(0, body.length-1).join("; ")}; return ${body[body.length-1]};})`)) :
                    bind(mapResult(l2ToJS, exp.body), (body: string[]) => makeOk(`((${map(v => v.var, exp.args).join(",")}) => ${body})`)) :
    isIfExp(exp) ? safe3((test: string, then: string, alt: string) => makeOk(`(${test} ? ${then} : ${alt})`))
                        (l2ToJS(exp.test), l2ToJS(exp.then), l2ToJS(exp.alt)) :
    isAppExp(exp) ? isPrimOp(exp.rator) ? exp.rator.op === "not" ? 
                    safe2((rator: string, rands: string[]) => makeOk(`(${rator}${rands})`))
                        (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands)) :
                    exp.rator.op === "number?" ? 
                    safe2((rator: string, rands: string[]) => makeOk(`(${rator}${rands} === 'number')`))
                        (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands)) :
                    exp.rator.op === "boolean?" ? 
                    safe2((rator: string, rands: string[]) => makeOk(`(${rator}${rands} === 'boolean')`))
                        (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands)) :
                    safe2((rator: string, rands: string[]) => makeOk(`(${map(v => v, rands).join(` ${rator} `)})`))
                        (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands)) :
                    safe2((rator: string, rands: string[]) => makeOk(`${rator}(${map(v => v, rands).join(",")})`))
                        (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands)) :
    makeFailure(`Unknown expression: ${exp}`);