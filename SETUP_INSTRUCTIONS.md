# Setup Instructions for Photography Contest Form

## 1. Cloudinary Setup

Before the form can upload images, you need to create an unsigned upload preset in Cloudinary:

1. Go to your Cloudinary Dashboard: https://console.cloudinary.com/
2. Navigate to **Settings** → **Upload**
3. Scroll down to **Upload presets**
4. Click **Add upload preset**
5. Set the following:
   - **Upload preset name**: `photography_contest`
   - **Signing Mode**: Select **Unsigned**
   - **Folder**: (optional) You can specify a folder like `photography-contest`
6. Click **Save**

## 2. Google Sheets Setup

### Step 1: Create Your Google Sheet

1. Go to Google Sheets: https://sheets.google.com
2. Create a new spreadsheet
3. Name it (e.g., "Photography Contest Registrations")
4. In the first row, add these headers exactly as shown:

```
Name Bengali | Name English | Category | Email | Phone Number | Whatsapp Number | Institution | Class | Image 1 | Image 2 | Image 3 | Timestamp
```

### Step 2: Add Google Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code in the editor
3. Copy and paste the code from `google-apps-script.js` file
4. Click **Save** (💾 icon)
5. Name your project (e.g., "Photography Form Handler")

### Step 3: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Select **Web app**
4. Configure the deployment:
   - **Description**: "Photography Contest Form"
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone**
5. Click **Deploy**
6. **IMPORTANT**: You'll see a warning. Click **Authorize access**
7. Select your Google account
8. Click **Advanced** → **Go to [Project Name] (unsafe)**
9. Click **Allow**
10. **Copy the Web App URL** - it will look like:
    ```
    https://script.google.com/macros/s/AKfycby.../exec
    ```

### Step 4: Update Your Form Code

1. Open `src/components/PhotographyForm.tsx`
2. Find this line (around line 35):
   ```typescript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_URL_HERE';
   ```
3. Replace it with your deployment URL:
   ```typescript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```

## 3. Testing

1. Fill out the form with test data
2. Upload 1-3 test images
3. Click Submit
4. Check your Google Sheet - you should see a new row with:
   - All form data
   - Cloudinary image URLs
   - Timestamp

## 4. Troubleshooting

### Images not uploading to Cloudinary
- Verify the upload preset name is exactly `photography_contest`
- Make sure the preset is set to **Unsigned** mode
- Check browser console for errors

### Data not appearing in Google Sheets
- Verify the Apps Script deployment URL is correct
- Check that the script is deployed as "Anyone" can access
- Check Google Apps Script logs: In Apps Script editor, click **Executions** to see any errors

### CORS Errors
- This is expected with Google Apps Script (mode: 'no-cors')
- The data will still be submitted successfully even if you see CORS errors in console

## Environment Variables

Your `.env` file should contain:
```
VITE_CLOUDINARY_CLOUD_NAME=dxl1tjcim
VITE_CLOUDINARY_API_KEY=423115555551296
VITE_CLOUDINARY_API_SECRET=ADcXdLDxSvWDOJNSe2nROGidbiY
VITE_CLOUDINARY_UPLOAD_PRESET=photography_contest
```

Note: The API key and secret are not used for unsigned uploads, but are included for future signed upload capabilities.
