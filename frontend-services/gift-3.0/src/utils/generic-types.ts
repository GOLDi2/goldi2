export type Undefable<T> = T | undefined;
export type Nullable<T> = T | null;
export type Maybe<T> = Undefable<Nullable<T>>;

export type InterfaceLike<T> = {} & T;
export type Dictionary<V> = { [key: string]: V };
