import React, { useState, useCallback, useRef  } from 'react';
import Cropper from 'react-easy-crop';
import { Button, Slider, Typography } from '@mui/material';
import auth from '../authService';
import '.././App.css';
import texts from "../texts/tutorProfile.json";

const Profile = ({ tutorId, onImageUpload, role }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const onSelectFile = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setImageSrc(URL.createObjectURL(file));
            setSelectedFile(file);
        }
    };

    const getCroppedImage = async () => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Use croppedAreaPixels to draw the cropped part
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx.drawImage(
            image,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                resolve(blob); // Return the cropped blob
            }, 'image/jpeg');
        });
    };

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const handleSave = async () => {
        const croppedImage = await getCroppedImage();

        const formData = new FormData();
        if(role === "tutor") {
            formData.append('profilePic', croppedImage, `tutor${tutorId}.jpg`);
        }
        if(role === "student") {
            formData.append('profilePic', croppedImage, `student${tutorId}.jpg`);
        }

        try {
            const response = await auth.post(`/api/uploadProfilePic/${role}/${tutorId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('Profile picture uploaded successfully:', response.data);

            // Reset the imageSrc to close the cropping interface
            setImageSrc(null);
            setSelectedFile(null);
            fileInputRef.current.value = '';

            // Call the onImageUpload callback to update the parent component
            onImageUpload();

        } catch (error) {
            console.error('Error uploading profile picture:', error);
        }
    };

    const handleCancel = () => {
        // Reset the imageSrc and selectedFile to cancel the cropping process
        setImageSrc(null);
        setSelectedFile(null);
        fileInputRef.current.value = '';
    };

    return (
        <div>
            <input type="file" accept="image/*" onChange={onSelectFile} className="photo-input" id='image-upload' ref={fileInputRef} hidden />
            {imageSrc && (
                <div className="picture-input-container">
                    <div style={{ width: '80%', height: 400 }} className="select-picture-container">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>
                    <div>
                        <Typography>{texts.camerasLabel.typographyLabel}</Typography>
                        <Slider
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e, zoom) => setZoom(zoom)}
                            sx={{
                              color: '#FFFEF6', 
                              '& .MuiSlider-thumb': {
                                  backgroundColor: '#FFFEF6', 
                              },
                              '& .MuiSlider-track': {
                                  backgroundColor: '#FFFEF6',
                              },
                              '& .MuiSlider-rail': {
                                  backgroundColor: 'grey.300', 
                              },
                          }}
                        />
                    </div>
                    <Button onClick={handleSave} 
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white', 
                      '&:hover': {
                          backgroundColor: 'primary.dark', 
                      }
                  }}
                    className="save-picture-btn">{texts.camerasLabel.saveButton}</Button>
                    <Button onClick={handleCancel} 
                    sx={{
                      backgroundColor: 'red',
                      color: 'white', 
                      '&:hover': {
                          backgroundColor: 'darkred', 
                      },
                      marginLeft: '10px'
                  }}
                    className="cancel-picture-btn">
                        {texts.camerasLabel.cancelButton}
                    </Button>
                </div>
            )}
        </div>
    );
}

export default Profile;
