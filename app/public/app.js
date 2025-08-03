document.addEventListener('DOMContentLoaded', () => {
  const qrTab = document.getElementById('qr-tab');
  const urlTab = document.getElementById('url-tab');
  const qrSection = document.getElementById('qr-section');
  const urlSection = document.getElementById('url-section');
  const qrForm = document.getElementById('qr-form');
  const urlForm = document.getElementById('url-form');
  const qrResult = document.getElementById('qr-result');
  const urlResult = document.getElementById('url-result');
  const qrContent = document.getElementById('qr-content');
  const qrCodeContainer = document.getElementById('qr-code-container');
  const qrColor = document.getElementById('qr-color');
  const colorValue = document.getElementById('color-value');
  const qrDownload = document.getElementById('qr-download');
  const qrNew = document.getElementById('qr-new');
  const logoUpload = document.getElementById('logo-upload');
  const logoUploadBtn = document.getElementById('logo-upload-btn');
  const logoFileName = document.getElementById('logo-file-name');
  const qrStyleBtns = document.querySelectorAll('.qr-style-btn');
  const longUrl = document.getElementById('long-url');
  const customSlug = document.getElementById('custom-slug');
  const shortUrl = document.getElementById('short-url');
  const copyBtn = document.getElementById('copy-btn');
  const urlNew = document.getElementById('url-new');
  const createdDate = document.getElementById('created-date');
  const clickCount = document.getElementById('click-count');
  
  let selectedQrStyle = 'squares';
  let logoFile = null;
  
  qrTab.addEventListener('click', () => {
    qrTab.classList.add('active');
    urlTab.classList.remove('active');
    qrSection.classList.remove('hidden');
    urlSection.classList.add('hidden');
  });
  
  urlTab.addEventListener('click', () => {
    urlTab.classList.add('active');
    qrTab.classList.remove('active');
    urlSection.classList.remove('hidden');
    qrSection.classList.add('hidden');
  });

  qrColor.addEventListener('input', () => {
    colorValue.textContent = qrColor.value;
  });
  
  logoUploadBtn.addEventListener('click', () => {
    logoUpload.click();
  });
  
  logoUpload.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      logoFile = e.target.files[0];
      logoFileName.textContent = logoFile.name;
    }
  });
  
  qrStyleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      qrStyleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedQrStyle = btn.dataset.style;
    });
  });
  
  qrForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!qrContent.value.trim()) {
      alert('Please enter content for the QR code');
      return;
    }
    
    qrForm.classList.add('opacity-50', 'pointer-events-none');
    
    try {
      qrCodeContainer.innerHTML = '';
      
      let logoUrl = null;
      if (logoFile) {
        logoUrl = await readFileAsDataURL(logoFile);
      }
      
      const options = {
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
          dark: qrColor.value,
          light: '#FFFFFF'
        }
      };
      
      if (selectedQrStyle === 'dots') {
        options.dotsOptions = { type: 'dots' };
      } else if (selectedQrStyle === 'rounded') {
        options.dotsOptions = { type: 'rounded' };
      }
      
      await QRCode.toCanvas(
        qrCodeContainer, 
        qrContent.value,
        options
      );
      
      if (logoUrl) {
        addLogoToQrCode(qrCodeContainer, logoUrl);
      }
      
      qrResult.classList.remove('hidden');
      qrForm.classList.add('hidden');
      
    } catch (error) {
      alert('Error generating QR code: ' + error.message);
    } finally {
      qrForm.classList.remove('opacity-50', 'pointer-events-none');
    }
  });
  
  qrDownload.addEventListener('click', () => {
    const canvas = qrCodeContainer.querySelector('canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'shortQR-code.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
  
  qrNew.addEventListener('click', () => {
    qrForm.reset();
    logoFileName.textContent = 'Choose a file...';
    logoFile = null;
    qrResult.classList.add('hidden');
    qrForm.classList.remove('hidden');
    colorValue.textContent = '#000000';
  });
  
  urlForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!longUrl.value.trim()) {
      alert('Please enter a URL to shorten');
      return;
    }
    
    urlForm.classList.add('opacity-50', 'pointer-events-none');
    
    try {
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
      shortUrl.value = data.shortUrl;
      createdDate.textContent = new Date(data.created).toLocaleString();
      clickCount.textContent = '0';
      
      urlResult.classList.remove('hidden');
      urlForm.classList.add('hidden');
      
    } catch (error) {
      alert(error.message);
    } finally {
      urlForm.classList.remove('opacity-50', 'pointer-events-none');
    }
  });
  
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(shortUrl.value);
      copyBtn.classList.add('bg-green-500/20');
      setTimeout(() => {
        copyBtn.classList.remove('bg-green-500/20');
      }, 2000);
    } catch (err) {
      alert('Failed to copy: ' + err);
    }
  });
  
  urlNew.addEventListener('click', () => {
    urlForm.reset();
    urlResult.classList.add('hidden');
    urlForm.classList.remove('hidden');
  });

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function addLogoToQrCode(container, logoUrl) {
    const canvas = container.querySelector('canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const size = canvas.width / 4;
    
    const img = new Image();
    img.onload = () => {
      const x = (canvas.width - size) / 2;
      const y = (canvas.height - size) / 2;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x - 5, y - 5, size + 10, size + 10);
      ctx.drawImage(img, x, y, size, size);
    };
    img.src = logoUrl;
  }
});