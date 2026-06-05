import { useState, useEffect } from 'react';
import { extractTextFromPDF } from './pdfParser';
import styles from './App.module.css';

function App() {
  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // When the popup opens, check if we already saved a resume!
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
            
            // Save the AI data to Chrome's permanent memory
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

    // Attempt 1: Try to send the message normally
    chrome.tabs.sendMessage(tab.id, { 
      action: "autofillForm", 
      resumeData: resumeData 
    }, (response) => {
      
      // SELF-HEALING LOGIC: If Chrome says the connection is dead (because of a reload)
      if (chrome.runtime.lastError) {
        console.log("Connection dead. Force-injecting the content script...");
        
        // Forcefully inject the spy script into the current Workday tab
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["src/content.js"]
        }).then(() => {
          
          // Attempt 2: Now that it is injected, try sending the message again!
          chrome.tabs.sendMessage(tab.id, { 
            action: "autofillForm", 
            resumeData: resumeData 
          }, (retryResponse) => {
            if (retryResponse && retryResponse.success) {
              alert("Autofill complete! Review your fields.");
            } else {
              alert("Autofill mapping failed or no fields found.");
            }
          });
          
        }).catch(err => {
          console.error("Force injection failed:", err);
          alert("Chrome security blocked the action. Please press F5 to refresh the Workday page once.");
        });
        
        return;
      }

      // If Attempt 1 worked perfectly
      if (response && response.success) {
        alert("Autofill complete! Review your fields.");
      }
    });
  };

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