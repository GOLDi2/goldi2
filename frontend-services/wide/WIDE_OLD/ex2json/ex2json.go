package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

type jsonFile struct {
	Name    string `json:"name"`
	Content string `json:"content"`
}

type jsonProject struct {
	Name  string     `json:"name"`
	Files []jsonFile `json:"files"`
}

func check(e error) {
	if e != nil {
		panic(e)
	}
}

func generateJsonFromFile(path string, basepath string) jsonFile {
	content, err := ioutil.ReadFile(path)
	check(err)
	relpath, err := filepath.Rel(basepath, path)
	check(err)

	file := jsonFile{Content: string(content[:]), Name: relpath}
	return file
}

func generateJsonsFromSubDirectories(path string, extensions []string, basepath string) []jsonFile {
	json := make([]jsonFile, 0, 10)
	files, err := ioutil.ReadDir(path)
	check(err)

	for _, file := range files {
		if file.IsDir() {
			json = append(json, generateJsonsFromSubDirectories(filepath.Join(path, file.Name()), extensions, basepath)...)
		} else {
			// check if filename ends in a selected extension:
			for _, extension := range extensions {
				if strings.HasSuffix(file.Name(), extension) {
					json = append(json, generateJsonFromFile(filepath.Join(path, file.Name()), basepath))
				}
			}
		}
	}
	return json
}

func generateJsonFromDirectory(path string, extensions []string) jsonProject {
	return jsonProject{Files: generateJsonsFromSubDirectories(path, extensions, path), Name: filepath.Base(path)}
}

func main() {
	rootPath := flag.String("root", ".", "The root path for the examples. Each subdir will generate a Template/Example in the json.")
	outputFile := flag.String("out", "wide.json", "The output file")
	defaultExample := flag.String("default", "default", "Name of the example/template which will be sortet to the top of the json. This is the example which will be loaded on default, when the user opens WIDE for the first time.")
	extensions := flag.String("extension", ".c .h", "Name of the example/template which will be sortet to the top of the json. This is the example which will be loaded on default, when the user opens WIDE for the first time.")

	flag.Usage = func() {
		fmt.Fprint(os.Stderr, "ex2json converts a folder structure to a json file which provide different projects to GOLDi WIDE\n\nParameters:\n")
		flag.PrintDefaults()
	}

	flag.Parse()

	extensionList := strings.Split(*extensions, " ")

	files, err := ioutil.ReadDir(*rootPath)
	if err != nil {
		panic(err)
	}

	projects := make([]jsonProject, 0, 10)
	for _, file := range files {
		if file.IsDir() {
			projects = append(projects, generateJsonFromDirectory(filepath.Join(*rootPath, file.Name()), extensionList))
		}
	}

	sort.Slice(projects, func(i, j int) bool {
		if projects[i].Name == *defaultExample {
			return true
		}
		return false
	})

	output, err := json.Marshal(projects)

	check(err)

	err = ioutil.WriteFile(*outputFile, output, 0644)

	check(err)
}
