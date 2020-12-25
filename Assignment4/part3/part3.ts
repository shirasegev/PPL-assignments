/*
Purpose: given a number and a generator, it returns a new generator
    which generates less than n items from the generator
Signature: take(n, g)
Type: [number * Generator -> ?]
*/
export function* take(n: number, g: Generator) {
    for (let x of g) {
        if (n <= 0){
            return;
        }
        n--;
        yield x;
    }
}

// ===========================================================

/*
Purpose: given two generators, the method returns a generator
    that combines both generators by:
    interleaving their values
Signature: braid(gen1, gen2)
Type: [Generator * Generator -> Generator]
*/
export function* braid(gen1: Generator, gen2: Generator) {
    var ir1 , ir2;

    while(1) {
        ir1 = gen1.next();
        ir2 = gen2.next();

        if (!ir1.done){
            yield ir1.value;
        }
        if (!ir2.done){
            yield ir2.value;
        }
        if(ir1.done && ir2.done) {
            break;
        }
    }
}

// ===========================================================

/*
Purpose: given two generators, the method returns a generator
    that combines both generators by:
    taking two elements from gen1 and one from the gen2.
Signature: biased(gen1, gen2)
Type: [Generator * Generator -> Generator]
*/
export function* biased(gen1: Generator, gen2: Generator) {
    var ir1, ir2;

    while (1) {
        ir1 = gen1.next();
        ir2 = gen2.next();
        if (!ir1.done){
            yield ir1.value;
            ir1 = gen1.next();
            if (!ir1.done) {
                yield ir1.value;
            }
        }
        if (!ir2.done){
            yield ir2.value;
        }
        if (ir1.done && ir2.done) {
            break;
        }
    }
}