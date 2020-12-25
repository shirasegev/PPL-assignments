// ===========================================================
// AST type models
/*
;; =============================================================================
;; <graph> ::= <header> <graphContent> // Graph(dir: Dir, content: GraphContent)
;; <header> ::= graph (TD|LR)<newline> // Direction can be TD or LR
;; <graphContent> ::= <atomicGraph> | <compoundGraph>
;; <atomicGraph> ::= <nodeDecl>
;; <compoundGraph> ::= <edge>+
;; 
;; <edge> ::= <node> --><edgeLabel>? <node><newline> // <edgeLabel> is optional
;;                                 // Edge(from: Node, to: Node, label?: string)
;; 
;; <node> ::= <nodeDecl> | <nodeRef>
;; <nodeDecl> ::= <identifier>["<string>"] // NodeDecl(id: string, label: string)
;; <nodeRef> ::= <identifier> // NodeRef(id: string)
;; <edgeLabel> ::= |<identifier>| // string
*/

// A value returned by parse
export type GraphContent = AtomicGraph | CompoundGraph;
export type Node = NodeDecl | NodeRef;
export type AtomicGraph = NodeDecl;

export interface Graph {tag: "Graph"; dir: Header; content: GraphContent; }
export interface Header {tag: "Header"; var: string; }
export interface CompoundGraph {tag: "CompoundGraph"; edges: Edge[]; }

export interface Edge {tag: "Edge"; from: Node; to: Node; label?: string; }
export interface NodeDecl {tag: "NodeDecl"; id: string; label: string; }
export interface NodeRef {tag: "NodeRef"; id: string; }
export interface EdgeLabel {tag: "EdgeLabel"; val: string; }

// Type value constructors for disjoint types
export const makeGraph = (dir: Header, content: GraphContent): Graph => ({tag: "Graph", dir: dir, content: content});
export const makeHeader = (v: string): Header => ({tag: "Header", var: v});
export const makeCompoundGraph = (edges: Edge[]): CompoundGraph => ({tag: "CompoundGraph", edges: edges});
export const makeEdge = (from: Node, to: Node, label?: string): Edge => ({tag: "Edge", from: from, to: to, label: label}); // label?
export const makeNodeDecl = (id: string, label: string): NodeDecl => ({tag: "NodeDecl", id: id, label: label});
export const makeNodeRef = (id: string): NodeRef => ({tag: "NodeRef", id: id});
export const makeEdgeLabel = (val: string): EdgeLabel => ({tag: "EdgeLabel", val: val});

// Type predicates for disjoint types
export const isGraph = (x: any): x is Graph => x.tag === "Graph";
export const isHeader = (x: any): x is Header => x.tag === "Header";

export const isCompoundGraph = (x: any): x is CompoundGraph => x.tag === "CompoundGraph";
export const isEdge = (x: any): x is Edge => x.tag === "Edge";
export const isNodeDecl = (x: any): x is NodeDecl => x.tag === "NodeDecl";
export const isNodeRef = (x: any): x is NodeRef => x.tag === "NodeRef";
export const isEdgeLabel = (x: any): x is EdgeLabel => x.tag === "EdgeLabel";


// Type predicates for type unions
export const isGraphContent = (x: any): x is GraphContent => isAtomicGraph(x) || isCompoundGraph(x);
export const isNode = (x: any): x is Node => isNodeDecl(x) || isNodeRef(x);
export const isAtomicGraph = (x: any): x is AtomicGraph => isNodeDecl(x);