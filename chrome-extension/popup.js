document.addEventListener('DOMContentLoaded', () => {
  const claimInput = document.getElementById('claimInput');
  const verifyBtn = document.getElementById('verifyBtn');
  const resultDiv = document.getElementById('result');
  const resultScore = document.getElementById('resultScore');
  const resultExplanation = document.getElementById('resultExplanation');
  const loader = document.getElementById('loader');

  // Check if there is a claim sent from background script via context menu
  chrome.storage.local.get(['targetClaim'], (res) => {
    if (res.targetClaim) {
      claimInput.value = res.targetClaim;
      // Clear it so it doesn't persist forever
      chrome.storage.local.remove('targetClaim');
      // Auto-verify
      verifyClaim(res.targetClaim);
    }
  });

  verifyBtn.addEventListener('click', () => {
    const claim = claimInput.value.trim();
    if (claim) {
      verifyClaim(claim);
    }
  });

  async function verifyClaim(claim) {
    resultDiv.style.display = 'none';
    loader.style.display = 'block';
    
    try {
      // NOTE: Update this URL if deploying to production!
      const API_URL = "http://127.0.0.1:5000/api/fakenews/analyze";
      
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim: claim })
      });
      
      const responseJson = await response.json();
      
      if (responseJson.success && responseJson.data) {
        const data = responseJson.data;
        const status = data.isFake ? 'Fake News' : 'Real News';
        
        resultScore.textContent = `Status: ${status} (Confidence: ${data.confidence}%)`;
        resultScore.style.color = data.isFake ? '#ef4444' : '#10b981';
        resultExplanation.textContent = data.explanation;
        resultDiv.style.display = 'block';
      } else {
        const errorMsg = responseJson.error || "Could not analyze the claim.";
        const details = responseJson.details || "";
        resultExplanation.textContent = `Error: ${errorMsg} ${details}`;
        resultDiv.style.display = 'block';
      }
    } catch (err) {
      resultExplanation.textContent = "Network error. Make sure SARVAM-X backend is running locally at port 5000.";
      resultDiv.style.display = 'block';
    } finally {
      loader.style.display = 'none';
    }
  }
});
