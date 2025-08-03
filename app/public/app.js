document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');
  
  // Check for saved theme preference or use system preference
  if (localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    if (document.documentElement.classList.contains('dark')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  });
  
  // Tab switching
  const qrTabBtn = document.getElementById('qr-tab-btn');
  const urlTabBtn = document.getElementById('url-tab-btn');
  const qrTab = document.getElementById('qr-tab');
  const urlTab = document.getElementById('url-tab');
  
  qrTabBtn.addEventListener('click', () => {
    qrTabBtn.classList.add('border-umbrel-blue');
    qrTabBtn.classList.remove('text-gray-500', 'dark:text-gray-400', 'border-transparent');
    
    urlTabBtn.classList.remove('border-umbrel-blue');
    urlTabBtn.classList.add('text-gray-500', 'dark:text-gray-400', 'border-transparent');
    
    qrTab.classList.remove('hidden');
    urlTab.classList.add('hidden');
  });
  
  urlTabBtn.addEventListener('click', () => {
    urlTabBtn.classList.add('border-umbrel-blue');
    urlTabBtn.classList.remove('text-gray-500', 'dark:text-gray-400', 'border-transparent');
    
    qrTabBtn.classList.remove('border-umbrel-blue');
    qrTabBtn.classList.add('text-gray-500', 'dark:text-gray-400', 'border-transparent');
    
    urlTab.classList.remove('hidden');
    qrTab.classList.add('hidden');
  });
  
  // QR Code Generator
  const qrContent = document.getElementById('qr-content');
  const qrSize = document.getElementById('qr-size');
  const sizeValue = document.getElementById('size-value');
  const qrColor = document.getElementById('qr-color');
  const bgColor = document.getElementById('bg-color');
  const shapeBtns = document.querySelectorAll('.shape-btn');
  const logoUpload = document.getElementById('logo-upload');
  const logoSize = document.getElementById('logo-size');
  const logoSizeValue = document.getElementById('logo-size-value');
  const generateQrBtn = document.getElementById('generate-qr');
  const qrCodeContainer = document.getElementById('qr-code-container');
  const qrResult = document.getElementById('qr-result');
  const downloadQrBtn = document.getElementById('download-qr');
  const shareQrBtn = document.getElementById('share-qr');
  
  // QR code options
  let qrOptions = {
    content: '',
    size: 250,
    shape: 'square',
    color: '#000000',
    backgroundColor: '#FFFFFF',
    logo: null,
    logoSize: 25
  };
  
  // Update size value display
  qrSize.addEventListener('input', () => {
    sizeValue.textContent = `${qrSize.value}px`;
    qrOptions.size = parseInt(qrSize.value);
  });
  
  // Update logo size value display
  logoSize.addEventListener('input', () => {
    logoSizeValue.textContent = `${logoSize.value}%`;
    qrOptions.logoSize = parseInt(logoSize.value);
  });
  
  // Handle shape selection
  shapeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      shapeBtns.forEach(b => {
        b.classList.remove('active', 'border-umbrel-blue');
        b.classList.add('border-gray-300', 'dark:border-gray-600');
      });
      
      // Add active class to clicked button
      btn.classList.add('active', 'border-umbrel-blue');
      btn.classList.remove('border-gray-300', 'dark:border-gray-600');
      
      qrOptions.shape = btn.dataset.shape;
    });
  });
  
  // Handle color inputs
  qrColor.addEventListener('input', () => {
    qrOptions.color = qrColor.value;
  });
  
  bgColor.addEventListener('input', () => {
    qrOptions.backgroundColor = bgColor.value;
  });
  
  // Handle logo upload
  logoUpload.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        qrOptions.logo = event.target.result;
        logoSize.disabled = false;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });
  
  // Generate QR code
  generateQrBtn.addEventListener('click', () => {
    const content = qrContent.value.trim();
    
    if (!content) {
      alert('Please enter a URL or text');
      return;
    }
    
    qrOptions.content = content;
    
    // Clear previous QR code
    qrCodeContainer.innerHTML = '';
    
    // Generate QR code
    QRCode.toCanvas(qrCodeContainer, content, {
      width: qrOptions.size,
      margin: 2,
      color: {
        dark: qrOptions.color,
        light: qrOptions.backgroundColor
      },
      errorCorrectionLevel: 'H' // High error correction for logo
    }, (error) => {
      if (error) {
        console.error(error);
        return;
      }
      
      // Apply shape styling to the canvas
      const canvas = qrCodeContainer.querySelector('canvas');
      if (canvas) {
        if (qrOptions.shape === 'rounded') {
          canvas.style.borderRadius = '12px';
        } else if (qrOptions.shape === 'circle') {
          canvas.style.borderRadius = '50%';
        }
        
        // Add logo if provided
        if (qrOptions.logo) {
          const ctx = canvas.getContext('2d');
          const logoImg = new Image();
          logoImg.onload = () => {
            const logoWidth = canvas.width * (qrOptions.logoSize / 100);
            const logoHeight = logoWidth;
            const logoX = (canvas.width - logoWidth) / 2;
            const logoY = (canvas.height - logoHeight) / 2;
            
            // Draw white background for logo
            ctx.fillStyle = 'white';
            ctx.fillRect(logoX - 5, logoY - 5, logoWidth + 10, logoHeight + 10);
            
            // Draw logo
            ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
          };
          logoImg.src = qrOptions.logo;
        }
      }
      
      // Show result section and enable buttons
      qrResult.classList.remove('hidden');
      downloadQrBtn.disabled = false;
      shareQrBtn.disabled = false;
    });
  });
  
  // Download QR code
  downloadQrBtn.addEventListener('click', () => {
    const canvas = qrCodeContainer.querySelector('canvas');
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = `qrcode-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  });
  
  // Share QR code (for browsers that support Web Share API)
  shareQrBtn.addEventListener('click', () => {
    const canvas = qrCodeContainer.querySelector('canvas');
    if (canvas && navigator.share) {
      canvas.toBlob(blob => {
        const file = new File([blob], 'qrcode.png', { type: 'image/png' });
        navigator.share({
          title: 'QR Code',
          text: 'Check out this QR code I created!',
          files: [file]
        }).catch(console.error);
      });
    } else if (!navigator.share) {
      alert('Your browser does not support the Web Share API');
    }
  });
  
  // URL Shortener
  const longUrl = document.getElementById('long-url');
  const customAlias = document.getElementById('custom-alias');
  const shortenUrlBtn = document.getElementById('shorten-url');
  const urlResult = document.getElementById('url-result');
  const shortenedUrl = document.getElementById('shortened-url');
  const copyUrlBtn = document.getElementById('copy-url');
  const createdDate = document.getElementById('created-date');
  const clickCount = document.getElementById('click-count');
  const urlQrCode = document.getElementById('url-qr-code');
  const customizeUrlQrBtn = document.getElementById('customize-url-qr');
  
  // Shorten URL
  shortenUrlBtn.addEventListener('click', () => {
    const url = longUrl.value.trim();
    
    if (!url) {
      alert('Please enter a URL to shorten');
      return;
    }
    
    if (!isValidURL(url)) {
      alert('Please enter a valid URL');
      return;
    }
    
    // Call API to shorten URL
    fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        originalUrl: url,
        customAlias: customAlias.value.trim()
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }
      
      // Update UI with shortened URL
      shortenedUrl.textContent = data.shortUrl;
      createdDate.textContent = new Date(data.createdAt).toLocaleDateString();
      clickCount.textContent = data.clicks;
      
      // Generate QR code for the shortened URL
      QRCode.toCanvas(urlQrCode, data.shortUrl, {
        width: 120,
        height: 120,
        margin: 2,
        errorCorrectionLevel: 'M'
      });
      
      // Show result section
      urlResult.classList.remove('hidden');
    })
    .catch(error => {
      console.error('Error shortening URL:', error);
      alert('Error shortening URL. Please try again.');
    });
  });
  
  // Copy shortened URL
  copyUrlBtn.addEventListener('click', () => {
    const url = shortenedUrl.textContent;
    navigator.clipboard.writeText(url)
      .then(() => {
        const originalHTML = copyUrlBtn.innerHTML;
        copyUrlBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        `;
        setTimeout(() => {
          copyUrlBtn.innerHTML = originalHTML;
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
      });
  });
  
  // Customize URL QR code
  customizeUrlQrBtn.addEventListener('click', () => {
    // Switch to QR tab
    qrTabBtn.click();
    
    // Pre-fill the URL
    qrContent.value = shortenedUrl.textContent;
  });
  
  // Helper function to validate URL
  function isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
});