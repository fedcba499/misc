{
    // 1. Handle Trusted Types for modern security (CSP)
    let trustedURL;
    const scriptSrc = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    
    if (window.trustedTypes && trustedTypes.createPolicy) {
        // Use a unique name to avoid "Policy already exists" errors
        const policy = trustedTypes.getPolicyNames().includes('pdfPolicy') 
            ? { createScriptURL: (i) => i } 
            : trustedTypes.createPolicy('pdfPolicy', { createScriptURL: (i) => i });
        trustedURL = policy.createScriptURL(scriptSrc);
    } else {
        trustedURL = scriptSrc;
    }

    // 2. Load the library
    let script = document.createElement("script");
    script.src = trustedURL;
    script.onload = function () {
        // In jsPDF 2.x, the class is under jspdf.jsPDF
        const { jsPDF } = window.jspdf;
        let pdf;
        let images = document.getElementsByTagName("img");
        let validImages = Array.from(images).filter(img => /^blob:/.test(img.src));

        if (validImages.length === 0) {
            console.error("No blob images found!");
            return;
        }

        validImages.forEach((img, i) => {
            const w = img.naturalWidth;
            const h = img.naturalHeight;

            // 3. Initialize PDF with the first image's actual size
            if (i === 0) {
                // orientation, unit, format [width, height]
                pdf = new jsPDF({
                    orientation: w > h ? 'l' : 'p',
                    unit: 'px',
                    format: [w, h]
                });
            } else {
                // Add a new page matching the current image's size
                pdf.addPage([w, h], w > h ? 'l' : 'p');
            }

            // 4. Draw image to canvas to get DataURL (ensures compatibility)
            let canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            let ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, w, h);
            let imgData = canvas.toDataURL("image/jpeg", 0.95);

            // 5. Add image at 0,0 with full width/height
            pdf.addImage(imgData, 'JPEG', 0, 0, w, h);
        });

        pdf.save("document_original_size.pdf");
    };

    document.body.appendChild(script);
}