/**
 * Polaroid Camera Interaction Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const photographerWrap = document.getElementById('photographerWrap');
    const cameraOverlay = document.getElementById('cameraOverlay');
    const largeCameraModal = document.getElementById('largeCamera');
    const cameraTrigger = document.getElementById('cameraTrigger');
    const cameraVideo = document.getElementById('cameraVideo');
    const cameraFlash = document.getElementById('cameraFlash');
    const cameraCanvas = document.getElementById('cameraCanvas');
    const lensZoomSlider = document.getElementById('lensZoomSlider');
    const lensElement = document.querySelector('.camera-lens-external');
    
    let isCameraActive = false;
    let localStream = null;

    if (!photographerWrap) return;

    // Lens zoom slider — simulates camera FOV (ultrawide ↔ telephoto)
    if (lensZoomSlider && cameraVideo) {
        lensZoomSlider.addEventListener('input', (e) => {
            // Slider value maps to video scale: 1x = ultrawide, 3x = telephoto
            const scale = parseFloat(e.target.value);
            cameraVideo.style.transform = `scaleX(-1) scale(${scale})`;
        });
        // Prevent slider/control clicks from triggering camera snap
        lensZoomSlider.addEventListener('click', (e) => e.stopPropagation());
        lensZoomSlider.addEventListener('pointerdown', (e) => e.stopPropagation());
        const zoomControl = document.querySelector('.lens-zoom-control');
        if (zoomControl) {
            zoomControl.addEventListener('click', (e) => e.stopPropagation());
        }
    }

    photographerWrap.addEventListener('click', async () => {
        if (!isCameraActive) {
            // First click: Ask for camera permission and show viewfinder
            try {
                localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                cameraVideo.srcObject = localStream;
                isCameraActive = true;
                
                // Show the popped out camera modal and glassmorphism overlay
                cameraOverlay.classList.add('active');
                largeCameraModal.classList.add('active');

            } catch (err) {
                console.error("Camera access denied or unavailable:", err);
                alert("Camera access is needed for the polaroid feature!");
            }
        } else {
            // Just show it if stream is already active
            cameraOverlay.classList.add('active');
            largeCameraModal.classList.add('active');
        }
    });

    // Close the modal when clicking the overlay
    cameraOverlay.addEventListener('click', () => {
        cameraOverlay.classList.remove('active');
        largeCameraModal.classList.remove('active');
    });

    // Clicking the camera snaps the photo
    cameraTrigger.addEventListener('click', () => {
        if (isCameraActive) {
            takeSnapshot();
            // Auto close modal to let them see and drag the picture!
            cameraOverlay.classList.remove('active');
            largeCameraModal.classList.remove('active');
        }
    });

    function takeSnapshot() {
        // Flash animation
        cameraFlash.classList.add('flash-active');
        cameraFlash.classList.remove('flash-fade');
        
        setTimeout(() => {
            cameraFlash.classList.remove('flash-active');
            cameraFlash.classList.add('flash-fade');
        }, 50);

        // Capture frame to canvas
        const ctx = cameraCanvas.getContext('2d');
        const width = cameraVideo.videoWidth;
        const height = cameraVideo.videoHeight;
        
        cameraCanvas.width = width;
        cameraCanvas.height = height;
        
        // Draw the video frame to canvas
        ctx.scale(-1, 1);
        ctx.drawImage(cameraVideo, -width, 0, width, height); // Account for mirror scale
        
        // Create the printed photo element
        createPrintedPhoto(cameraCanvas.toDataURL('image/png'));
    }

    function createPrintedPhoto(dataUrl) {
        // Create the container
        const photoDiv = document.createElement('div');
        photoDiv.className = 'printed-photo';
        
        // Randomize rotation and position slightly
        const randomRotate = (Math.random() - 0.5) * 20; // -10deg to 10deg
        
        const rect = largeCameraModal.getBoundingClientRect();
        // Start near the camera, drop downwards
        const startX = rect.left + rect.width / 2;
        const startY = rect.bottom - 50;
        
        photoDiv.style.left = `${startX}px`;
        photoDiv.style.top = `${startY}px`;
        photoDiv.setAttribute('data-draggable', 'true');
        
        // Create a standard polaroid frame layout
        const innerFrame = document.createElement('div');
        innerFrame.className = 'polaroid-inner-frame';
        
        const snapshotImg = document.createElement('img');
        snapshotImg.src = dataUrl;
        snapshotImg.className = 'polaroid-snapshot';
        
        innerFrame.appendChild(snapshotImg);
        photoDiv.appendChild(innerFrame);
        
        // --- Action Buttons ---
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'polaroid-actions';
        
        // Download Button
        const downloadBtn = document.createElement('div');
        downloadBtn.className = 'polaroid-btn';
        downloadBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
        downloadBtn.title = "Download Memory";
        
        // Stop drag propagation on buttons
        downloadBtn.addEventListener('pointerdown', e => e.stopPropagation());
        downloadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `Memory_${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });

        // Delete Button
        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'polaroid-btn btn-delete';
        deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
        deleteBtn.title = "Shred Picture";
        
        deleteBtn.addEventListener('pointerdown', e => e.stopPropagation());
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Get center position of the photo
            const rect = photoDiv.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Hide the photo immediately or scale it down to 0 quickly
            photoDiv.style.transition = 'transform 0.2s, opacity 0.2s';
            photoDiv.style.transform = photoDiv.style.transform + ' scale(0)';
            photoDiv.style.opacity = '0';
            
            // Create confetti using the theme's purple accent
            const colors = ['var(--accent)', '#a29bfe', '#6c5ce7', '#8e85ee'];
            for(let i=0; i<30; i++) {
                const conf = document.createElement('div');
                conf.className = 'polaroid-confetti';
                conf.style.left = centerX + 'px';
                conf.style.top = centerY + 'px';
                conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                
                // random velocities
                const angle = Math.random() * Math.PI * 2;
                const velocity = 50 + Math.random() * 150; // px distance
                const tx = Math.cos(angle) * velocity;
                const ty = Math.sin(angle) * velocity - 50; // slight upward bias
                
                conf.style.setProperty('--tx', `${tx}px`);
                conf.style.setProperty('--ty', `${ty}px`);
                conf.style.setProperty('--r', `${Math.random() * 720 - 360}deg`);
                
                document.body.appendChild(conf);
                
                // Trigger animation
                setTimeout(() => {
                    conf.classList.add('pop');
                }, 10);
                
                setTimeout(() => {
                    conf.remove();
                }, 1000);
            }

            // Remove photo from DOM
            setTimeout(() => {
                photoDiv.remove();
            }, 300);
        });

        actionsDiv.appendChild(downloadBtn);
        actionsDiv.appendChild(deleteBtn);
        photoDiv.appendChild(actionsDiv);
        
        // Add to DOM
        document.body.appendChild(photoDiv);
        
        // Animate it out
        requestAnimationFrame(() => {
            setTimeout(() => {
                // Drop and pop out
                const targetX = startX - 100 + Math.random() * 200;
                const targetY = startY + 50 + Math.random() * 100;
                
                photoDiv.style.transform = `scale(1) translate(${targetX - startX}px, ${targetY - startY}px) rotate(${randomRotate}deg)`;
                
                // Add dragging functionality
                makeDraggable(photoDiv);
            }, 50);
        });
    }

    // A simple, robust pointer drag implementation for the generated photos
    function makeDraggable(element) {
        let isDragging = false;
        let startX, startY;
        let initialTransform = '';
        
        element.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            element.setPointerCapture(e.pointerId);
            isDragging = true;
            
            // Bring to front
            document.querySelectorAll('.printed-photo, .hero-card, .badge-unit').forEach(el => el.style.zIndex = '10');
            element.style.zIndex = '100';
            
            startX = e.clientX;
            startY = e.clientY;
            
            // Get current transform matrix to compute relative drag
            const style = window.getComputedStyle(element);
            const matrix = new WebKitCSSMatrix(style.transform);
            initialTransform = { x: matrix.m41, y: matrix.m42, r: Math.atan2(matrix.m12, matrix.m11) * (180/Math.PI) };
            
            element.style.transition = 'none';
            element.style.cursor = 'grabbing';
            element.classList.add('dragging');
        });

        element.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            element.style.transform = `translate(${initialTransform.x + dx}px, ${initialTransform.y + dy}px) rotate(${initialTransform.r}deg) scale(1.05)`;
        });

        const release = (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            element.style.cursor = 'grab';
            element.classList.remove('dragging');
            element.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            
            // Reset scale but keep position
            const currentTransform = element.style.transform;
            element.style.transform = currentTransform.replace('scale(1.05)', 'scale(1)');
        };

        element.addEventListener('pointerup', release);
        element.addEventListener('pointercancel', release);
    }
});
