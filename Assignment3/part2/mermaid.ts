import { map, contains, startsWith, isEmpty } from "ramda";
import { Result, makeOk, makeFailure, bind } from "../shared/result";
import { parse as p } from "../shared/parser";
import { Parsed, isProgram, Program, isLetrecExp, isSetExp, isBoolExp , isDefineExp, DefineExp, isAppExp, 
        isIfExp, isProcExp, isLetExp, isLitExp, isNumExp, isStrExp, isPrimOp, isVarRef, AtomicExp, VarDecl,
        parseL4, Exp, IfExp, AppExp, ProcExp, LetExp, isBinding, Binding, LetrecExp, isAtomicExp, LitExp, makeStrExp, SetExp, parseL4Exp } from "./L4-ast";
import { makeGraph, makeHeader, makeCompoundGraph, makeEdge, makeNodeDecl, makeNodeRef, 
        Node, Graph, CompoundGraph, NodeDecl, isAtomicGraph, GraphContent, Edge, isCompoundGraph, isNodeDecl, isNodeRef } from "./mermaid-ast";
import { isString } from "../shared/type-predicates";
import { isUndefined, isNumber, isBoolean } from "util";
import { CompoundSExp, SExpValue, isSymbolSExp, isEmptySExp, isCompoundSExp, SymbolSExp } from "./L4-value";

//************** Var Generators **************

export const makeVarGen = (): (v: string) => string => {
    let count: number = 0;
    return (v: string) => {
        count++;
        return `${v}_${count}`;
    };
};

let ProgramGen = makeVarGen()
let DefineGen = makeVarGen()
let NumberGen = makeVarGen()
let BooleanGen = makeVarGen()
let StringGen = makeVarGen()
let NumExpGen = makeVarGen()
let BoolExpGen = makeVarGen()
let StrExpGen = makeVarGen()
let PrimOpGen = makeVarGen()
let VarRefGen = makeVarGen()
let VarDeclGen = makeVarGen()
let AppGen = makeVarGen()
let IfGen = makeVarGen()
let ProcGen = makeVarGen()
let LetGen = makeVarGen()
let LitGen = makeVarGen()
let LetrecGen = makeVarGen()
let SetGen = makeVarGen()
let RandsGen = makeVarGen()
let ParamsGen = makeVarGen()
let BodyGen = makeVarGen()
let ExpsGen = makeVarGen()
let BindingGen = makeVarGen()
let SymbolSExpGen = makeVarGen()
let CompoundSExpGen = makeVarGen()
let EmptySExpGen = makeVarGen()

// Assume Parsed legal
// ************************* Q2.2 **************************

/*
Signature: mapL4toMermaid(exp)
Type: [Parsed -> Result<Graph>]
*/
export const mapL4toMermaid = (exp: Parsed): Result<Graph> =>
    makeOk(makeGraph(makeHeader('graph TD\n'),L4graphToMermaid(exp)));

const L4graphToMermaid = (exp: Parsed): GraphContent =>
    isAtomicExp(exp) ? CreateAtomicNode(exp) :
    L4compoundToMermaid(exp, true)

// Convert Program to Graph -- main func
const L4compoundToMermaid = (exp: Parsed | Binding | SExpValue, firstInGraph: boolean, parentNode?: Node, yourName?: string) : CompoundGraph =>
    isProgram(exp) ? ProgramToMermaidTree(exp, firstInGraph) :
    isDefineExp(exp) ? DefineToMermaidTree(exp, firstInGraph, parentNode, yourName) :
    isAppExp(exp) ? AppToMermaidTree(exp, firstInGraph, parentNode, yourName) :
    isIfExp(exp) ? IfToMermaidTree(exp, firstInGraph, parentNode, yourName) :
    isProcExp(exp) ? ProcToMermaidTree(exp, firstInGraph, parentNode, yourName) :
    isLetExp(exp) ? LetToMermaidTree(exp, firstInGraph, parentNode, yourName) :
    isBinding(exp) ? BindingToMermaidTree(exp, firstInGraph, parentNode, yourName) :
    isLetrecExp(exp) ? LetToMermaidTree(exp, firstInGraph, parentNode,yourName) :
    isLitExp(exp) ? LitToMermaidTree(exp, firstInGraph, parentNode, yourName) :
    isSymbolSExp(exp) ? SymbolSExpToMermaid(exp, parentNode, yourName) : // SymbolSExp cannot be first in graph
    isCompoundSExp(exp) ? CompoundSExpToMermaid(exp, firstInGraph, parentNode,yourName) :
    isSetExp(exp) ? SetToMermaidTree(exp, firstInGraph, parentNode, yourName) :
    isAtomicExp(exp) || isEmptySExp(exp) ? makeCompoundGraph([]) : // If Atomic OR EmptySExp No need to add edges
    makeCompoundGraph([makeEdge(makeNodeRef(''),makeNodeRef(''))]) //never

