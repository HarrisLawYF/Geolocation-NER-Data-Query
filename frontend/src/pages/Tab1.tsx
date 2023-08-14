import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonButton, IonText
} from '@ionic/react';
import './Tab1.css';
import React, { useState, useRef } from "react";

//TODO: integration with Veracode to scan for vulnerability, the name of the plugin is called Green Light

interface SingleValues {
    file: any;
}

interface MultipleValues {
    fileOne: any;
    fileTwo: any;
    fileThree: any;
}

const Tab1: React.FC = () => {

    const [loading, setLoading] = useState("Please upload a file to get started");

    const downloadFile = (data:any, fileName: string, fileType: string) => {
        const blob = new Blob([data], { type: fileType })
        alert("File has been processed. Generating CSV file now...");

        const a = document.createElement('a')
        a.download = fileName
        a.href = window.URL.createObjectURL(blob)
        const clickEvt = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
        })
        a.dispatchEvent(clickEvt)
        a.remove()
        setLoading("Please upload a file to get started");
    }

    const exportToCsv = (data: any) => {
        // Headers for each column
        let headers = [data.headers.join(",")]
        // Convert users data to a csv
        let records = data.body.reduce((body:any, record:any) => {
            const attributes = record;
            body.push(Object.values(attributes).join(','));
            return body;
        }, [])

        setLoading("Data processing finished, generating a file now.....");

        downloadFile(
            [...headers, ...records].join('\n'),
            'result.csv',
            'text/csv',
        )
    }

    // Single File Upload
    const singleValues = useRef<SingleValues>({
        file: false,
    });

    // Multiple File Upload
    const multipleValues = useRef<MultipleValues>({
        fileOne: false,
        fileTwo: false,
        fileThree: false,
    });

    // Single File Upload
    const onSingleFileChange = (fileChangeEvent: any) => {
        singleValues.current.file = fileChangeEvent.target.files[0];
    };

    const submitSingleForm = async () => {
        if (!singleValues.current.file) {
            return false;
        }

        setLoading("Uploading file and processing on the way......");


        let formData = new FormData();

        formData.append("pdf", singleValues.current.file, singleValues.current.file.name);

        try {
            const serverUrl = "http://localhost:3000/pdf/upload/AFI_NTA";
        
            await fetch(serverUrl, {
                method: "POST",
                body: formData,
            }).then(response => response.json())
              .then(data => {
                  exportToCsv(data);
              });
        } catch (err) {
            console.log(err);
        }
    };

    // Multiple File Upload
    const onFileOneChange = (fileChangeEvent: any) => {
        multipleValues.current.fileOne = fileChangeEvent.target.files[0];
    };

    const onFileTwoChange = (fileChangeEvent: any) => {
        multipleValues.current.fileTwo = fileChangeEvent.target.files[0];
    };

    const onFileThreeChange = (fileChangeEvent: any) => {
        multipleValues.current.fileThree = fileChangeEvent.target.files[0];
    };

    const submitMultipleForm = async () => {
        if (
            !multipleValues.current.fileOne ||
            !multipleValues.current.fileTwo ||
            !multipleValues.current.fileThree
        ) {
            return false;
        }

        let formData = new FormData();
        formData.append(
            "photos[]",
            multipleValues.current.fileOne,
            multipleValues.current.fileOne.name
        );
        formData.append(
            "photos[]",
            multipleValues.current.fileTwo,
            multipleValues.current.fileTwo.name
        );
        formData.append(
            "photos[]",
            multipleValues.current.fileThree,
            multipleValues.current.fileThree.name
        );

        try {
            const serverUrl = "http://localhost:3000/pdf/upload";

            const response = await fetch(serverUrl, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            console.log(response);
        } catch (err) {
            console.log(err);
        }
    };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
           <IonTitle>File Upload</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">File Upload</IonTitle>
          </IonToolbar>
        </IonHeader>
              <IonItem>
                  <input type="file" onChange={(ev) => onSingleFileChange(ev)}></input>
              </IonItem>
              <IonButton color="primary" onClick={() => submitSingleForm()}>
                  Upload File
              </IonButton>
              <IonText color="secondary">
                  <h1>{loading}</h1>
              </IonText>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
