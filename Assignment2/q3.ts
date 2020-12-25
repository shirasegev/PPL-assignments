import { ForExp, AppExp, Exp, isExp, Program, isProgram, makeProgram, CExp, isCExp, isDefineExp, makeDefineExp,
        isAtomicExp, isVarDecl, isIfExp, makeIfExp, isAppExp, makeAppExp, isProcExp, makeProcExp, isForExp, makeNumExp } from "./L21-ast";
import { makeOk, makeFailure, Result } from "../imp/result";
import { map } from 'ramda';

/*
Purpose: Given a ForExp, it applies a syntactic transformation to an equivalent AppExp
Signature: for2app(ForExp)
Type: [ForExp] => [AppExp]
*/
export const for2app = (exp: ForExp): AppExp => 
    makeAppExp(makeProcExp([],
        ([...Array(exp.end.val+1).keys()].slice(exp.start.val).map( //array of [start,..,end]
            (i) => makeAppExp(makeProcExp([exp.var],[exp.body]),[makeNumExp(i)]),
            ))
        ), []
    )

/*
Purpose: Given an L21 AST, returns an equivalent L2 AST.
Signature: L21ToL2(l21AST)
Type: [Exp | Program] => [Result<Exp | Program>]
*/
export const L21ToL2 = (exp: Exp | Program): Result<Exp | Program> =>
    isProgram(exp) ? makeOk(makeProgram(map(L21ToL2Exp, exp.exps))) :
    isExp(exp) ? makeOk(L21ToL2Exp(exp)) :
    makeFailure("Not an expression in L21") //never

const L21ToL2Exp = (exp: Exp): Exp =>
    isCExp(exp) ? L21ToL2CExp(exp) :
    isDefineExp(exp) ? makeDefineExp(exp.var, L21ToL2CExp(exp.val)) :
    exp; //never

const L21ToL2CExp = (exp: CExp): CExp =>
    isAtomicExp(exp) ? exp :
    isVarDecl(exp) ? exp :
    isIfExp(exp) ? makeIfExp(L21ToL2CExp(exp.test), L21ToL2CExp(exp.then), L21ToL2CExp(exp.alt)) :
    isAppExp(exp) ? makeAppExp(L21ToL2CExp(exp.rator), map(L21ToL2CExp, exp.rands)) :
    isProcExp(exp) ? makeProcExp(exp.args, map(L21ToL2CExp, exp.body)) :
    isForExp(exp) ? L21ToL2CExp(for2app(exp)) :
    exp; 