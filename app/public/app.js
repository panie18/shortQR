document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('theme-toggle');
  const qrTab = document.getElementById('qr-tab');
  const urlTab = document.getElementById('url-tab');
  const qrPanel = document.getElementById('qr-panel');
  const urlPanel = document.getElementById('url-panel');
  
  const qrForm = document.getElementById('qr-form');
  const qrContent = document.getElementById('qr-content');
  const qrColorInput = document.getElementById('qr-color');
  const bgColorInput = document.getElementById('bg-color');
  const colorValue = document.getElementById('color-value');
  const bgColorValue = document.getElementById('bg-color-value');
  const logoUpload = document.getElementById('logo-upload');
  const logoBtn = document.getElementById('logo-btn');
  const logoName = document.getElementById('logo-name');
  const qrResult = document.getElementById('qr-result');
  const qrCodeContainer = document.getElementById('qr-code');
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
  
  const styleBtns = document.querySelectorAll('.style-btn');
  
  let qrOptions = {
    style: 'squares',
    'corner-outer': 'square',
    'corner-inner': 'square',
    color: '#1f1f1f',
    background: '#ffffff'
  };
  
  let logoFile = null;
  
  function initializeTabs() {
    document.querySelector('md-tabs').addEventListener('change', (event) => {
      if (event.target.activeTabIndex === 0) {
        qrPanel.classList.add('active');
        urlPanel.classList.remove('active');
      } else {
        qrPanel.classList.remove('active');
        urlPanel.classList.add('active');
      }
    });
  }
  
  function initializeThemeToggle() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark-mode');
      document.documentElement.classList.remove('light-mode');
      themeToggle.querySelector('md-icon').textContent = 'light_mode';
    } else if (savedTheme === 'light') {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark-mode');
      themeToggle.querySelector('md-icon').textContent = 'dark_mode';
    }
    
    themeToggle.addEventListener('click', () => {
      if (document.documentElement.classList.contains('dark-mode')) {
        document.documentElement.classList.remove('dark-mode');
        document.documentElement.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
        themeToggle.querySelector('md-icon').textContent = 'dark_mode';
      } else {
        document.documentElement.classList.remove('light-mode');
        document.documentElement.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        themeToggle.querySelector('md-icon').textContent = 'light_mode';
      }
    });
  }
  
  function initializeStyleButtons() {
    styleBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const feature = this.getAttribute('data-feature');
        const style = this.getAttribute('data-style');
        
        document.querySelectorAll(`.style-btn[data-feature="${feature}"]`)
          .forEach(b => b.classList.remove('active'));
        
        this.classList.add('active');
        qrOptions[feature] = style;
      });
    });
  }
  
  function initializeColorPickers() {
    qrColorInput.addEventListener('input', function() {
      colorValue.textContent = this.value;
      qrOptions.color = this.value;
    });
    
    bgColorInput.addEventListener('input', function() {
      bgColorValue.textContent = this.value;
      qrOptions.background = this.value;
    });
  }
  
  function initializeLogoUpload() {
    logoBtn.addEventListener('click', function() {
      logoUpload.click();
    });
    
    logoUpload.addEventListener('change', function(e) {
      if (e.target.files.length > 0) {
        logoFile = e.target.files[0];
        logoName.textContent = logoFile.name;
      }
    });
  }
  
  function initializeQRForm() {
    qrForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const content = qrContent.value;
      if (!content) {
        return;
      }
      
      try {
        qrCodeContainer.innerHTML = '';
        
        const canvas = document.createElement('canvas');
        qrCodeContainer.appendChild(canvas);
        
        const options = {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 280,
          color: {
            dark: qrOptions.color,
            light: qrOptions.background
          }
        };
        
        await QRCode.toCanvas(canvas, content, options);
        
        await customizeQRCode(canvas, qrOptions);
        
        if (logoFile) {
          await addLogoToQRCode(canvas, logoFile);
        }
        
        qrForm.style.display = 'none';
        qrResult.classList.remove('hidden');
        
      } catch (error) {
        console.error('QR code generation error:', error);
        alert('Error generating QR code: ' + error.message);
      }
    });
  }
  
  async function customizeQRCode(canvas, options) {
    return new Promise((resolve) => {
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const moduleSize = canvas.width / 33;
      
      if (options.style === 'squares' && options['corner-outer'] === 'square' && options['corner-inner'] === 'square') {
        resolve();
        return;
      }
      
      let modules = [];
      for (let y = 0; y < canvas.height; y += moduleSize) {
        for (let x = 0; x < canvas.width; x += moduleSize) {
          const centerX = Math.floor(x + moduleSize / 2);
          const centerY = Math.floor(y + moduleSize / 2);
          
          const index = (centerY * canvas.width + centerX) * 4;
          
          if (data[index] === 0 && data[index + 1] === 0 && data[index + 2] === 0) {
            let isEye = false;
            let isEyeCenter = false;
            
            if (x < moduleSize * 7 && y < moduleSize * 7) {
              if (x < moduleSize * 7 && x > 0 && y < moduleSize * 7 && y > 0) {
                if (x > moduleSize && x < moduleSize * 6 && y > moduleSize && y < moduleSize * 6) {
                  if (x > moduleSize * 2 && x < moduleSize * 5 && y > moduleSize * 2 && y < moduleSize * 5) {
                    isEyeCenter = true;
                  } else {
                    isEye = true;
                  }
                }
              }
            } else if (x > canvas.width - moduleSize * 7 && y < moduleSize * 7) {
              if (x < canvas.width && y < moduleSize * 7 && y > 0) {
                if (x > canvas.width - moduleSize * 6 && x < canvas.width - moduleSize && 
                    y > moduleSize && y < moduleSize * 6) {
                  if (x > canvas.width - moduleSize * 5 && x < canvas.width - moduleSize * 2 &&
                      y > moduleSize * 2 && y < moduleSize * 5) {
                    isEyeCenter = true;
                  } else {
                    isEye = true;
                  }
                }
              }
            } else if (x < moduleSize * 7 && y > canvas.height - moduleSize * 7) {
              if (x < moduleSize * 7 && x > 0 && y < canvas.height) {
                if (x > moduleSize && x < moduleSize * 6 && 
                    y > canvas.height - moduleSize * 6 && y < canvas.height - moduleSize) {
                  if (x > moduleSize * 2 && x < moduleSize * 5 && 
                      y > canvas.height - moduleSize * 5 && y < canvas.height - moduleSize * 2) {
                    isEyeCenter = true;
                  } else {
                    isEye = true;
                  }
                }
              }
            }
            
            modules.push({
              x: Math.floor(x),
              y: Math.floor(y),
              size: Math.ceil(moduleSize),
              isEye,
              isEyeCenter
            });
          }
        }
      }
      
      ctx.fillStyle = options.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      modules.forEach(module => {
        ctx.fillStyle = options.color;
        
        const x = module.x;
        const y = module.y;
        const size = module.size;
        
        if (module.isEyeCenter) {
          switch (options['corner-inner']) {
            case 'circle':
              ctx.beginPath();
              ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
              ctx.fill();
              break;
            case 'rounded':
              drawRoundedRect(ctx, x, y, size, size, size/3);
              break;
            case 'dots':
              const dotSize = size / 3;
              for (let dx = 0; dx < 2; dx++) {
                for (let dy = 0; dy < 2; dy++) {
                  ctx.beginPath();
                  ctx.arc(x + (dx + 0.5) * dotSize, y + (dy + 0.5) * dotSize, dotSize/2, 0, Math.PI * 2);
                  ctx.fill();
                }
              }
              break;
            case 'bars':
              for (let i = 0; i < 2; i++) {
                ctx.fillRect(x + i * (size/3) + (size/8), y, size/4, size);
              }
              break;
            default:
              ctx.fillRect(x, y, size, size);
          }
        } else if (module.isEye) {
          switch (options['corner-outer']) {
            case 'rounded':
              drawRoundedRect(ctx, x, y, size, size, size/3);
              break;
            case 'circle':
              ctx.beginPath();
              ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
              ctx.fill();
              break;
            case 'dots':
              ctx.beginPath();
              ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
              ctx.fill();
              break;
            case 'diamond':
              ctx.beginPath();
              ctx.moveTo(x + size/2, y);
              ctx.lineTo(x + size, y + size/2);
              ctx.lineTo(x + size/2, y + size);
              ctx.lineTo(x, y + size/2);
              ctx.closePath();
              ctx.fill();
              break;
            default:
              ctx.fillRect(x, y, size, size);
          }
        } else {
          switch (options.style) {
            case 'dots':
              ctx.beginPath();
              ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
              ctx.fill();
              break;
            case 'rounded':
              drawRoundedRect(ctx, x, y, size, size, size/3);
              break;
            case 'classy':
              ctx.beginPath();
              ctx.moveTo(x + size/2, y);
              ctx.lineTo(x + size, y + size/2);
              ctx.lineTo(x + size/2, y + size);
              ctx.lineTo(x, y + size/2);
              ctx.closePath();
              ctx.fill();
              break;
            case 'bars':
              ctx.fillRect(x, y, size/3, size);
              break;
            default:
              ctx.fillRect(x, y, size, size);
          }
        }
      });
      
      resolve();
    });
  }
  
  async function addLogoToQRCode(canvas, logoFile) {
    return new Promise((resolve, reject) => {
      const ctx = canvas.getContext('2d');
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const img = new Image();
        
        img.onload = function() {
          const size = canvas.width / 4;
          const x = (canvas.width - size) / 2;
          const y = (canvas.height - size) / 2;
          
          ctx.fillStyle = qrOptions.background;
          ctx.fillRect(x - 5, y - 5, size + 10, size + 10);
          
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
  
  function drawRoundedRect(ctx, x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
  }
  
  function initializeQRActions() {
    qrDownload.addEventListener('click', function() {
      const canvas = qrCodeContainer.querySelector('canvas');
      if (!canvas) return;
      
      const paddedCanvas = document.createElement('canvas');
      const padding = 40;
      paddedCanvas.width = canvas.width + (padding * 2);
      paddedCanvas.height = canvas.height + (padding * 2);
      
      const ctx = paddedCanvas.getContext('2d');
      
      ctx.fillStyle = qrOptions.background;
      ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
      
      ctx.drawImage(canvas, padding, padding);
      
      const link = document.createElement('a');
      link.download = 'shortqr-code.png';
      link.href = paddedCanvas.toDataURL('image/png');
      link.click();
    });
    
    qrNew.addEventListener('click', function() {
      qrResult.classList.add('hidden');
      qrForm.style.display = 'block';
      qrContent.value = '';
      logoFile = null;
      logoName.textContent = 'Upload Logo';
    });
  }
  
  function initializeURLShortener() {
    urlForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const url = longUrl.value;
      if (!url) return;
      
      try {
        const response = await fetch('/api/shorten', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            slug: customSlug.value || undefined
          })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to create short URL');
        }
        
        const data = await response.json();
        
        shortUrl.value = data.shortUrl;
        urlDate.textContent = new Date(data.created).toLocaleString();
        urlClicks.textContent = '0';
        
        urlForm.style.display = 'none';
        urlResult.classList.remove('hidden');
        
      } catch (error) {
        alert(error.message || 'Error shortening URL');
      }
    });
    
    urlCopy.addEventListener('click', async function() {
      try {
        await navigator.clipboard.writeText(shortUrl.value);
        
        const originalIcon = urlCopy.querySelector('md-icon').textContent;
        urlCopy.querySelector('md-icon').textContent = 'check';
        
        setTimeout(() => {
          urlCopy.querySelector('md-icon').textContent = originalIcon;
        }, 2000);
        
      } catch (error) {
        alert('Failed to copy to clipboard');
      }
    });
    
    urlNew.addEventListener('click', function() {
      urlResult.classList.add('hidden');
      urlForm.style.display = 'block';
      longUrl.value = '';
      customSlug.value = '';
    });
  }
  
  initializeThemeToggle();
  initializeTabs();
  initializeStyleButtons();
  initializeColorPickers();
  initializeLogoUpload();
  initializeQRForm();
  initializeQRActions();
  initializeURLShortener();
});
