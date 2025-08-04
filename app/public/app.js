document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements - UI Controls
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  const styleBtns = document.querySelectorAll('.style-btn');
  
  // DOM Elements - QR Generator
  const qrForm = document.getElementById('qr-form');
  const qrContent = document.getElementById('qr-content');
  const qrColor = document.getElementById('qr-color');
  const bgColor = document.getElementById('bg-color');
  const colorValue = document.getElementById('color-value');
  const bgColorValue = document.getElementById('bg-color-value');
  const logoUpload = document.getElementById('logo-upload');
  const logoBtn = document.getElementById('logo-btn');
  const logoName = document.getElementById('logo-name');
  const qrResult = document.getElementById('qr-result');
  const qrCode = document.getElementById('qr-code');
  const qrDownload = document.getElementById('qr-download');
  const qrNew = document.getElementById('qr-new');
  
  // DOM Elements - URL Shortener
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
  let qrOptions = {
    dots: 'squares',
    eye: 'square',
    frame: 'square',
    color: '#000000',
    background: '#FFFFFF'
  };
  let logoFile = null;
  
  // Theme Toggle
  themeToggleBtn.addEventListener('click', function() {
    document.documentElement.classList.toggle('dark');
    
    // Save theme preference
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
  
  // Load saved theme preference
  function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      // Check for system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
    }
  }
  
  // Tab switching
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
  
  // Style button selection
  styleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const feature = btn.getAttribute('data-feature');
      const style = btn.getAttribute('data-style');
      
      // Deactivate other buttons in the same feature group
      document.querySelectorAll(`.style-btn[data-feature="${feature}"]`)
        .forEach(b => b.classList.remove('active'));
      
      // Activate this button
      btn.classList.add('active');
      
      // Update state
      qrOptions[feature] = style;
    });
  });
  
  // Color inputs
  qrColor.addEventListener('input', function() {
    colorValue.textContent = this.value;
    qrOptions.color = this.value;
  });
  
  bgColor.addEventListener('input', function() {
    bgColorValue.textContent = this.value;
    qrOptions.background = this.value;
  });
  
  // Logo upload
  logoBtn.addEventListener('click', function() {
    logoUpload.click();
  });
  
  logoUpload.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
      logoFile = e.target.files[0];
      logoName.textContent = logoFile.name;
    }
  });
  
  // Generate QR code
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
        width: 240,
        color: {
          dark: qrOptions.color,
          light: qrOptions.background
        }
      };
      
      // Generate QR code
      await QRCode.toCanvas(canvas, qrContent.value, options);
      
      // Apply custom styling
      await customizeQRCode(canvas, qrOptions);
      
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
    
    // Create a new canvas with padding
    const paddedCanvas = document.createElement('canvas');
    const padding = 20;
    paddedCanvas.width = canvas.width + (padding * 2);
    paddedCanvas.height = canvas.height + (padding * 2);
    
    const ctx = paddedCanvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = qrOptions.background;
    ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
    
    // Draw the QR code
    ctx.drawImage(canvas, padding, padding);
    
    // Create download link
    const link = document.createElement('a');
    link.download = 'shortqr-code.png';
    link.href = paddedCanvas.toDataURL('image/png');
    link.click();
  });
  
  // Create new QR code
  qrNew.addEventListener('click', function() {
    qrForm.reset();
    logoName.textContent = 'Upload Logo';
    logoFile = null;
    colorValue.textContent = '#000000';
    bgColorValue.textContent = '#FFFFFF';
    qrOptions.color = '#000000';
    qrOptions.background = '#FFFFFF';
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
      urlCopy.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
      
      setTimeout(() => {
        urlCopy.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        `;
      }, 2000);
      
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
          ctx.fillStyle = qrOptions.background;
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
  
  // Helper function to customize QR code
  async function customizeQRCode(canvas, options) {
    return new Promise((resolve) => {
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const moduleSize = canvas.width / 33; // Approximate size of QR modules
      
      // If only color needs to be changed and dots are squares, we can return early
      if (options.dots === 'squares' && options.eye === 'square' && options.frame === 'square') {
        resolve();
        return;
      }
      
      // Create a map of module positions
      let modules = [];
      for (let y = 0; y < canvas.height; y += moduleSize) {
        for (let x = 0; x < canvas.width; x += moduleSize) {
          const centerX = Math.floor(x + moduleSize / 2);
          const centerY = Math.floor(y + moduleSize / 2);
          
          // Check if this is a dark module
          const index = (centerY * canvas.width + centerX) * 4;
          if (data[index] === 0 && data[index + 1] === 0 && data[index + 2] === 0) {
            // Check if this is an eye pattern by position
            let isEye = false;
            let isFrame = false;
            
            // Top-left eye detection
            if (x < moduleSize * 7 && y < moduleSize * 7) {
              if (x < moduleSize * 7 && x > 0 && y < moduleSize * 7 && y > 0) {
                if (x > moduleSize && x < moduleSize * 6 && y > moduleSize && y < moduleSize * 6) {
                  isEye = true;
                } else {
                  isFrame = true;
                }
              }
            }
            
            // Top-right eye detection
            else if (x > canvas.width - moduleSize * 7 && y < moduleSize * 7) {
              if (x < canvas.width && y < moduleSize * 7 && y > 0) {
                if (x > canvas.width - moduleSize * 6 && x < canvas.width - moduleSize && 
                    y > moduleSize && y < moduleSize * 6) {
                  isEye = true;
                } else {
                  isFrame = true;
                }
              }
            }
            
            // Bottom-left eye detection
            else if (x < moduleSize * 7 && y > canvas.height - moduleSize * 7) {
              if (x < moduleSize * 7 && x > 0 && y < canvas.height) {
                if (x > moduleSize && x < moduleSize * 6 && 
                    y > canvas.height - moduleSize * 6 && y < canvas.height - moduleSize) {
                  isEye = true;
                } else {
                  isFrame = true;
                }
              }
            }
            
            modules.push({
              x: Math.floor(x),
              y: Math.floor(y),
              size: Math.ceil(moduleSize),
              isEye,
              isFrame
            });
          }
        }
      }
      
      // Clear the canvas
      ctx.fillStyle = options.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw custom modules
      modules.forEach(module => {
        ctx.fillStyle = options.color;
        
        const x = module.x;
        const y = module.y;
        const size = module.size;
        
        if (module.isEye) {
          // Draw eye patterns
          switch (options.eye) {
            case 'circle':
              ctx.beginPath();
              ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
              ctx.fill();
              break;
              
            case 'rounded':
              drawRoundedRect(ctx, x, y, size, size, size/3);
              break;
              
            case 'leaf':
              ctx.save();
              ctx.translate(x + size/2, y + size/2);
              ctx.rotate(Math.PI / 4);
              ctx.fillRect(-size/2, -size/2, size, size);
              ctx.restore();
              break;
              
            default:
              ctx.fillRect(x, y, size, size);
          }
        } else if (module.isFrame) {
          // Draw frame patterns
          switch (options.frame) {
            case 'circle':
              ctx.beginPath();
              ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
              ctx.fill();
              break;
              
            case 'rounded':
              drawRoundedRect(ctx, x, y, size, size, size/3);
              break;
              
            case 'flower':
              ctx.beginPath();
              const centerX = x + size/2;
              const centerY = y + size/2;
              const radius = size/2;
              for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2) * (i / 6);
                const petalX = centerX + Math.cos(angle) * radius;
                const petalY = centerY + Math.sin(angle) * radius;
                if (i === 0) {
                  ctx.moveTo(petalX, petalY);
                } else {
                  ctx.lineTo(petalX, petalY);
                }
              }
              ctx.closePath();
              ctx.fill();
              break;
              
            default:
              ctx.fillRect(x, y, size, size);
          }
        } else {
          // Draw regular modules
          switch (options.dots) {
            case 'dots':
              ctx.beginPath();
              ctx.arc(x + size/2, y + size/2, size/2 - 1, 0, Math.PI * 2);
              ctx.fill();
              break;
              
            case 'rounded':
              drawRoundedRect(ctx, x, y, size, size, size/3);
              break;
              
            case 'classy':
              ctx.save();
              ctx.translate(x + size/2, y + size/2);
              ctx.rotate(Math.PI / 4);
              ctx.fillRect(-size/2 + 1, -size/2 + 1, size - 2, size - 2);
              ctx.restore();
              break;
              
            default:
              ctx.fillRect(x, y, size, size);
          }
        }
      });
      
      resolve();
    });
  }
  
  // Helper function to draw rounded rectangles
  function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }
  
  // Initialize
  loadTheme();
});
