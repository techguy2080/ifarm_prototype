# GitHub to Vercel Webhook Setup Guide

## Current Status
Your code is successfully pushed to GitHub at:
- Repository: https://github.com/techguy2080/ifarm_prototype
- Latest commit: `8b705ec` - "fix: Add missing mock data exports for Vercel build"

However, Vercel is NOT automatically detecting changes because the webhook connection is not established.

---

## Option 1: Connect via Vercel Dashboard (RECOMMENDED - Automatic Webhook)

This is the easiest method. Vercel automatically creates the webhook for you.

### Step 1: Go to Vercel Dashboard
Visit: https://vercel.com/dashboard

### Step 2: Import Your Repository
1. Click **"Add New..."** button (top right corner)
2. Select **"Project"**
3. You'll see **"Import Git Repository"** section
4. Look for your repository: `techguy2080/ifarm_prototype`
   
   **If you DON'T see it:**
   - Click **"Adjust GitHub App Permissions"**
   - Click **"Configure GitHub App"**
   - Grant Vercel access to `ifarm_prototype` repository
   - Return to Vercel and refresh

5. Click **"Import"** next to your repository

### Step 3: Configure Project Settings
Vercel will auto-detect Next.js. Verify these settings:

```
Project Name: ifarm-prototype
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Node.js Version: 18.x or 20.x
```

### Step 4: Skip Environment Variables (for now)
Click **"Deploy"** - your app uses localStorage, no env vars needed yet.

### Step 5: Wait for Deployment
- First build takes 2-4 minutes
- You'll get a live URL: `https://ifarm-prototype-xxxxx.vercel.app`

### Step 6: Verify Webhook was Created
After successful import, verify the webhook exists:

1. Go to: https://github.com/techguy2080/ifarm_prototype/settings/hooks
2. You should see a webhook with:
   - Payload URL: `https://api.vercel.com/v1/integrations/deploy/...`
   - Content type: `application/json`
   - Events: `Just the push event`
   - Active: ✓ (green checkmark)

**That's it!** Every `git push` will now trigger automatic deployments.

---

## Option 2: Manual Webhook Setup (If Option 1 Doesn't Work)

Only use this if the dashboard import fails.

### Step 1: Get Your Vercel Deploy Hook URL

#### If you already have a Vercel project:
1. Go to: https://vercel.com/dashboard
2. Select your `ifarm-prototype` project
3. Go to **Settings** → **Git**
4. Look for **Deploy Hooks** section
5. Click **"Create Hook"**
6. Name: `GitHub Push Hook`
7. Branch: `main`
8. Click **"Create Hook"**
9. Copy the webhook URL (looks like: `https://api.vercel.com/v1/integrations/deploy/prj_xxxxx/xxxxxx`)

#### If you DON'T have a Vercel project yet:
You need to create one first using Option 1 above, then come back here.

### Step 2: Add Webhook to GitHub

1. Go to: https://github.com/techguy2080/ifarm_prototype/settings/hooks
2. Click **"Add webhook"**
3. Fill in the form:
   - **Payload URL**: Paste the Vercel Deploy Hook URL from Step 1
   - **Content type**: `application/json`
   - **Secret**: Leave empty (Vercel handles auth via the URL)
   - **Which events**: Select "Just the push event"
   - **Active**: Check this box
4. Click **"Add webhook"**

### Step 3: Test the Webhook

Make a test commit:

```bash
cd /Users/macbookair/Desktop/ifarm-prototype
echo "# Test webhook" >> TEST_WEBHOOK.txt
git add TEST_WEBHOOK.txt
git commit -m "test: Trigger webhook"
git push origin main
```

Then check:
1. GitHub webhook page: https://github.com/techguy2080/ifarm_prototype/settings/hooks
   - Click on your webhook
   - Check "Recent Deliveries" tab
   - Should see a green checkmark with 200 response
2. Vercel dashboard: https://vercel.com/dashboard
   - Should see a new deployment starting

---

## Option 3: Deploy via Vercel CLI (Manual - Not Automatic)

This is a manual deployment method, NOT automatic on push.

```bash
cd /Users/macbookair/Desktop/ifarm-prototype

# Login to Vercel
npx vercel login

# Deploy to production
npx vercel --prod
```

**Note:** This doesn't set up automatic deployments. Use Option 1 or 2 for that.

---

## Troubleshooting

### Issue: "Can't see my repository in Vercel"
**Solution:**
1. Go to: https://github.com/settings/installations
2. Find "Vercel" in the list
3. Click "Configure"
4. Under "Repository access", select:
   - Either "All repositories" 
   - Or "Only select repositories" and add `ifarm_prototype`
5. Click "Save"
6. Return to Vercel and refresh

### Issue: "Webhook shows red X or failed delivery"
**Solution:**
1. Check the webhook URL is correct (should be from Vercel)
2. Verify the webhook is set to "application/json"
3. Try deleting and recreating the webhook
4. Check Vercel project still exists

### Issue: "Build succeeds but changes don't show"
**Solution:**
1. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check you're viewing the correct deployment URL
3. Verify the deployment actually deployed (check Vercel dashboard)
4. Check if Vercel is using the correct branch (should be `main`)

### Issue: "Build fails with module errors"
**Solution:**
- Check the Vercel deployment logs
- The recent fix should have resolved "Export doesn't exist" errors
- If still failing, share the error logs

### Issue: "Already have a Vercel project but no webhook"
**Solution:**
1. Go to your Vercel project settings
2. Click **Git** section
3. Click **"Connect Git Repository"**
4. Select your GitHub repo
5. Vercel will create the webhook automatically

---

## Verify Everything is Working

### Check GitHub:
```bash
# Make a test change
cd /Users/macbookair/Desktop/ifarm-prototype
echo "Test $(date)" >> README.md
git add README.md
git commit -m "test: Verify webhook trigger"
git push origin main
```

### Then Check:
1. **GitHub webhook**: https://github.com/techguy2080/ifarm_prototype/settings/hooks
   - Should show recent delivery with 200 status
2. **Vercel dashboard**: https://vercel.com/dashboard
   - Should show new deployment in progress
3. **Wait 2-3 minutes** for build to complete
4. **Visit your Vercel URL** and verify changes appear

---

## Quick Reference Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Import New Project**: https://vercel.com/new
- **Your GitHub Repo**: https://github.com/techguy2080/ifarm_prototype
- **GitHub Webhooks**: https://github.com/techguy2080/ifarm_prototype/settings/hooks
- **GitHub Vercel App Settings**: https://github.com/settings/installations

---

## What You Need to Do RIGHT NOW

**Start with Option 1** - it's the simplest and most reliable:

1. Visit: https://vercel.com/new
2. Click "Import" next to `techguy2080/ifarm_prototype`
3. Click "Deploy"
4. Wait for deployment
5. Done! Webhook is automatically configured.

If that doesn't work or you can't see your repository, follow the "Can't see my repository" troubleshooting steps above.

---

## After Setup

Once connected, every time you run:
```bash
git push origin main
```

Vercel will automatically:
1. Receive webhook notification from GitHub
2. Clone your latest code
3. Run `npm install`
4. Run `npm run build`
5. Deploy to production
6. Update your live URL
7. Send you a notification

**No manual intervention needed!**








