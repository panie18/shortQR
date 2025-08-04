document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const tabQr = document.getElementById('tab-qr');
  const tabUrl = document.getElementById('tab-url');
  const sectionQr = document.getElementById('section-qr');
  const sectionUrl = document.getElementById('section-url');
  
  const qrForm = document.getElementById('qr-form');
  const qrContent = document.getElementById('qr-content');
  const qrColor = document.getElementById('qr-color');
  const colorHex = document.getElementById('color-hex');
  const logoUpload = document.getElementById('logo-upload');
  const logoBtn = document.getElementById('logo-btn');
  const logoName = document.getElementById('logo-name');
  const qrStyleBtns = document.querySelectorAll('.qr-style-btn');
  const qrResult = document.getElementById('qr-result');
  const qrCode = document.getElementById('qr-code');
  const qrDownload = document.getElementById('qr-download');
  const qrNew = document.getElementById('qr-new');
  
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

  // Tab switching
  tabQr.addEventListener('click', () => {
    tabQr.classList.add('active');
    tabUrl.classList.remove('active');
    sectionQr.classList.remove('hidden');
    sectionUrl.classList.add('hidden');
  });

  tabUrl.addEventListener('click', () => {
    tabUrl.classList.add('active');
    tabQr.classList.remove('active');
    sectionUrl.classList.remove('hidden');
    sectionQr.classList.add('hidden');
  });

  // QR code color
  qrColor.addEventListener('input', () => {
    colorHex.textContent = qrColor.value;
  });

  // Logo upload
  logoBtn.addEventListener('click', () => {
    logoUpload.click();
  });

  logoUpload.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      logoFile = e.target.files[0];
      logoName.textContent = logoFile.name;
    }
  });

  // QR style selection
  qrStyleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      qrStyleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      qrStyle = btn.dataset.style;
    });
  });

  // Generate QR code
  qrForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!qrContent.value.trim()) {
      alert('Please enter content for the QR code');
      return;
    }
    
    try {
      qrCode.innerHTML = '';
      
      // Process logo if provided
      let logoImage = null;
      if (logoFile) {
        logoImage = await readFileAsDataURL(logoFile);
      }
      
      // Configure QR options
      const options = {
        errorCorrectionLevel: 'H',
        margin: 1,
        color: {
          dark: qrColor.value,
          light: '#FFFFFF'
        }
      };
      
      // Create QR code
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, qrContent.value, options);
      qrCode.appendChild(canvas);
      
      // Add logo if provided
      if (logoImage) {
        addLogoToQRCode(canvas, logoImage);
      }
      
      // Apply styles based on selection
      if (qrStyle !== 'squares') {
        styleQRCode(canvas, qrStyle, qrColor.value);
      }
      
      // Show results
      qrResult.classList.remove('hidden');
      qrForm.classList.add('hidden');
    } catch (error) {
      console.error('QR code generation error:', error);
      alert('Failed to generate QR code. Please try again.');
    }
  });
  
  // Download QR code
  qrDownload.addEventListener('click', () => {
    const canvas = qrCode.querySelector('canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'shortQR-code.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
  
  // Create new QR code
  qrNew.addEventListener('click', () => {
    qrForm.reset();
    logoName.textContent = 'No file selected';
    logoFile = null;
    qrResult.classList.add('hidden');
    qrForm.classList.remove('hidden');
    colorHex.textContent = '#ffffff';
  });
  
  // URL shortening
  urlForm.addEventListener('submit', async (e) => {
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
      
      // Display results
      shortUrl.value = data.shortUrl;
      urlDate.textContent = new Date(data.created).toLocaleString();
      urlClicks.textContent = '0';
      
      urlResult.classList.remove('hidden');
      urlForm.classList.add('hidden');
    } catch (error) {
      console.error('URL shortening error:', error);
      alert(error.message || 'Failed to shorten URL');
    }
  });
  
  // Copy short URL
  urlCopy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(shortUrl.value);
      
      // Visual feedback
      const originalBg = urlCopy.className;
      urlCopy.classList.add('bg-green-600');
      
      setTimeout(() => {
        urlCopy.className = originalBg;
      }, 1000);
    } catch (err) {
      alert('Failed to copy URL: ' + err);
    }
  });
  
  // Create new short URL
  urlNew.addEventListener('click', () => {
    urlForm.reset();
    urlResult.classList.add('hidden');
    urlForm.classList.remove('hidden');
  });

  // Helper Functions
  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function addLogoToQRCode(canvas, logoImage) {
    const ctx = canvas.getContext('2d');
    const size = canvas.width / 4;
    
    const img = new Image();
    img.onload = () => {
      const x = (canvas.width - size) / 2;
      const y = (canvas.height - size) / 2;
      
      // Create white background for logo
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x - 2, y - 2, size + 4, size + 4);
      
      // Draw logo
      ctx.drawImage(img, x, y, size, size);
    };
    img.src = logoImage;
  }

  function styleQRCode(canvas, style, color) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const moduleSize = canvas.width / 25; // Approximate module size
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw styled modules
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const index = (y * canvas.width + x) * 4;
        if (data[index] === 0) { // Black pixel in original QR code
          const centerX = Math.floor(x / moduleSize) * moduleSize + moduleSize / 2;
          const centerY = Math.floor(y / moduleSize) * moduleSize + moduleSize / 2;
          
          if (Math.floor(x / moduleSize) === Math.floor(centerX / moduleSize) && 
              Math.floor(y / moduleSize) === Math.floor(centerY / moduleSize)) {
                
            const hex = color.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            
            if (style === 'dots') {
              ctx.beginPath();
              ctx.arc(centerX, centerY, moduleSize / 2.5, 0, Math.PI * 2);
              ctx.fill();
            } else if (style === 'rounded') {
              ctx.beginPath();
              ctx.roundRect(
                centerX - moduleSize / 2.5,
                centerY - moduleSize / 2.5,
                moduleSize / 1.25,
                moduleSize / 1.25,
                moduleSize / 5
              );
              ctx.fill();
            }
          }
        }
      }
    }
  }
});