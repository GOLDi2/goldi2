// The standard converter for Booleans turns any value into true. Only if in HTML the attribute is not mentioned
// does it yield false. Unfortunately trying the following in a render template yields an error:
//      ${boolProp ? `boolattr` : ``}
// In order to use the sane version (boolattr="${boolProp}") the exported object has to be used as property options.
const BoolPropOptions = {
    type: Boolean,
    converter(value) {
        return value === "true";
    }
};
export default BoolPropOptions;
//# sourceMappingURL=BooleanProperty.js.map