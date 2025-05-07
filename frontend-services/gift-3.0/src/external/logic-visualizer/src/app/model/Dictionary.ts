// apparently it is not possible to do this as a class because methods would also have to have type T
export default interface Dictionary<T> {
    [key: string]: T;
}

interface forEachFunc<In, Out> {
    (value: In): Out;
}

export function dictForEach<In, Out>(dict: Dictionary<In>, transformer: forEachFunc<In, Out>){
    let newDict: Dictionary<Out> = {};
    for(let key in dict){
        if(dict.hasOwnProperty(key)){
            newDict[key] = transformer(dict[key]);
        }
    }
    return newDict;
}