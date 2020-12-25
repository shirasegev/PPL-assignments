/* Question 1 */
export const partition : <T>(f: (x:T)=> boolean,e:T[]) => T[][] =
    <T>(func: (x : T) => boolean, elements: T[]) : T[][] =>
        [elements.filter(func), elements.filter(x => func(x) === false)];

/* Question 2 */
export const mapMat : <T1,T2>(f:(x:T1) => T2,e:T1[][]) => T2[][] =
    <T1,T2>(func: (x : T1) => T2, elements: T1[][]) : T2[][] =>
        elements.map(x => x.map(func));

/* Question 3 */
export const composeMany : <T>(arrOfFunc:((x:T)=>T)[]) => (x:T)=> T = 
    <T>(arrOfFunc : ((x:T)=>T)[]) : (x:T)=> T => arg =>
        arrOfFunc.reverse().reduce((acc, curr) => curr(acc) , arg);

/* Question 4 */
interface Languages {
    english: string;
    japanese: string;
    chinese: string;
    french: string;
}

interface Stats {
    HP: number;
    Attack: number;
    Defense: number;
    "Sp. Attack": number;
    "Sp. Defense": number;
    Speed: number;
}

interface Pokemon {
    id: number;
    name: Languages;
    type: string[];
    base: Stats;
}

export const maxSpeed : (pokemons : Pokemon[]) => Pokemon[] =
    (pokemons : Pokemon[]) : Pokemon[] => pokemons.filter(x => x.base.Speed === pokemons.reduce((acc,curr) =>
        Math.max(acc,curr.base.Speed),0));

export const grassTypes : (pokemons : Pokemon[]) => string[] =
    (pokemons : Pokemon[]) : string[] =>
        pokemons.filter(x => x.type.includes("Grass")).map(x => x.name.english).sort();

export const uniqueTypes : (pokemons : Pokemon[]) => string[] =
    (pokemons : Pokemon[]) : string[] => pokemons.map(x => x.type).reduce((acc,curr) => 
        acc.concat(curr),[]).reduce((acc:string[],curr) =>
            acc.includes(curr) ? acc : acc.concat(curr),[]).sort();