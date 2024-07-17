import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button, Slider, Typography } from '@mui/material';
import axios from 'axios';

const Profile = (props) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const {tutorId} = props;

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
      }, []);

      const onSelectFile = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setImageSrc(URL.createObjectURL(file));
            setSelectedFile(file); // Store the selected file for later use
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
        formData.append('profilePic', croppedImage, `tutor${tutorId}.jpg`);
    
        try {
            const response = await axios.post('/api/uploadProfilePic', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('Profile picture uploaded successfully:', response.data);
            // Optionally, you can notify the user of successful upload
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            // Handle error scenario
        }
    };
    
    
    
    
      return (
    <div>
      <input type="file" accept="image/*" onChange={onSelectFile} />
      {imageSrc && (
        <div>
          <div style={{ position: 'relative', width: '100%', height: 400 }}>
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
            <Typography>Zoom</Typography>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e, zoom) => setZoom(zoom)}
            />
          </div>
          <Button onClick={handleSave}>Save</Button>
        </div>
      )}
    </div>
  );
}

export default Profile;