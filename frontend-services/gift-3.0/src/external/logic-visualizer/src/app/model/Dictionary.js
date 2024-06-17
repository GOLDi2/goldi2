export function dictForEach(dict, transformer) {
    let newDict = {};
    for (let key in dict) {
        if (dict.hasOwnProperty(key)) {
            newDict[key] = transformer(dict[key]);
        }
    }
    return newDict;
}
//# sourceMappingURL=Dictionary.js.map