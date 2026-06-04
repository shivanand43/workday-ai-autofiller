// import { useState } from 'react';
// import { extractTextFromPDF } from './pdfParser';
// import styles from './App.module.css';

// function App() {
//   const [resumeData, setResumeData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [statusMessage, setStatusMessage] = useState('');

//   const handleFileUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     if (file.type !== 'application/pdf') {
//       alert("Please upload a PDF file.");
//       return;
//     }

//     setIsLoading(true);
//     setResumeData(null);
//     setStatusMessage('Reading PDF...');

//     try {
//       // 1. Extract the text
//       const rawText = await extractTextFromPDF(file);
      
//       // 2. Send it to the background worker for AI processing
//       setStatusMessage('Analyzing with AI...');
      
//       // We use chrome.runtime.sendMessage to talk to background.js
//       chrome.runtime.sendMessage(
//         { action: "parseResume", text: rawText }, 
//         (response) => {
//           if (response && response.success) {
//             setResumeData(response.data);
//             setStatusMessage('Resume processed successfully!');
//           } else {
//             console.error(response?.error);
//             setStatusMessage('AI processing failed.');
//           }
//           setIsLoading(false);
//         }
//       );

//     } catch (error) {
//       console.error(error);
//       setStatusMessage("Failed to read the PDF.");
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <h1 className={styles.title}>Workday AI Autofiller</h1>
      
//       <div className={styles.uploadSection}>
//         <label className={styles.uploadButton} style={{ opacity: isLoading ? 0.7 : 1 }}>
//           {isLoading ? "Processing..." : "Upload Resume (PDF)"}
//           <input 
//             type="file" 
//             accept=".pdf" 
//             onChange={handleFileUpload} 
//             className={styles.hiddenInput}
//             disabled={isLoading}
//           />
//         </label>
//       </div>

//       <p className={styles.statusText}>{statusMessage}</p>

//       {/* If we have structured AI data, we show it neatly here */}
//       {resumeData && (
//         <div className={styles.previewSection}>
//           <h2 className={styles.subtitle}>Structured AI Data:</h2>
//           <pre className={styles.jsonPreview}>
//             {JSON.stringify(resumeData, null, 2)}
//           </pre>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;

import { useState, useEffect } from 'react';
import { extractTextFromPDF } from './pdfParser';
import styles from './App.module.css';

function App() {
  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // NEW: When the popup opens, check if we already saved a resume!
  useEffect(() => {
    chrome.storage.local.get(['savedResume'], (result) => {
      if (result.savedResume) {
        setResumeData(result.savedResume);
        setStatusMessage('Resume loaded from memory!');
      }
    });
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setResumeData(null);
    setStatusMessage('Reading PDF...');

    try {
      const rawText = await extractTextFromPDF(file);
      setStatusMessage('Analyzing with AI...');
      
      chrome.runtime.sendMessage(
        { action: "parseResume", text: rawText }, 
        (response) => {
          if (response && response.success) {
            const data = response.data;
            setResumeData(data);
            setStatusMessage('Resume processed successfully!');
            
            // NEW: Save the AI data to Chrome's permanent memory
            chrome.storage.local.set({ savedResume: data });
          } else {
            setStatusMessage('AI processing failed.');
          }
          setIsLoading(false);
        }
      );
    } catch (error) {
      setStatusMessage("Failed to read the PDF.");
      setIsLoading(false);
    }
  };

  const handleAutofillClick = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url.includes("myworkdayjobs.com")) {
      alert("Please open a Workday job application page first!");
      return;
    }

    chrome.tabs.sendMessage(tab.id, { 
      action: "autofillForm", 
      resumeData: resumeData 
    }, (response) => {
      if (response && response.success) {
        alert("Autofill complete! Review your fields.");
      }
    });
  };

  // NEW: Allow the user to delete the saved resume to upload a new one
  const handleClearData = () => {
    chrome.storage.local.remove(['savedResume'], () => {
      setResumeData(null);
      setStatusMessage('Memory cleared. Please upload a new resume.');
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Workday AI Autofiller</h1>
      
      {!resumeData ? (
        <div className={styles.uploadSection}>
          <label className={styles.uploadButton} style={{ opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? "Processing..." : "Upload Resume (PDF)"}
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileUpload} 
              className={styles.hiddenInput}
              disabled={isLoading}
            />
          </label>
        </div>
      ) : (
        <div className={styles.memorySection}>
          <p className={styles.statusText}>✅ Resume Data Ready</p>
          <button className={styles.clearButton} onClick={handleClearData}>
            Clear Saved Data
          </button>
        </div>
      )}

      <p className={styles.statusText}>{statusMessage}</p>

      {resumeData && (
        <>
          <div className={styles.previewSection}>
            <pre className={styles.jsonPreview}>
              {JSON.stringify(resumeData, null, 2)}
            </pre>
          </div>
          
          <button 
            className={styles.autofillButton} 
            onClick={handleAutofillClick}
          >
            Scan & Autofill Workday Page
          </button>
        </>
      )}
    </div>
  );
}

export default App;