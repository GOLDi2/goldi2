import re, json
#This helper programm was used to convert the simcir-library.js into a beast library

finds = re.findall("simcir\.registerDevice\('(?P<name>.*?)\',(?P<code>.*?)\)\;", open("simcir-library.js").read(), re.DOTALL)

processedtypes = []
newdevices = []

for name, code in finds:
    device = json.loads(code)
    for key in ["width", "height", "showToolbox", "toolbox"]:
        del device[key]
    for d in device["devices"]:
        lib = "beast-basic-compound" if d["type"] in processedtypes else "beast-basic"
        d["type"] = {"libraryID": lib, "componentID": d["type"]}

    device["ID"] = device["name"] = name

    processedtypes.append(name)
    newdevices.append(device)

lib = {
    "ID": "beast-basic-compound",
    "name": "Compound Components",
    "version": "0.2.0-alpha",
    "components": newdevices
}
print json.dumps(lib, indent=2)