//********** Identifing and creating varDecls ************
// For AtomicGraph and more
const CreateAtomicNode = (exp: AtomicExp) : NodeDecl =>
    isNumExp(exp) ? makeNodeDecl(NumExpGen('NumExp'), `NumExp(${exp.val})`) :
    isBoolExp(exp) ? makeNodeDecl(BoolExpGen('BoolExp'), 
            exp.val ? `BoolExp(#t)` : `BoolExp(#f)` ) :
    isStrExp(exp) ? makeNodeDecl(StrExpGen('StrExp'), `StrExp(${exp.val})`) :
    isPrimOp(exp) ? makeNodeDecl(PrimOpGen('PrimOp'), `PrimOp(${exp.op})`) :
    isVarRef(exp) ? makeNodeDecl(VarRefGen('VarRef'), `VarRef(${exp.var})`) :
    makeNodeDecl('','') // Never

const CreateVarDeclNode = (exp: VarDecl): NodeDecl =>
    makeNodeDecl(VarDeclGen("VarDecl"), `VarDecl(${exp.var})`);

const CreateTwoDotsNode = (label: string): NodeDecl =>
    makeNodeDecl(label,':')

const CreateExpNode = (exp: Exp | Binding): NodeDecl =>
    isAtomicExp(exp) ? CreateAtomicNode(exp) :
    isDefineExp(exp) ? makeNodeDecl(DefineGen('DefineExp'), 'DefineExp') :
    isAppExp(exp) ? makeNodeDecl(AppGen('AppExp'), 'AppExp') :
    isIfExp(exp) ? makeNodeDecl(IfGen('IfExp'), 'IfExp') :
    isProcExp(exp) ? makeNodeDecl(ProcGen('ProcExp'), 'ProcExp') :
    isLetExp(exp) ? makeNodeDecl(LetGen('LetExp'), 'LetExp') :
    isLitExp(exp) ? makeNodeDecl(LitGen('LitExp'), 'LitExp') :
    isLetrecExp(exp) ? makeNodeDecl(LetrecGen('LetrecExp'), 'LetrecExp') :
    isSetExp(exp) ? makeNodeDecl(SetGen('SetExp'), 'SetExp') :
    isBinding(exp) ? makeNodeDecl(BindingGen('Binding'), 'Binding') :
    makeNodeDecl('','') // Never

const CreateSExpValueNode = (exp: SExpValue): NodeDecl =>
    isNumber(exp) ? makeNodeDecl(NumberGen('number'), `number(${exp})`) :
    isBoolean(exp) ? makeNodeDecl(BooleanGen('boolean'), 
    exp ? `boolean(#t)` : `boolean(#f)` ) :
    isString(exp) ? makeNodeDecl(StringGen('string'), `string(${exp})`) :
    isSymbolSExp(exp) ? makeNodeDecl(SymbolSExpGen('SymbolSExp'), 'SymbolSExp') :
    isEmptySExp(exp) ? makeNodeDecl(EmptySExpGen('EmptySExp'), 'EmptySExp') :
    isCompoundSExp(exp) ? makeNodeDecl(CompoundSExpGen('CompoundSExp'), 'CompoundSExp') :
    makeNodeDecl('','') // Never

//************** Converting functions ********************
// Program
const ProgramToMermaidTree = (exp: Program, firstInGraph: boolean): CompoundGraph =>
    makeCompoundGraph(
        ProgramToChildren(
            firstInGraph ? makeNodeDecl(ProgramGen('Program'), 'Program') : makeNodeRef(ProgramGen('Program')),
            CreateTwoDotsNode(ExpsGen("Exps")), exp.exps
        )
    )

const ProgramToChildren = (parent: Node, first: Node, firstExp: Exp[]): Edge[] =>
    [makeEdge(parent,first, 'exps')]
    .concat(firstExp.reduce((acc:Edge[],curr)=>
        isAtomicExp(curr) ? acc.concat(makeEdge(makeNodeRef(first.id), CreateAtomicNode(curr))) :
        acc.concat(L4compoundToMermaid(curr, false, first).edges),[]))

