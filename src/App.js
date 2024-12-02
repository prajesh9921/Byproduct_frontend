import React, { useState, useCallback } from 'react';
import axios from 'axios';

// File Upload Component
const FileUploader = ({ onFileUpload }) => {
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('https://growthpartners-backend.onrender.com/api/upload', formData);
      onFileUpload(response.data);
    } catch (error) {
      console.error('File upload error', error);
    }
  };

  return (
    <div className="mb-4">
      <input 
        type="file" 
        accept=".xlsx" 
        onChange={handleFileChange} 
        className="w-full p-2 border rounded"
      />
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ message, type }) => {
  const baseStyles = 'p-3 rounded-lg mb-2 max-w-[80%]';
  const typeStyles = {
    user: 'bg-blue-500 text-white self-end ml-auto',
    assistant: 'bg-gray-200 text-black self-start',
    system: 'bg-green-100 text-green-800 text-center'
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type]}`}>
      {message}
    </div>
  );
};

// Main Chat Interface
const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [data, setData] = useState();

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const newMessages = [
      ...messages, 
      { type: 'user', message: inputMessage }
    ];
    
    setMessages(newMessages);
    setInputMessage('');

    try {
      // Call backend API to get AI response
      const response = await axios.post('https://growthpartners-backend.onrender.com/api/chat', { 
        message: newMessages,
        financialContext: data.data
      });

      // Add AI response
      setMessages(prevMessages => [
        ...prevMessages, 
        { type: 'assistant', message: response.data.reply }
      ]);
    } catch (error) {
      console.error('Chat error', error);
      setMessages(prevMessages => [
        ...prevMessages, 
        { type: 'system', message: 'Error processing request' }
      ]);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        {messages.map((msg, index) => (
          <MessageBubble 
            key={index} 
            message={msg.message} 
            type={msg.type} 
          />
        ))}
      </div>

      {/* <FileUploader onFileUpload={(data) => {
        setMessages(prev => [
          ...prev, 
          { type: 'system', message: 'File uploaded successfully' }
        ]);
      }} /> */}

       <FileUploader onFileUpload={setData}/>

      <div className="p-4 bg-white border-t flex">
        <input 
          type="text" 
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask a financial question..."
          className="flex-grow p-2 border rounded-l"
        />
        <button 
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-r"
        >
          Send
        </button>
        <button onClick={() => console.log(data)} >debug</button>
      </div>
    </div>
  );
};

export default App;

// import React, { useState } from "react";
// import axios from "axios";
// import * as XLSX from "xlsx";
// import "./App.css";

// function App() {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [uploadedData, setUploadedData] = useState(null);

//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         try {
//           const data = new Uint8Array(e.target.result);
//           const workbook = XLSX.read(data, { type: "array" });
//           const jsonResult = {};
  
//           workbook.SheetNames.forEach((sheetName) => {
//             // Log the raw sheet data to inspect
//             console.log("Raw Sheet Data:", workbook.Sheets[sheetName]);
  
//             const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
//               header: 1, // Use first row as headers
//               defval: '', // Default value for empty cells
//               blankrows: false // Skip empty rows
//             });
  
//             console.log("Converted Sheet Data:", sheetData);
//             jsonResult[sheetName] = sheetData;
//           });
  
//           setUploadedData(jsonResult);
//           alert(`File converted successfully!`);
//         } catch (error) {
//           console.error("Conversion Error:", error);
//           alert("Failed to convert file.");
//         }
//       };
//       reader.readAsArrayBuffer(file);
//     }
//   };

//   const sendMessage = async () => {
//     if (!input.trim() || !uploadedData) {
//       alert("Please enter a question and upload a file!");
//       return;
//     }

//     const userMessage = { role: "user", content: input };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");
//     setLoading(true);

//     try {
//       const response = await axios.post("http://localhost:3500/ask", {
//         message: input,
//         data: uploadedData,
//       });

//       console.log("response", response);

//       const assistantMessage = {
//         role: "assistant",
//         content: response.data.choices[0].message.content,
//       };

//       setMessages((prev) => [...prev, assistantMessage]);
//     } catch (error) {
//       console.error(error);
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="App">
//       <h1>Financial Chat Assistant</h1>
//       <div className="file-upload">
//         <label htmlFor="fileInput">Upload your financial file:</label>
//         <input type="file" id="fileInput" onChange={handleFileUpload} />
//       </div>
//       <div className="chat-container">
//         {messages.map((msg, idx) => (
//           <div
//             key={idx}
//             className={`message ${msg.role === "user" ? "user" : "assistant"}`}
//           >
//             {msg.content}
//           </div>
//         ))}
//         {loading && <div className="message assistant">Typing...</div>}
//       </div>
//       <div className="input-container">
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Ask your financial questions..."
//         />
//         <button onClick={sendMessage}>Send</button>
//       </div>
//     </div>
//   );
// }

// export default App;
