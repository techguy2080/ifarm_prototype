# Vercel Automatic Deployment Setup

## Setup Automatic Deployments (GitHub to Vercel)

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Sign in with your GitHub account (techguy2080)

### Step 2: Import Your GitHub Repository
1. Click "Add New..." button (top right)
2. Select "Project"
3. You'll see "Import Git Repository"
4. Click "Import" next to your repository: ifarm_prototype
   - If you don't see it, click "Adjust GitHub App Permissions"
   - Grant Vercel access to your repository

### Step 3: Configure Project Settings
Vercel will auto-detect Next.js. Verify these settings:

```
Framework Preset: Next.js (auto-detected)
Root Directory: ./ (leave as default)
Build Command: npm run build (default)
Output Directory: .next (default)
Install Command: npm install (default)
Node Version: 18.x or higher
```

### Step 4: Environment Variables (Optional for now)
Skip this - your prototype uses mock data (localStorage)

### Step 5: Deploy!
1. Click "Deploy" button
2. Wait 2-3 minutes for the build
3. You'll get a live URL: https://ifarm-prototype-xxxxx.vercel.app

## What Happens After Setup?

Once connected, Vercel automatically:
- Detects every git push to your main branch
- Builds your application
- Deploys to production
- Sends you deployment notifications
- Provides preview URLs for branches

## How Automatic Deployment Works

```bash
# You push code to GitHub
git add .
git commit -m "feat: new feature"
git push origin main

# Vercel automatically (via webhook):
# 1. Detects the push (GitHub webhook)
# 2. Pulls latest code
# 3. Installs dependencies
# 4. Builds the app
# 5. Deploys to production
# 6. Updates your live URL
# 7. Sends you email/notification
```

## About Webhooks

You don't need to manually create webhooks!

When you import your repository in Vercel:
- Vercel automatically creates a webhook in your GitHub repository
- You can see it at: https://github.com/techguy2080/ifarm_prototype/settings/hooks
- The webhook URL will be: https://api.vercel.com/v1/integrations/deploy/...

### To Verify Webhook (After Import):
1. Go to: https://github.com/techguy2080/ifarm_prototype
2. Click Settings then Webhooks
3. You should see a Vercel webhook with a green checkmark

## Current Setup Status

[DONE] Code pushed to GitHub
[DONE] Vercel configuration files ready (vercel.json)
[DONE] Next.js project configured
[TODO] GitHub to Vercel connection (YOU NEED TO DO THIS)

## Quick Access Links

- Vercel Dashboard: https://vercel.com/dashboard
- Your GitHub Repo: https://github.com/techguy2080/ifarm_prototype
- Import Project: https://vercel.com/new

## Troubleshooting

### Can't see your repository?
- Click "Adjust GitHub App Permissions"
- Grant Vercel access to ifarm_prototype
- Or grant access to all repositories

### Repository shows as already imported?
- Check if it's already in your Vercel projects
- Go to: https://vercel.com/techguy2080/projects
- Look for ifarm-prototype

### Build fails?
Check these common issues:
1. Missing dependencies in package.json
2. TypeScript errors (should be ignored in next.config.ts)
3. Environment variables (not needed for prototype)

## After Successful Setup

You'll have:
- Production URL: https://ifarm-prototype.vercel.app (or similar)
- Automatic deployments on every push to main
- Preview deployments for pull requests
- Deployment history in Vercel dashboard
- Build logs for debugging
- Analytics for performance monitoring

## Test Automatic Deployment

After setup, test it:

```bash
# Make a small change
echo "# Updated" >> README.md

# Commit and push
git add README.md
git commit -m "test: verify automatic deployment"
git push origin main

# Wait 2-3 minutes
# Check Vercel dashboard - you should see a new deployment!
```

## Need Help?

If you get stuck:
1. Check Vercel deployment logs
2. Verify GitHub webhook exists
3. Ensure repository permissions are correct
4. Check Vercel system status

---

Start here: https://vercel.com/new/import

Import your ifarm_prototype repository and you're done!

