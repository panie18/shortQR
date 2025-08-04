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
    style: 'squares',
    'corner-outer': 'square',
    'corner-inner': 'square',
    color: '#000000',
    background: '#FFFFFF'
  };
  let logoFile = null;
  
  // Add ripple effect to glass buttons
  function addRippleEffect() {
    const glassButtons = document.querySelectorAll('.glass-btn');
    
    glassButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        const x = e.clientX - e.target.getBoundingClientRect().left;
        const y = e.clientY - e.target.getBoundingClientRect().top;
        
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        this.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  }
  
  // Theme Toggle
  themeToggleBtn.addEventListener('click', function() {
    document.documentElement.classList.toggle('dark');
    
    // Animate the switch
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    document.body.setAttribute('data-theme', currentTheme);
    
    // Save theme preference
    localStorage.setItem('theme', currentTheme);
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
    document.body.setAttribute('data-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }
  
  // Tab switching with animations
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      const activeContent = document.querySelector('.tab-content.active');
      const targetContent = document.getElementById(`${target}-section`);
      
      if (activeContent === targetContent) return;
      
      // Animate out current content
      activeContent.classList.add('animate-out');
      
      setTimeout(() => {
        // Deactivate all tabs
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => {
          c.classList.remove('active');
          c.classList.remove('animate-out');
        });
        
        // Activate current tab
        tab.classList.add('active');
        targetContent.classList.add('active');
        targetContent.classList.add('animate-in');
        
        setTimeout(() => {
          targetContent.classList.remove('animate-in');
        }, 500);
      }, 300);
    });
  });
  
  // Style button selection with animation
  styleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const feature = btn.getAttribute('data-feature');
      const style = btn.getAttribute('data-style');
      
      // Deactivate other buttons in the same feature group
      document.querySelectorAll(`.style-btn[data-feature="${feature}"]`)
        .forEach(b => b.classList.remove('active'));
      
      // Activate this button with spring animation
      btn.classList.add('active');
      
      // Add a pulse animation
      btn.style.animation = 'pulse 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      setTimeout(() => {
        btn.style.animation = '';
      }, 600);
      
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
      
      // Animate the button to show success
      logoBtn.classList.add('success');
      setTimeout(() => {
        logoBtn.classList.remove('success');
      }, 1000);
    }
  });
  
  // Generate QR code with smooth transitions
  qrForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!qrContent.value.trim()) {
      // Shake animation for error
      qrContent.classList.add('error-shake');
      setTimeout(() => {
        qrContent.classList.remove('error-shake');
      }, 600);
      
      qrContent.focus();
      return;
    }
    
    try {
      // Show loading state
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = `
        <svg class="loading-spinner" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5"></circle>
        </svg>
      `;
      submitBtn.disabled = true;
      
      // Clear previous QR code
      qrCode.innerHTML = '';
      
      // Create a canvas element explicitly
      const canvas = document.createElement('canvas');
      qrCode.appendChild(canvas);
      
      // Set up options for QRCode.js
      const options = {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 280,
        color: {
          dark: qrOptions.color,
          light: qrOptions.background
        }
      };
      
      // Generate base QR code
      await QRCode.toCanvas(canvas, qrContent.value, options);
      
      // Apply custom styling based on user selections
      await customizeQRCode(canvas, qrOptions);
      
      // Add logo if provided
      if (logoFile) {
        await addLogoToQRCode(canvas, logoFile);
      }
      
      // Hide the form and show the result with animation
      qrForm.classList.add('animate-out');
      
      setTimeout(() => {
        qrForm.style.display = 'none';
        qrResult.classList.remove('hidden');
        qrResult.classList.add('animate-in');
        
        // Reset form button
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }, 300);
      
    } catch (error) {
      console.error('QR code generation error:', error);
      alert('Error generating QR code: ' + error.message);
      
      // Reset button state
      const submitBtn = this.querySelector('button[type="submit"]');
      submitBtn.innerHTML = 'Generate QR Code';
      submitBtn.disabled = false;
    }
  });
  
  // Download QR code with visual feedback
  qrDownload.addEventListener('click', function() {
    const canvas = qrCode.querySelector('canvas');
    if (!canvas) return;
    
    // Create a new canvas with padding
    const paddedCanvas = document.createElement('canvas');
    const padding = 40;
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
    
    // Visual feedback
    this.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Downloaded
    `;
    
    setTimeout(() => {
      this.innerHTML = 'Download';
    }, 2000);
    
    // Trigger download
    link.click();
  });
  
  // Create new QR code with smooth transition
  qrNew.addEventListener('click', function() {
    qrResult.classList.add('animate-out');
    
    setTimeout(() => {
      qrResult.classList.remove('animate-in');
      qrResult.classList.add('hidden');
      qrResult.classList.remove('animate-out');
      
      qrForm.reset();
      logoName.textContent = 'Upload Logo';
      logoFile = null;
      colorValue.textContent = '#000000';
      bgColorValue.textContent = '#FFFFFF';
      qrOptions.color = '#000000';
      qrOptions.background = '#FFFFFF';
      
      // Reset style buttons
      document.querySelectorAll('.style-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      document.querySelectorAll('.style-btn[data-feature="style"][data-style="squares"]').forEach(btn => {
        btn.classList.add('active');
      });
      document.querySelectorAll('.style-btn[data-feature="corner-outer"][data-style="square"]').forEach(btn => {
        btn.classList.add('active');
      });
      document.querySelectorAll('.style-btn[data-feature="corner-inner"][data-style="square"]').forEach(btn => {
        btn.classList.add('active');
      });
      
      qrForm.style.display = 'block';
      qrForm.classList.add('animate-in');
      
      setTimeout(() => {
        qrForm.classList.remove('animate-in');
      }, 500);
    }, 300);
  });
  
  // URL shortening with loading animation
  urlForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!longUrl.value.trim()) {
      // Shake animation for error
      longUrl.classList.add('error-shake');
      setTimeout(() => {
        longUrl.classList.remove('error-shake');
      }, 600);
      
      longUrl.focus();
      return;
    }
    
    try {
      // Show loading state
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = `
        <svg class="loading-spinner" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5"></circle>
        </svg>
      `;
      submitBtn.disabled = true;
      
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
      
      // Display result with animation
      shortUrl.value = data.shortUrl;
      urlDate.textContent = new Date(data.created).toLocaleString();
      urlClicks.textContent = '0';
      
      urlForm.classList.add('animate-out');
      
      setTimeout(() => {
        urlForm.style.display = 'none';
        urlResult.classList.remove('hidden');
        urlResult.classList.add('animate-in');
        
        // Reset button
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }, 300);
      
    } catch (error) {
      alert(error.message || 'Error shortening URL');
      
      // Reset button state
      const submitBtn = this.querySelector('button[type="submit"]');
      submitBtn.innerHTML = 'Shorten URL';
      submitBtn.disabled = false;
    }
  });
  
  // Copy short URL with animation
  urlCopy.addEventListener('click', async function() {
    try {
      await navigator.clipboard.writeText(shortUrl.value);
      
      // Visual feedback animation
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
  
  // Create new URL with animation
  urlNew.addEventListener('click', function() {
    urlResult.classList.add('animate-out');
    
    setTimeout(() => {
      urlResult.classList.remove('animate-in');
      urlResult.classList.add('hidden');
      urlResult.classList.remove('animate-out');
      
      urlForm.reset();
      urlForm.style.display = 'block';
      urlForm.classList.add('animate-in');
      
      setTimeout(() => {
        urlForm.classList.remove('animate-in');
      }, 500);
    }, 300);
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
          
          // Create background for logo
          ctx.fillStyle = qrOptions.background;
          ctx.fillRect(x - 5, y - 5, size + 10, size + 10);
          
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
  
  // Complex function to customize QR code based on user selections
  async function customizeQRCode(canvas, options) {
    return new Promise((resolve)
