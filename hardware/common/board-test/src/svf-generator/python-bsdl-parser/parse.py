import re
import sys
import bsdl2json

def preproc(filename: str):
    f = open(filename, "r")
    data = f.read()
    regex1 = re.compile("--[\S ]+\n")
    regex2 = re.compile('"\s+&\s+"\s*')
    data = re.sub(regex1, "", data)
    data = re.sub(regex2, "", data)
    return data

if __name__ == '__main__':
    preproc(sys.argv[1])
    bsdl2json.main(preproc(sys.argv[1]),sys.argv[2])
    
