let originalImageData, encodedImageData;

function loadImage(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    if (file && file.type.match('image.*')) {
        fileNameDisplay.textContent = file.name;

        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                document.getElementById('originalImage').src = canvas.toDataURL();
            };
            img.src = reader.result;
        };

        reader.readAsDataURL(file);
    } else {
        fileNameDisplay.textContent = 'Pilih Gambar';
        alert('File yang dipilih bukan gambar yang valid.');
    }
}

function encodeImage() {
    const secretMessage = document.getElementById('secretMessage').value;
    if (!originalImageData || !secretMessage) {
        alert('Mohon masukkan gambar dan pesan rahasia terlebih dahulu.');
        return;
    }

    encodedImageData = new ImageData(originalImageData.data, originalImageData.width, originalImageData.height);
    const messageLength = secretMessage.length;
    const maxLength = Math.floor((originalImageData.data.length * 3) / 8);

    if (messageLength > maxLength) {
        alert(`Pesan rahasia terlalu panjang. Panjang maksimum yang diizinkan adalah ${maxLength} karakter.`);
        return;
    }

    let messageIndex = 0;
    for (let i = 0; i < encodedImageData.data.length; i += 4) {
        if (messageIndex < messageLength) {
            const charCode = secretMessage.charCodeAt(messageIndex);
            encodedImageData.data[i] = (encodedImageData.data[i] & 0xFC) | ((charCode >> 6) & 0x03);
            encodedImageData.data[i + 1] = (encodedImageData.data[i + 1] & 0xFC) | ((charCode >> 4) & 0x03);
            encodedImageData.data[i + 2] = (encodedImageData.data[i + 2] & 0xFC) | ((charCode >> 2) & 0x03);
            encodedImageData.data[i + 3] = (encodedImageData.data[i + 3] & 0xFC) | (charCode & 0x03);
            messageIndex++;
        } else {
            // Menambahkan karakter null ('\0') sebagai penanda akhir pesan
            encodedImageData.data[i] = (encodedImageData.data[i] & 0xFC);
            encodedImageData.data[i + 1] = (encodedImageData.data[i + 1] & 0xFC);
            encodedImageData.data[i + 2] = (encodedImageData.data[i + 2] & 0xFC);
            encodedImageData.data[i + 3] = (encodedImageData.data[i + 3] & 0xFC);
            break;
        }
    }

    const canvas = document.createElement('canvas');
    canvas.width = encodedImageData.width;
    canvas.height = encodedImageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(encodedImageData, 0, 0);
    document.getElementById('encodedImage').src = canvas.toDataURL();

    showImages();

    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.style.display = 'inline';
}

function decodeImage() {
    if (!encodedImageData && !originalImageData) {
        alert('Mohon encode gambar atau masukkan gambar yang telah di-encode terlebih dahulu.');
        return;
    }

    let decodedMessage = '';
    let charCode;
    let imageData = encodedImageData || originalImageData;

    for (let i = 0; i < imageData.data.length; i += 4) {
        charCode = (imageData.data[i] & 0x03) << 6;
        charCode |= (imageData.data[i + 1] & 0x03) << 4;
        charCode |= (imageData.data[i + 2] & 0x03) << 2;
        charCode |= (imageData.data[i + 3] & 0x03);

        // Jika ditemukan karakter null ('\0'), maka pesan sudah lengkap
        if (charCode === 0) {
            break;
        }

        // Menambahkan karakter ke pesan yang didekode
        decodedMessage += String.fromCharCode(charCode);
    }

    document.getElementById('result').textContent = `Pesan Rahasia: ${decodedMessage}`;
}

function showImages() {
    const imageContainer = document.getElementById('imageContainer');
    const originalImage = document.getElementById('originalImage');
    const encodedImage = document.getElementById('encodedImage');

    imageContainer.style.display = 'flex';
    originalImage.style.display = 'block';
    encodedImage.style.display = 'block';
}

function resetApp() {
    originalImageData = null;
    encodedImageData = null;
    document.getElementById('originalImage').src = '';
    document.getElementById('encodedImage').src = '';
    document.getElementById('secretMessage').value = '';
    document.getElementById('result').textContent = '';
    document.getElementById('imageContainer').style.display = 'none';
    document.getElementById('downloadLink').style.display = 'none';
    document.getElementById('fileNameDisplay').textContent = 'Pilih Gambar';
}