// Define
const DefineToMermaidTree = (exp: DefineExp, firstInGraph: boolean, parent?: Node, yourName?: string): CompoundGraph =>
    makeCompoundGraph(
        DefineToChildren(
            firstInGraph ? 
                makeNodeDecl(isString(yourName) ? yourName : DefineGen('DefineExp'), 'DefineExp') :
                makeNodeRef(isString(yourName) ? yourName : DefineGen('DefineExp')),
            CreateVarDeclNode(exp.var),
            CreateExpNode(exp.val), exp.val, parent)
    )

const DefineToChildren = (parent: Node, first: Node, second: Node, secondExp: Exp, grandpa?: Node): Edge[] =>
    [makeEdge(parent,first, 'var'), makeEdge(makeNodeRef(parent.id) ,second, 'val')]
    .concat(L4compoundToMermaid(secondExp, false, undefined, second.id).edges)
    .concat(isUndefined(grandpa) ? [] : makeEdge(makeNodeRef(grandpa.id), makeNodeDecl(parent.id,'DefineExp')))

// If
const IfToMermaidTree = (exp: IfExp, firstInGraph: boolean, parent?: Node, yourName?: string): CompoundGraph => 
    makeCompoundGraph(
        IfToChildren(
            firstInGraph ?
                makeNodeDecl(isString(yourName) ? yourName : IfGen('IfExp'), 'IfExp') :
                makeNodeRef(isString(yourName) ? yourName : IfGen('IfExp')),
            CreateExpNode(exp.test), exp.test,
            CreateExpNode(exp.then), exp.then,
            CreateExpNode(exp.alt), exp.alt, parent
        )
    )

const IfToChildren = (parent: Node, first: Node, firstExp: Exp, 
    second: Node, secondExp: Exp, third: Node, thirdExp: Exp, grandpa?: Node): Edge[] =>
    [makeEdge(parent, first, 'test'),
    makeEdge(makeNodeRef(parent.id), second, 'then'),
    makeEdge(makeNodeRef(parent.id), third, 'alt')]
    .concat(L4compoundToMermaid(firstExp, false, undefined, first.id).edges)
    .concat(L4compoundToMermaid(secondExp,false, undefined, second.id).edges)
    .concat(L4compoundToMermaid(thirdExp, false, undefined, third.id).edges)
    .concat(isUndefined(grandpa) ? [] : makeEdge(makeNodeRef(grandpa.id),makeNodeDecl(parent.id,'IfExp')))

// App
const AppToMermaidTree = (exp: AppExp, firstInGraph: boolean, parent?: Node, yourName?: string): CompoundGraph =>
    makeCompoundGraph(
        AppToChildren(
                firstInGraph ?
                    makeNodeDecl(isString(yourName) ? yourName :AppGen('AppExp'), 'AppExp') :
                    makeNodeRef(isString(yourName) ? yourName :AppGen('AppExp')),
                CreateExpNode(exp.rator), exp.rator,
                CreateTwoDotsNode(RandsGen("Rands")), exp.rands, parent
        )
    )

const AppToChildren = (parent: Node, first: Node, firstExp: Exp, 
                        second: Node, secondExp: Exp[], grandpa?: Node): Edge[] =>
    [makeEdge(parent,first, 'rator'), makeEdge(makeNodeRef(parent.id), second, 'rands')]
    .concat(L4compoundToMermaid(firstExp, false, undefined, first.id).edges)
    .concat(isUndefined(grandpa) ? [] : makeEdge(makeNodeRef(grandpa.id),makeNodeDecl(parent.id,'AppExp')))
    .concat(secondExp.reduce((acc:Edge[],curr)=>
        isAtomicExp(curr) ? acc.concat(makeEdge(makeNodeRef(second.id), CreateAtomicNode(curr))) :
        acc.concat(L4compoundToMermaid(curr, false, second).edges),[]))

// Proc
const ProcToMermaidTree = (exp: ProcExp, firstInGraph: boolean, parent?: Node , yourName?: string): CompoundGraph =>
    makeCompoundGraph(
        ProcToChildren(
                firstInGraph ?
                    makeNodeDecl(isString(yourName) ? yourName : ProcGen('ProcExp'), 'ProcExp') :
                    makeNodeRef(isString(yourName) ? yourName : ProcGen('ProcExp')),
                CreateTwoDotsNode(ParamsGen("Params")), exp.args,
                CreateTwoDotsNode(BodyGen("Body")), exp.body, parent)
    )
    
