document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.querySelector('.upload-btn');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const downloadBtn = document.getElementById('downloadBtn');
    const previewSection = document.querySelector('.preview-section');

    let originalFile = null;
    let compressedFile = null;

    // 上传按钮点击事件
    uploadBtn.addEventListener('click', () => fileInput.click());

    // 文件选择事件
    fileInput.addEventListener('change', handleFileSelect);

    // 拖拽事件
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length) {
            handleFile(files[0]);
        }
    });

    // 质量滑块事件
    qualitySlider.addEventListener('input', async () => {
        qualityValue.textContent = qualitySlider.value + '%';
        if (originalFile) {
            await compressImage(originalFile);
        }
    });

    // 下载按钮事件
    downloadBtn.addEventListener('click', () => {
        if (compressedFile) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(compressedFile);
            link.download = 'compressed_' + originalFile.name;
            link.click();
        }
    });

    async function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    }

    async function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件！');
            return;
        }

        originalFile = file;
        previewSection.style.display = 'block';
        
        // 显示原始图片
        originalPreview.src = URL.createObjectURL(file);
        originalSize.textContent = formatFileSize(file.size);

        // 压缩图片
        await compressImage(file);
    }

    async function compressImage(file) {
        try {
            const quality = qualitySlider.value / 100;
            const options = {
                maxSizeMB: file.size / (1024 * 1024) * quality, // 根据质量比例计算目标大小
                maxWidthOrHeight: 4096, // 增加最大尺寸限制
                useWebWorker: true,
                quality: quality,
                // 新增压缩选项
                initialQuality: quality,
                alwaysKeepResolution: true, // 尽量保持原始分辨率
                fileType: file.type, // 保持原始文件类型
            };

            compressedFile = await imageCompression(file, options);
            compressedPreview.src = URL.createObjectURL(compressedFile);
            compressedSize.textContent = formatFileSize(compressedFile.size);
            
            // 显示压缩比例
            const compressionRatio = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
            compressedSize.textContent = `${formatFileSize(compressedFile.size)} (压缩率: ${compressionRatio}%)`;
        } catch (error) {
            console.error('压缩失败:', error);
            alert('图片压缩失败，请重试！');
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}); 