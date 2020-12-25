/* Question 3 */
import { reduce } from "ramda";

interface Ok<T> {
    tag : "Ok";
    value : T;
}

interface Failure {
    tag : "Failure";
    message : string;
}

export type Result<T> = Ok<T> | Failure;

export const makeOk = <T>(val : T) : Ok<T> =>
    ({tag : "Ok", value : val});
export const makeFailure = <T>(msg : string) : Failure =>
    ({tag : "Failure", message : msg});

export const isOk = <T>(x: Result<T>): x is Ok<T> =>
    x.tag === "Ok";
export const isFailure = <T>(x: Result<T>): x is Failure =>
    x.tag === "Failure";

/* Question 4 */
export const bind = <T1, T2>(result : Result<T1>, f : (x : T1) => Result<T2>) : Result<T2> => 
    isFailure(result) ? makeFailure(result.message) : f(result.value);

/* Question 5 */
interface User {
    name: string;
    email: string;
    handle: string;
}

const validateName = (user: User): Result<User> =>
    user.name.length === 0 ? makeFailure("Name cannot be empty") :
    user.name === "Bananas" ? makeFailure("Bananas is not a name") :
    makeOk(user);

const validateEmail = (user: User): Result<User> =>
    user.email.length === 0 ? makeFailure("Email cannot be empty") :
    user.email.endsWith("bananas.com") ? makeFailure("Domain bananas.com is not allowed") :
    makeOk(user);

const validateHandle = (user: User): Result<User> =>
    user.handle.length === 0 ? makeFailure("Handle cannot be empty") :
    user.handle.startsWith("@") ? makeFailure("This isn't Twitter") :
    makeOk(user);

export const naiveValidateUser = (user: User): Result<User> => {
    let nameResult = validateName(user)
    let emailResult = validateEmail(user)
    let handleResult = validateHandle(user)
    let outputResult : Result<User>
    isFailure(nameResult) ? outputResult = makeFailure(<string>nameResult.message) :
    isFailure(emailResult) ? outputResult = makeFailure(<string>emailResult.message) :
    isFailure(handleResult) ? outputResult = makeFailure(<string>handleResult.message) :
    outputResult = makeOk(user);
    return outputResult;
}

export const monadicValidateUser = (user: User): Result<User> =>
    reduce(bind,validateName(user),[validateEmail,validateHandle]);