const ProcToChildren = (parent: Node, first: Node, firstExp: VarDecl[], 
                    second: Node, secondExp: Exp[], grandpa?: Node): Edge[] =>
    [makeEdge(parent,first, 'args'), makeEdge(makeNodeRef(parent.id), second, 'body')]
    .concat(map(x=> makeEdge(makeNodeRef(first.id),CreateVarDeclNode(x)),firstExp))
    .concat(isUndefined(grandpa) ? [] : makeEdge(makeNodeRef(grandpa.id),makeNodeDecl(parent.id,'ProcExp')))
    .concat(secondExp.reduce((acc:Edge[],curr)=>
        isAtomicExp(curr) ? acc.concat(makeEdge(makeNodeRef(second.id), CreateAtomicNode(curr))) :
        acc.concat(L4compoundToMermaid(curr, false, second).edges),[]))

// Let & Letrec
const LetToMermaidTree = (exp: LetExp | LetrecExp, firstInGraph: boolean, parent?: Node, yourName?: string): CompoundGraph =>
    makeCompoundGraph(
        LetToChildren(
            firstInGraph ?
                makeNodeDecl( isLetExp(exp) ?
                    isString(yourName) ? yourName : LetGen('LetExp') :
                    isString(yourName) ? yourName : LetrecGen('LetrecExp'),
                        isLetExp(exp) ? 'LetExp' : 'LetrecExp') :
                makeNodeRef( isLetExp(exp) ?
                    isString(yourName) ? yourName : LetGen('LetExp') :
                    isString(yourName) ? yourName : LetrecGen('LetrecExp')),
            CreateTwoDotsNode(BindingGen('Binding')), exp.bindings,
            CreateTwoDotsNode(BodyGen('Body')), exp.body, parent)
    )

const LetToChildren = (parent: Node, first: Node, firstExp: Binding[], 
                    second: Node, secondExp: Exp[], grandpa?: Node): Edge[] =>
        [makeEdge(parent,first, 'bindings'), makeEdge(makeNodeRef(parent.id), second, 'body')]
        .concat(firstExp.reduce((acc:Edge[],curr)=>
            acc.concat(L4compoundToMermaid(curr, false, first).edges),[]))
        .concat(isUndefined(grandpa) ? [] : makeEdge(makeNodeRef(grandpa.id),
        makeNodeDecl(parent.id,contains('LetrecExp', parent.id) ? 'LetrecExp' : 'LetExp')))
        .concat(secondExp.reduce((acc:Edge[],curr)=>
            isAtomicExp(curr) ? acc.concat(makeEdge(makeNodeRef(second.id), CreateAtomicNode(curr))) :
            acc.concat(L4compoundToMermaid(curr, false, second).edges),[]))

// Binding
const BindingToMermaidTree = (exp: Binding, firstInGraph: boolean, parent?: Node , yourName?: string): CompoundGraph => 
    makeCompoundGraph(
        BindingToChildren(
                firstInGraph ?
                    makeNodeDecl(isString(yourName) ? yourName : BindingGen('Binding'), 'Binding') :
                    makeNodeRef(isString(yourName) ? yourName : BindingGen('Binding')),
                CreateVarDeclNode(exp.var),
                CreateExpNode(exp.val), exp.val, parent)
    )

const BindingToChildren = (parent: Node, first: Node, second: Node, secondExp: Exp, grandpa?: Node): Edge[] =>
    [makeEdge(parent,first, 'var'), makeEdge(makeNodeRef(parent.id), second, 'val')]
    .concat(L4compoundToMermaid(secondExp, false, undefined , second.id).edges)
    .concat(isUndefined(grandpa) ? [] : makeEdge(makeNodeRef(grandpa.id),makeNodeDecl(parent.id,'binding')))

// Lit
const LitToMermaidTree = (exp: LitExp, firstInGraph: boolean, parent?: Node, yourName?: string): CompoundGraph =>
    makeCompoundGraph(
        LitToChildren(
            firstInGraph ?
                makeNodeDecl(isString(yourName) ? yourName : LitGen('LitExp'), 'LitExp') :
                makeNodeRef(isString(yourName) ? yourName : LitGen('LitExp')),
            CreateSExpValueNode(exp.val), exp.val, parent
        )
    )

const LitToChildren = (parent: Node, first: Node, firstExp: SExpValue, grandpa?: Node): Edge[] =>
    [makeEdge(parent,first,'val')]
    .concat(isUndefined(grandpa) ? [] : makeEdge(makeNodeRef(grandpa.id),makeNodeDecl(parent.id,'LitExp')))
    .concat(L4compoundToMermaid(firstExp, false, undefined , first.id).edges)

