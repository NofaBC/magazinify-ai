# How to Add Advertisements to a Magazine Issue

## Product: Magazinify AI™

## Overview
Subscribers can upload advertisement images when creating a new magazine issue. Each ad takes one full page in the magazine. Ads are optional — if no ads are uploaded, all pages are filled with articles.

## Step-by-Step Instructions

### 1. Go to Create New Issue
- Log in to your Magazinify AI™ dashboard
- Click **"Create New Issue"** or navigate to **Magazines → New Issue**

### 2. Scroll to the Advertisements Section
- Below the Issue Details, you will see an **"Advertisements (optional)"** section
- This is where you add ad pages

### 3. Click "Add Advertisement"
- Click the **"+ Add Advertisement"** button
- A new ad entry form will appear

### 4. Upload the Ad Image
- Click the file input and select an image file (PNG, JPG, or any image format)
- The image should be designed at a portrait/magazine page ratio (recommended: 1000x1300px or similar)
- This image will be displayed as a full-page ad in the magazine

### 5. Add Optional Details
- **Click-through URL**: If the ad should link somewhere when clicked, enter the URL (e.g., the advertiser's website)
- **Advertiser Name**: Enter the name of the advertiser (e.g., "Smith's Auto Repair"). This is for internal reference.

### 6. Add More Ads (Optional)
- Click **"+ Add Advertisement"** again to add more ads
- Each ad takes one full page
- Basic plan: up to 9 ad pages (12 total pages minus cover, table of contents, and back cover)
- Pro plan: up to 21 ad pages (24 total pages minus cover, table of contents, and back cover)
- The system automatically adjusts the number of articles to make room for ads

### 7. Remove an Ad
- Click the **X** button in the top-right corner of any ad entry to remove it

### 8. Generate the Issue
- Click **"Generate Magazine Issue"**
- If you uploaded ads, they will be uploaded first, then the magazine will be generated
- Ads are placed after the article content in the magazine

## Important Notes

- **Ads are optional.** If no ads are uploaded, all pages are filled with AI-generated articles.
- **Ad images are stored in Firebase Storage** under the subscriber's tenant folder.
- **Each ad takes exactly one full page.** The image is displayed full-bleed with optional click-through linking.
- **The more ads you add, the fewer articles are generated.** The system calculates how many article pages remain and generates content accordingly.
- **Ad images should be high quality.** Low-resolution images will look poor when displayed at full page size.

## Recommended Ad Image Specs
- Format: PNG or JPG
- Dimensions: 1000×1300px (portrait) or similar magazine-page aspect ratio
- File size: Under 5MB
- Design: Clean, professional, with readable text at magazine-page scale

## FAQ

**Q: Can I add ads for my own business?**
A: Yes. You can upload your own business ads or ads for your clients/advertisers.

**Q: Do I have to add ads?**
A: No. Ads are completely optional. Without ads, every page is filled with articles.

**Q: Can I add ads after the issue is generated?**
A: No. Ads must be uploaded before generating the issue. To change ads, delete the existing issue from Firestore and regenerate.

**Q: Where do ads appear in the magazine?**
A: Ads are placed after the article spreads, before the back cover.

**Q: Is there a limit to how many ads I can add?**
A: Yes. Basic plan allows up to 9 ads. Pro plan allows up to 21 ads. But adding too many ads leaves little room for articles.
