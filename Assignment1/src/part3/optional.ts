/* Question 1 */
interface Some<T> {
    tag : "Some";
    value : T;
}

interface None {
    tag : "None";
}

export type Optional<T> = Some<T> | None;

export const makeSome = <T>(value : T) : Some<T> =>
    ({tag : "Some", value : value});
export const makeNone = () : None =>
    ({tag : "None"});

export const isSome = <T>(x: Optional<T>): x is Some<T> =>
    x.tag === "Some";
export const isNone = <T>(x: Optional<T>): x is None =>
    x.tag === "None";

/* Question 2 */
export const bind = <T1, T2>(optional : Optional<T1>, f : (x : T1) => Optional<T2>) : Optional<T2> => 
    isNone(optional) ? makeNone() : f(optional.value);