// Symbol SExp
const SymbolSExpToMermaid = (exp: SymbolSExp, parent?: Node, yourName?: string): CompoundGraph =>
    makeCompoundGraph(
        isString(yourName) ? 
            [makeEdge(
                makeNodeRef(yourName), CreateAtomicNode(makeStrExp(exp.val)))] : 
            [] 
    )

// Compound SExp
const CompoundSExpToMermaid = (exp: CompoundSExp, firstInGraph: boolean, parent?: Node, yourName?: string): CompoundGraph =>
    makeCompoundGraph(
        CompoundSExpToChildren(
            firstInGraph ?
                makeNodeDecl(isString(yourName) ? yourName : CompoundSExpGen('CompoundSExp'), 'CompoundSExp') :
                makeNodeRef(isString(yourName) ? yourName : CompoundSExpGen('CompoundSExp')),
            CreateSExpValueNode(exp.val1), exp.val1,
            CreateSExpValueNode(exp.val2), exp.val2, parent
        )
    )

const CompoundSExpToChildren = (parent: Node, first: Node, firstExp: SExpValue, 
                                second: Node, secondExp: SExpValue, grandpa?: Node): Edge[] =>
    [makeEdge(parent,first, 'val1'), makeEdge(makeNodeRef(parent.id), second, 'val2')]
    .concat(isUndefined(grandpa) ? [] : makeEdge(makeNodeRef(grandpa.id),makeNodeDecl(parent.id,'CompoundSExp')))
    .concat(isNumber(firstExp) || isBoolExp(firstExp) || isString(firstExp) ? [] : //not Caught in AtomicExp
        L4compoundToMermaid(firstExp, false, undefined , first.id).edges)
    .concat(isNumber(secondExp) || isBoolExp(secondExp) || isString(secondExp) ? [] : //not Caught in AtomicExp
        L4compoundToMermaid(secondExp, false, undefined , second.id).edges)
    
// Set
const SetToMermaidTree = (exp: SetExp, firstInGraph: boolean, parent?: Node, yourName?: string): CompoundGraph =>
    makeCompoundGraph(
        SetToChildren(
            firstInGraph ?
                makeNodeDecl(isString(yourName) ? yourName : SetGen('SetExp'), 'SetExp') :
                makeNodeRef(isString(yourName) ? yourName : SetGen('SetExp')),
            CreateAtomicNode(exp.var),
            CreateExpNode(exp.val), exp.val, parent
        )
    )

const SetToChildren = (parent: Node, first: Node, second: Node, secondExp: Exp, grandpa?: Node): Edge[] =>
    [makeEdge(parent,first, 'var'), makeEdge(makeNodeRef(parent.id), second, 'val')]
    .concat(isUndefined(grandpa) ? [] : makeEdge(makeNodeRef(grandpa.id),makeNodeDecl(parent.id,'SetExp')))
    .concat(L4compoundToMermaid(secondExp, false, undefined, second.id).edges)

// ********************* Q2.3 **********************
export const unparseMermaid = (exp: Graph): Result<string> =>
    isAtomicGraph(exp.content) ? makeOk(
        `${exp.dir.var}${exp.content.id}["${exp.content.label}"]`) :
    isCompoundGraph(exp.content) ? makeOk(
        `${exp.dir.var}${unparseCompoundGraph(exp.content.edges)}`):
    makeFailure("Invalid Graph content");

const unparseCompoundGraph = (edges: Edge[]): string =>   
    map(unparseEdge, edges).join("\n");

const unparseEdge = (edge: Edge): string =>
isString(edge.label) ? `${unparseNode(edge.from)} -->|${edge.label}| ${unparseNode(edge.to)}` :
                        `${unparseNode(edge.from)} --> ${unparseNode(edge.to)}`

const unparseNode = (node: Node): string =>
    isNodeDecl(node) ? `${node.id}["${node.label}"]` :
    isNodeRef(node) ? `${node.id}`: `never`;

export const L4toMermaid = (concrete: string): Result<string> =>
    startsWith(`(L4`, concrete) ? 
    bind(bind(parseL4(concrete), x => mapL4toMermaid(x)), y => unparseMermaid(y)) :
    bind(bind(bind(p(concrete), x => parseL4Exp(x)), y => mapL4toMermaid(y)), z => unparseMermaid(z))