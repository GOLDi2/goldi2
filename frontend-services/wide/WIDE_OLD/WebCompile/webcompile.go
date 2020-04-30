package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/rs/cors"
)

type CompileResult struct {
	Success bool   `json:"success"`
	Output  string `json:"output"`
}

type CompileRequestFile struct {
	Name    string `json:"name"`
	Content string `json:"content"`
}

type CompileRequest struct {
	Makefile     string               `json:"makefile"`
	SessionId    string               `json:"sessionId,omitempty"`
	ExperimentId string               `json:"experimentId,omitempty"`
	UploadServer string               `json:"uploadServer,omitempty"`
	Files        []CompileRequestFile `json:"files"`
}

func uploadFile(request CompileRequest, path string) {
	// open the file
	file, err := os.Open(path)
	if err != nil {
		panic(err)
	}
	defer file.Close()

	// create a multipart file from file content
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("UserFile", filepath.Base(path))
	if err != nil {
		panic(err)
	}
	_, err = io.Copy(part, file)

	err = writer.Close()
	if err != nil {
		panic(err)
	}

	// create a new post request to the uploadServer
	req, err := http.NewRequest("POST", request.UploadServer+"/index.php?Function=ServerUploadFile&ExperimentID="+request.ExperimentId+"&SessionID="+request.SessionId, body)
	if err != nil {
		panic(err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	// make the request
	client := &http.Client{}
	client.Timeout = 2 * time.Second
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	} else {
		// read the body
		body := &bytes.Buffer{}
		_, err := body.ReadFrom(resp.Body)
		if err != nil {
			panic(err)
		}
		err = resp.Body.Close()
		if err != nil {
			panic(err)
		}

		if string(body.Bytes()) != "1" {
			panic("Upload failed")
		}
	}

}

func compileHandler(w http.ResponseWriter, r *http.Request) {
	// set up panic recovery:
	defer func() {
		if r := recover(); r != nil {
			var err error
			switch t := r.(type) {
			case string:
				err = errors.New(t)
			case error:
				err = t
			default:
				err = errors.New("Unknown error")
			}
			log.Print(err.Error())
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}()

	// Get Working Dir
	workingDir, err := os.Getwd()
	if err != nil {
		panic(err)
	}

	// Create a new dir in subdir "tmp"
	tmpDir := filepath.Join(workingDir, "tmp")
	srcDir, err := ioutil.TempDir(tmpDir, "")
	if err != nil {
		panic(err)
	}
	// and remove folder when finisched:
	defer os.RemoveAll(srcDir)

	// try to decode the compile request
	decoder := json.NewDecoder(r.Body)
	var request CompileRequest
	err = decoder.Decode(&request)
	if err != nil {
		panic(err)
	}

	// save the transmitted files in the dir create above
	saveFiles(request.Files, srcDir)

	// try to compile
	success, output := makeAll(srcDir, request.Makefile)

	// if there is a UploadServer specified, try to upload
	if request.UploadServer != "" {
		uploadFile(request, filepath.Join(srcDir, "main.hex"))
	}

	// Pack the response in a json object
	b, err := json.Marshal(CompileResult{Success: success, Output: output})
	if err != nil {
		panic(err)
	}
	w.Write(b)
	w.Header().Set("Content-Type", "application/json")
}

func main() {
	// init log system:
	// ************************************************************************
	f, err := os.OpenFile("testlogfile", os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("error opening file: %v", err)
	}
	defer f.Close()
	writers := io.MultiWriter(os.Stdout, f)
	log.SetOutput(writers)
	// ************************************************************************

	mux := http.NewServeMux()
	mux.HandleFunc("/compile", compileHandler)

	// allow for CORS requests:
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*", "http://localhost:9000", "http://webkat.azurewebsites.net"},
	})

	// Insert the middleware
	handler := c.Handler(mux)
	log.Fatal(http.ListenAndServe(":8080", handler))
}
