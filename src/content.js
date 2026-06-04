chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "autofillForm") {
    const resumeData = request.resumeData;
    
    // 1. Find all visible, interactable form fields on the page
    const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
    
    inputs.forEach(input => {
      if (input.disabled || input.offsetParent === null) return;

      // 2. Find the text label associated with this input box
      let labelText = "";
      
      // Workday trick: look for an ID or aria-labelledby relationship
      if (input.id) {
        const labelEl = document.querySelector(`label[for="${input.id}"]`);
        if (labelEl) labelText = labelEl.innerText;
      }
      
      // Fallback: If no direct label tag, look at parent container text
      if (!labelText) {
        let parent = input.parentElement;
        while (parent && !labelText) {
          const labelTag = parent.querySelector('label');
          if (labelTag) labelText = labelTag.innerText;
          parent = parent.parentElement;
        }
      }

      // Clean up the text (e.g., "First Name *" -> "First Name")
      labelText = labelText.replace(/\*/g, '').trim().toLowerCase();

      if (!labelText) return;

      // 3. Simple & ultra-fast matching logic based on the AI Resume JSON
      let valueToFill = "";

      if (labelText.includes("first") || labelText.includes("given") || labelText.includes("legal name")) {
        valueToFill = resumeData.name.split(" ")[0];
      } else if (labelText.includes("last") || labelText.includes("family")) {
        valueToFill = resumeData.name.split(" ").slice(1).join(" ") || resumeData.name;
      } else if (labelText.includes("email") || labelText.includes("electronic mail")) {
        valueToFill = resumeData.email;
      } else if (labelText.includes("phone") || labelText.includes("mobile") || labelText.includes("number")) {
        valueToFill = resumeData.phone;
      } else if (labelText.includes("location") || labelText.includes("city") || labelText.includes("address")) {
        valueToFill = resumeData.location;
      }

      // 4. Inject the data into Workday and trigger React state updates
      if (valueToFill) {
        input.value = valueToFill;
        
        // CRITICAL WORKDAY FIX: We must dispatch input events so Workday's 
        // internal frontend frameworks (React) realize the box has text!
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('blur', { bubbles: true }));
      }
    });

    sendResponse({ success: true });
  }
  return true;
});