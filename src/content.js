//src/content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "autofillForm") {
    
    const pageFields = [];
    const elements = document.querySelectorAll('input:not([type="hidden"]), select, textarea, [role="radio"], [role="checkbox"]');
    
    elements.forEach(el => {
      if (el.disabled || el.offsetParent === null) return;
      
      if (!el.id) el.id = 'wd-auto-' + Math.random().toString(36).substr(2, 9);

      let labelText = "";
      const labelEl = document.querySelector(`label[for="${el.id}"]`);
      if (labelEl) {
        labelText = labelEl.innerText;
      } else {
        let parent = el.parentElement;
        while (parent && !labelText) {
          const labelTag = parent.querySelector('label');
          if (labelTag) labelText = labelTag.innerText;
          parent = parent.parentElement;
        }
      }
      
      labelText = labelText.replace(/\*/g, '').trim();
      if (!labelText) return;

      let options = [];
      if (el.tagName === 'SELECT') {
        options = Array.from(el.options).map(opt => opt.text.trim()).filter(text => text !== "");
      } else if (el.type === 'radio' || el.getAttribute('role') === 'radio') {
         options = [el.parentElement?.innerText?.trim() || el.value];
      }

      pageFields.push({
        id: el.id,
        type: el.tagName === 'SELECT' ? 'select' : (el.type || el.getAttribute('role')),
        label: labelText,
        options: options
      });
    });

    if (pageFields.length === 0) {
      alert("No fillable fields found on this step.");
      return sendResponse({ success: false });
    }

    chrome.runtime.sendMessage({
      action: "mapFieldsWithAI",
      resumeData: request.resumeData,
      pageFields: pageFields
    }, (response) => {
      if (response && response.success) {
        const aiMapping = response.mapping;
        
        for (const [elementId, valueToFill] of Object.entries(aiMapping)) {
          if (!valueToFill || valueToFill === "") continue; 

          const targetEl = document.getElementById(elementId);
          if (!targetEl) continue;

          if (targetEl.value && targetEl.type !== 'checkbox' && targetEl.type !== 'radio') continue;

          if (targetEl.tagName === 'SELECT') {
            const options = Array.from(targetEl.options);
            const matchingOption = options.find(opt => opt.text.trim() === valueToFill);
            if (matchingOption) {
              targetEl.value = matchingOption.value;
            }
          } else if (targetEl.type === 'checkbox' || targetEl.getAttribute('role') === 'checkbox') {
            if (valueToFill === true) {
              targetEl.click();
            }        
            } else if (targetEl.type === 'radio' || targetEl.getAttribute('role') === 'radio') {
             targetEl.click(); 
          } else {
            targetEl.value = valueToFill;
          }

          targetEl.dispatchEvent(new Event('input', { bubbles: true }));
          targetEl.dispatchEvent(new Event('change', { bubbles: true }));
          targetEl.dispatchEvent(new Event('blur', { bubbles: true }));
        }
        
        sendResponse({ success: true });
      } else {
        // NEW: This tells you exactly why the AI failed to map
        alert("Autofill mapping failed: " + (response ? response.error : "Unknown error"));
        sendResponse({ success: false });
      }
    });
    
    return true; 
  }
});
