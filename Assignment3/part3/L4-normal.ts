// ========================================================
// L4 normal eval
import { Sexp } from "s-expression";
import { Exp, Program, parseL4Exp, CExp, isNumExp, isStrExp, isBoolExp, isPrimOp, isLitExp, isVarRef,
        isIfExp, isLetExp, isAppExp, VarRef, IfExp, ProcExp, Binding, LetExp, VarDecl } from "./L4-ast";
import { isCExp, isDefineExp, isProcExp } from "./L4-ast";
import { makeEmptyEnv, Env, makeExtEnv, makeRecEnv, applyEnv } from './L4-env-normal';
import { Value, Closure, makeClosure, isClosure } from "./L4-value";
import { first, rest, isEmpty } from '../shared/list';
import { Result, makeFailure, bind, makeOk, mapResult } from "../shared/result";
import { parse as p } from "../shared/parser";
import { map } from "ramda";
import { applyPrimitive } from "./evalPrimitive";

// Evaluate a sequence of expressions (in a program)
export const evalExps = (exps: Exp[], env: Env): Result<Value> =>
    isEmpty(exps) ? makeFailure("Empty program") :
    isDefineExp(first(exps)) ? evalDefineExps(first(exps), rest(exps), env) :
    evalCExps(first(exps), rest(exps), env);

export const evalNormalProgram = (program: Program): Result<Value> =>
    evalExps(program.exps, makeEmptyEnv());

export const evalNormalParse = (s: string): Result<Value> =>
    bind(p(s),
         (parsed: Sexp) => bind(parseL4Exp(parsed),
                                (exp: Exp) => evalExps([exp], makeEmptyEnv())));

const evalCExps = (exp1: Exp, exps: Exp[], env: Env): Result<Value> =>
    isCExp(exp1) && isEmpty(exps) ? L4normalEval(exp1, env) :
    isCExp(exp1) ? bind(L4normalEval(exp1, env), _ => evalExps(exps, env)) :
    makeFailure("Never");
    
// Eval a sequence of expressions when the first exp is a Define.
// Compute the rhs of the define, extend the env with the new binding
// then compute the rest of the exps in the new env.
const evalDefineExps = (def: Exp, exps: Exp[], env: Env): Result<Value> =>
    isDefineExp(def) ? isProcExp(def.val) ? evalExps(exps, makeRecEnv([def.var.var], [def.val.args], [def.val.body], env)) : 
    evalExps(exps, makeExtEnv([def.var.var], [def.val], env, env)) :
    makeFailure("Unexpected " + def);

/*
Purpose: Evaluate an L4 expression with normal-eval algorithm
Signature: L4-normal-eval(exp,env)
Type: [CExp * Env => Value]
*/
export const L4normalEval = (exp: CExp, env: Env): Result<Value> =>
    isBoolExp(exp) ? makeOk(exp.val) :
    isNumExp(exp) ? makeOk(exp.val) :
    isStrExp(exp) ? makeOk(exp.val) :
    isPrimOp(exp) ? makeOk(exp) :
    isLitExp(exp) ? makeOk(exp.val) :
    isVarRef(exp) ? evalVarRef(env, exp) :
    isIfExp(exp) ? evalIf(exp, env) :
    isProcExp(exp) ? evalProc(exp, env) :
    isLetExp(exp) ? evalLet(exp, env) :
    // This is the difference between applicative-eval and normal-eval
    // Substitute the arguments into the body without evaluating them first.
    isAppExp(exp) ? bind(L4normalEval(exp.rator, env), proc => L4normalApplyProc(proc, exp.rands, env)) :
    makeFailure(`Bad ast: ${exp}`);

/*
===========================================================
Normal Order Application handling
*/

export const evalVarRef = (env: Env, exp: VarRef): Result<Value> =>
    // isEmptyEnv(env) ? makeFailure(`var not found ${exp.var}`) :
    bind(applyEnv(env, exp.var), ([cexp, expEnv]) => L4normalEval(cexp, expEnv));

export const isTrueValue = (x: Value): boolean =>
    ! (x === false); 

const evalIf = (exp: IfExp, env: Env): Result<Value> =>
    bind(L4normalEval(exp.test, env),
         test => isTrueValue(test) ? L4normalEval(exp.then, env) : L4normalEval(exp.alt, env));

const evalProc = (exp: ProcExp, env: Env): Result<Closure> =>
    makeOk(makeClosure(exp.args, exp.body, env));

// LET: Direct evaluation rule without syntax expansion
// compute the values, extend the env, eval the body.
const evalLet = (exp: LetExp, env: Env): Result<Value> => {
    const vars = map((b: Binding) => b.var.var, exp.bindings);
    return evalExps(exp.body, makeExtEnv(vars, map((b: Binding) => b.val, exp.bindings), env, env));
}

/*
Purpose: Apply a procedure to NON evaluated arguments.
Signature: L4-normalApplyProcedure(proc, args)
Pre-conditions: proc must be a prim-op or a closure value
*/
const L4normalApplyProc = (proc: Value, args: CExp[], env: Env): Result<Value> => {
if (isPrimOp(proc)) {
    const argVals: Result<Value[]> = mapResult((arg) => L4normalEval(arg, env), args);
    return bind(argVals, (args: Value[]) => applyPrimitive(proc, args));
} else if (isClosure(proc)) {
    const vars = map((p) => p.var, proc.params);
    return applyClosure(proc, args, env);
} else {
    return makeFailure(`Bad procedure ${JSON.stringify(proc)}`); 
}};

const applyClosure = (proc: Closure, args: CExp[], env: Env): Result<Value> => {
    const vars = map((v: VarDecl) => v.var, proc.params);
    return L4normalEvalSeq(proc.body, makeExtEnv(vars, args, env, proc.env));
}

/*
Purpose: Evaluate a sequence of expressions (in a program)
Signature: L4-normal-eval-sequence(seq, env)
Type: [List(CExp) * Env -> Value]
Pre-conditions: seq is not empty
*/
const L4normalEvalSeq = (seq: CExp[], env: Env): Result<Value> =>
    isEmpty(seq) ? makeFailure("Empty sequence") :
    isDefineExp(first(seq)) ? evalDefineExps(first(seq), rest(seq), env) :
    evalCExps(first(seq), rest(seq), env);

/*
Purpose: evaluate a program made up of a sequence of expressions.
When def-exp expressions are executed, thread an updated env to the continuation.
For other expressions (that have no side-effect), execute the expressions sequentially.
Signature: L4normalEvalProgram(program)
Type: [Program -> Value]
*/
export const L4normalEvalProgram = (program: Program): Result<Value> =>
    evalExps(program.exps, makeEmptyEnv());