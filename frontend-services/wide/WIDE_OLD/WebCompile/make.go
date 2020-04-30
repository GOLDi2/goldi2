package main

import (
	"os"
	"os/exec"
	"path/filepath"
)

func makeAll(tmpDir string, makefile string) (bool, string) {
	workingDir, err := os.Getwd()
	if err != nil {
		panic(err)
	}

	toolchainDir := filepath.Join(workingDir, "toolchains")
	makefileDir := filepath.Join(workingDir, "makefiles")

	_, err = copy(filepath.Join(makefileDir, makefile), filepath.Join(tmpDir, "Makefile"))
	if err != nil {
		panic(err)
	}

	cmd := exec.Command(filepath.Join(toolchainDir, "make"), "all", "TOOLCHAINS="+toolchainDir, "SHELL=cmd.exe")
	cmd.Dir = tmpDir
	stdoutStderr, err := cmd.CombinedOutput()
	return err == nil, string(stdoutStderr)
}
