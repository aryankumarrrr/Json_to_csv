import { useState } from "react";
import { App as AntApp, Button, Flex, UploadProps } from "antd";
import Dragger from "antd/es/upload/Dragger";
import TextArea from "antd/es/input/TextArea";

function App() {
  const [jsonContent, setJsonContent] = useState(null);
  const [csvContent, setCsvContent] = useState("");

  const { message, notification } = AntApp.useApp();

  const handleFileChange = (file: any) => {
    if (file && file.type === "application/json") {
      const reader: any = new FileReader();
      reader.onload = () => {
        try {
          const parsedJson = JSON.parse(reader.result);
          setJsonContent(parsedJson);
        } catch (error) {
          alert("Invalid JSON file.");
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid JSON file.");
    }
  };

  const props: UploadProps = {
    name: 'file',
    multiple: false,
    customRequest(info: any) {
      // Custom handling of the upload
      handleFileChange(info.file);
      setTimeout(() => {
        info.onSuccess({}, info.file); // Simulate success
      }, 0);
    },
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        message.info(`Uploading ${info.file.name}`)
      }
      if (status === 'done') {
        message.success(`Uploaded ${info.file.name}`);

        const file = info.file.originFileObj;
        handleFileChange(file);
      } else if (status === 'error') {
        message.error(`Error uploading ${info.file.name}`)
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  const convertToCSV = (json: any) => {
    if (!json || !Array.isArray(json)) {
      message.info("JSON must be an array of objects.");
      return;
    }
    const keys = Object.keys(json[0]);
    const csvRows = [keys.join(",")];
    json.forEach((row) => {
      const values = keys.map((key) => `"${row[key]}"`);
      csvRows.push(values.join(","));
    });
    setCsvContent(csvRows.join("\n"));
  };

  const handleConvert = () => {
    if (jsonContent) {
      convertToCSV(jsonContent);
    } else {
      notification.info({ message: "No JSON content to convert.", duration: 3 });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Flex vertical align="center" justify="center">
      <h1>JSON to CSV Converter</h1>
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          Upload
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
          Support for a single upload. Strictly prohibited from uploading company data or other
          banned files.
        </p>
      </Dragger>
      <Button onClick={handleConvert} style={{ margin: "10px" }}>
        Convert to CSV
      </Button>
      {csvContent && (
        <>
          <TextArea value={csvContent} rows={20} style={{ maxWidth: '80vw', margin: 20 }} />
          <Button variant={"filled"} color="primary" onClick={handleDownload}>Download CSV</Button>
        </>
      )}
    </Flex>
  );
}

export default App;
