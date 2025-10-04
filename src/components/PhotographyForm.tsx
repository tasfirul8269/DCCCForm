import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent, FormEvent } from 'react';
import SuccessModal from './SuccessModal';
import { uploadMultipleImages } from '../utils/cloudinary';
import { submitToGoogleSheets } from '../utils/googleSheets';
import './PhotographyForm.css';

interface FormData {
  nameBengali: string;
  nameEnglish: string;
  category: string;
  email: string;
  class: string;
  institution: string;
  phoneNumber: string;
  whatsappNumber: string;
}

const PhotographyForm = () => {
  const [formData, setFormData] = useState<FormData>({
    nameBengali: '',
    nameEnglish: '',
    category: '',
    email: '',
    class: '',
    institution: '',
    phoneNumber: '',
    whatsappNumber: '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxwiVZPpThSVFXB0K4PJ7GrsINJRpqbADmelDHIsFDltZMGQXiopmj0C8Win3SvgIwa/exec';

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateImages = (files: FileList | File[]): { valid: File[], errors: string[] } => {
    const validImages: File[] = [];
    const newErrors: string[] = [];
    const fileArray = Array.from(files);

    const remainingSlots = 3 - images.length;

    if (fileArray.length > remainingSlots) {
      newErrors.push(`You can only upload ${remainingSlots} more image(s). Maximum 3 images allowed.`);
      return { valid: validImages, errors: newErrors };
    }

    fileArray.forEach(file => {
      if (!file.type.startsWith('image/')) {
        newErrors.push(`${file.name} is not an image file.`);
        return;
      }

      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 5) {
        newErrors.push(`${file.name} exceeds 5MB limit (${fileSizeMB.toFixed(2)}MB).`);
        return;
      }

      validImages.push(file);
    });

    return { valid: validImages, errors: newErrors };
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const { valid, errors: validationErrors } = validateImages(e.target.files);

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setTimeout(() => setErrors([]), 4000);
      }

      if (valid.length > 0) {
        setImages(prev => [...prev, ...valid]);
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const { valid, errors: validationErrors } = validateImages(e.dataTransfer.files);

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setTimeout(() => setErrors([]), 4000);
      }

      if (valid.length > 0) {
        setImages(prev => [...prev, ...valid]);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrors([]);

    try {
      let imageUrls: string[] = [];

      if (images.length > 0) {
        imageUrls = await uploadMultipleImages(images);
      }

      const categoryName = formData.category === 'mobile' ? 'Mobile Photography' : 'DSLR Photography';

      const submissionData = {
        nameBengali: formData.nameBengali,
        nameEnglish: formData.nameEnglish,
        category: categoryName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        whatsappNumber: formData.whatsappNumber,
        institution: formData.institution,
        class: formData.class,
        image1: imageUrls[0] || '',
        image2: imageUrls[1] || '',
        image3: imageUrls[2] || '',
      };

      await submitToGoogleSheets(submissionData, GOOGLE_SCRIPT_URL);

      setShowSuccess(true);

      setFormData({
        nameBengali: '',
        nameEnglish: '',
        category: '',
        email: '',
        class: '',
        institution: '',
        phoneNumber: '',
        whatsappNumber: '',
      });
      setImages([]);
    } catch (error) {
      console.error('Submission error:', error);
      setErrors(['Failed to submit the form. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="form-container">
        <div className="form-header">
          <h1>Photography Contest Registration</h1>
          <p>Fill in your details to participate in the contest</p>
        </div>

        <form onSubmit={handleSubmit} className="photography-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nameBengali">Name (Bengali)</label>
              <input
                type="text"
                id="nameBengali"
                name="nameBengali"
                value={formData.nameBengali}
                onChange={handleInputChange}
                required
                placeholder="আপনার নাম"
              />
            </div>

            <div className="form-group">
              <label htmlFor="nameEnglish">Name (English)</label>
              <input
                type="text"
                id="nameEnglish"
                name="nameEnglish"
                value={formData.nameEnglish}
                onChange={handleInputChange}
                required
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category</option>
                <option value="mobile">Mobile Photography</option>
                <option value="dslr">DSLR Photography</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="your.email@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="class">Class</label>
              <input
                type="text"
                id="class"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                required
                placeholder="Your class"
              />
            </div>

            <div className="form-group">
              <label htmlFor="institution">Institution</label>
              <input
                type="text"
                id="institution"
                name="institution"
                value={formData.institution}
                onChange={handleInputChange}
                required
                placeholder="Your institution"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                placeholder="+880 1XXX-XXXXXX"
              />
            </div>

            <div className="form-group">
              <label htmlFor="whatsappNumber">WhatsApp Number</label>
              <input
                type="tel"
                id="whatsappNumber"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleInputChange}
                required
                placeholder="+880 1XXX-XXXXXX"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Upload Images (Maximum 3 images, each up to 5MB)</label>

            {errors.length > 0 && (
              <div className="error-messages">
                {errors.map((error, index) => (
                  <p key={index} className="error-message">{error}</p>
                ))}
              </div>
            )}

            <div
              className={`drop-zone ${isDragging ? 'dragging' : ''} ${images.length >= 3 ? 'disabled' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={images.length < 3 ? handleBrowseClick : undefined}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                multiple
                disabled={images.length >= 3}
                style={{ display: 'none' }}
              />

              <div className="drop-zone-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="drop-zone-title">
                  {images.length >= 3 ? 'Maximum images uploaded' : 'Drag & drop images here'}
                </p>
                {images.length < 3 && (
                  <p className="drop-zone-subtitle">or click to browse</p>
                )}
                <p className="drop-zone-info">{images.length}/3 images uploaded</p>
              </div>
            </div>

            {images.length > 0 && (
              <div className="image-preview-grid">
                {images.map((file, index) => (
                  <div key={index} className="image-preview-item">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => removeImage(index)}
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                    <div className="image-info">
                      <p className="image-name">{file.name}</p>
                      <p className="image-size">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </button>
        </form>
      </div>

      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}
    </>
  );
};

export default PhotographyForm;
