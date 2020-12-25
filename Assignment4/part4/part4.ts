// ===========================================================
export function f(x: number): Promise<number> {
    return new Promise<number>((resolve, reject) =>{
        if (x != 0){
            resolve(1 / x);
        }
        else{
            reject(new Error("can't divide by zero"));
        }
    });
}

export function g(x: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        if (x != null) {
            resolve(x * x);
        }
        else {
            reject(new Error("can't multiply nulls"));
        }
    });
}

/*
Purpose: composition of 2 functions f(g(x)).
Signature: h(x)
Type: [number -> Promise<number>]
*/
export function h(x: number): Promise<number> {
    return new Promise<number> (async (resolve, reject) => {
        g(x).then((gRes: number) => {
            f(gRes).then((fRes: number) => {
                resolve(fRes);    
            }).catch((e: any) => reject(e));
        }).catch((e: any) => reject(e));
    });
}

// ===========================================================
/*
Purpose: given two promises (p1 and p2),slower succeeds only if both promises succeed.
The return value is (x, value) (x = 0 for p1 or 1 for p2),
value is the return value of the promise that was resolved last.
Signature: slower(promises)
Type: [Promise<T>[] -> Promise<[number, any]>]
*/
export function slower<T>(promises: Promise<T>[]): Promise<[number, any]> {
    return new Promise<[number, any]>((resolve, reject) => {
        let runners: [number, any][] = [];
        const p1 = promises[0].then((x: any) => {
            runners.push([0, x]);
        }).catch((e: any) => reject(e))
        const p2 = promises[1].then((x: any) => {
            runners.push([1, x]);
        }).catch((e: any) => reject(e))
        p1.then(_ => p2.then(() => resolve(runners[1])))
    });
}