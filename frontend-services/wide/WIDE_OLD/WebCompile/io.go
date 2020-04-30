package main

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

func createDirForFile(dst string) error {
	dir := filepath.Dir(dst)
	return os.MkdirAll(dir, 600)
}

func copy(src, dst string) (int64, error) {
	sourceFileStat, err := os.Stat(src)
	if err != nil {
		return 0, err
	}

	if !sourceFileStat.Mode().IsRegular() {
		return 0, fmt.Errorf("%s is not a regular file", src)
	}

	source, err := os.Open(src)
	if err != nil {
		return 0, err
	}
	defer source.Close()

	err = createDirForFile(dst)
	if err != nil {
		return 0, err
	}
	destination, err := os.Create(dst)
	if err != nil {
		return 0, err
	}
	defer destination.Close()
	nBytes, err := io.Copy(destination, source)
	return nBytes, err
}

func saveFiles(files []CompileRequestFile, dir string) {
	for _, file := range files {
		fullpath := filepath.Join(dir, file.Name)
		assertPathInBase(fullpath, dir)
		err := createDirForFile(fullpath)
		if err != nil {
			fmt.Println(err)
			return
		}
		f, err := os.OpenFile(fullpath, os.O_WRONLY|os.O_CREATE, 0666)
		if err != nil {
			fmt.Println(err)
			return
		}
		defer f.Close()
		fmt.Fprint(f, file.Content)
	}
}

func assertPathInBase(path string, basepath string) {
	absPath, err := filepath.Abs(path)
	if err != nil {
		panic(err)
	}
	absBasePath, err := filepath.Abs(basepath)
	if err != nil {
		panic(err)
	}
	if !strings.HasPrefix(absPath, absBasePath) {
		panic("provided path is not secure")
	}
}
