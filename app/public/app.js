document.addEventListener('DOMContentLoaded', function() {
  // Tabs functionality
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      
      // Deactivate all tabs
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Activate current tab
      tab.classList.add('active');
      document.getElementById(`${target}-section`).classList.add('active');
    });
  });
  
  // QR Code Generator
  const qrForm = document.getElementById('qr-form');
  const qrContent = document.getElementById('qr-content');
  const qrColor = document.getElementById('qr-color');
  const colorValue = document.getElementById('color-value');
  const logoUpload = document.getElementById('logo-upload');
  const logoBtn = document.getElementById('logo-btn');
  const styleBtns = document.querySelectorAll('.style-btn');
  const qrResult = document.getElementById('qr-result');
  const qrCode = document.getElementById('qr-code');
  const qrDownload = document.getElementById('qr-download');
  const qrNew = document.getElementById('qr-new');
  
  // URL Shortener
  const urlForm = document.getElementById('url-form');
  const longUrl = document.getElementById('long-url');
  const customSlug = document.getElementById('custom-slug');
  const urlResult = document.getElementById('url-result');
  const shortUrl = document.getElementById('short-url');
  const urlCopy = document.getElementById('url-copy');
  const urlDate = document.getElementById('url-date');
  const urlClicks = document.getElementById('url-clicks');
  const urlNew = document.getElementById('url-new');
  
  // State variables
  let qrStyle = 'squares';
  let logoFile = null;
  
  // QR color update
  qrColor.addEventListener('input', function() {
    colorValue.textContent = this.value;
  });
  
  // Logo upload
  logoBtn.addEventListener('click', function() {
    logoUpload.click();
  });
  
  logoUpload.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
      logoFile = e.target.files[0];
      logoBtn.textContent = logoFile.name;
    }
  });
  
  // QR style selection
  styleBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      styleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      qrStyle = btn.getAttribute('data-style');
    });
  });
  
  // Generate QR code - FIXED THE ERROR
  qrForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!qrContent.value.trim()) {
      alert('Please enter content for the QR code');
      return;
    }
    
    try {
      // Clear previous QR code
      qrCode.innerHTML = '';
      
      // Create a canvas element explicitly
      const canvas = document.createElement('canvas');
      qrCode.appendChild(canvas);
      
      // Set up options
      const options = {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 200,
        color: {
          dark: qrColor.value,
          light: '#FFFFFF'
        }
      };
      
      // Generate QR code
      await QRCode.toCanvas(canvas, qrContent.value, options);
      
      // Add logo if provided
      if (logoFile) {
        await addLogoToQRCode(canvas, logoFile);
      }
      
      // Show result
      qrForm.style.display = 'none';
      qrResult.classList.remove('hidden');
      
    } catch (error) {
      console.error('QR code generation error:', error);
      alert('Error generating QR code: ' + error.message);
    }
  });
  
  // Download QR code
  qrDownload.addEventListener('click', function() {
    const canvas = qrCode.querySelector('canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
  
  // Create new QR code
  qrNew.addEventListener('click', function() {
    qrForm.reset();
    logoBtn.textContent = 'No file selected';
    logoFile = null;
    colorValue.textContent = '#000000';
    qrResult.classList.add('hidden');
    qrForm.style.display = 'block';
  });
  
  // URL shortening
  urlForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!longUrl.value.trim()) {
      alert('Please enter a URL to shorten');
      return;
    }
    
    try {
      // Call API to shorten URL
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: longUrl.value,
          slug: customSlug.value || undefined
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create short URL');
      }
      
      const data = await response.json();
      
      // Display result
      shortUrl.value = data.shortUrl;
      urlDate.textContent = new Date(data.created).toLocaleString();
      urlClicks.textContent = '0';
      
      urlForm.style.display = 'none';
      urlResult.classList.remove('hidden');
      
    } catch (error) {
      alert(error.message || 'Error shortening URL');
    }
  });
  
  // Copy short URL
  urlCopy.addEventListener('click', async function() {
    try {
      await navigator.clipboard.writeText(shortUrl.value);
      
      // Visual feedback
      this.style.backgroundColor = '#dafbe1';
      setTimeout(() => {
        this.style.backgroundColor = '';
      }, 1000);
      
    } catch (error) {
      alert('Failed to copy to clipboard');
    }
  });
  
  // Create new URL
  urlNew.addEventListener('click', function() {
    urlForm.reset();
    urlResult.classList.add('hidden');
    urlForm.style.display = 'block';
  });
  
  // Helper function to add logo to QR code
  async function addLogoToQRCode(canvas, logoFile) {
    return new Promise((resolve, reject) => {
      const ctx = canvas.getContext('2d');
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const img = new Image();
        
        img.onload = function() {
          // Calculate size and position for logo
          const size = canvas.width / 4;
          const x = (canvas.width - size) / 2;
          const y = (canvas.height - size) / 2;
          
          // Create white background for logo
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(x - 2, y - 2, size + 4, size + 4);
          
          // Draw logo
          ctx.drawImage(img, x, y, size, size);
          resolve();
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(logoFile);
    });
  }
});