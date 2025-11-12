# VSCode Extension Publishing Guide

## Prerequisites Checklist

Before publishing, ensure:

- [x] Extension works locally (tested with F5)
- [x] Icon present (128x128 PNG)
- [x] LICENSE file exists
- [x] README.md is complete
- [ ] Publisher account created
- [ ] Personal Access Token (PAT) obtained
- [ ] Publisher name in package.json

## Step 1: Create Publisher Account

### 1.1 Go to Visual Studio Marketplace
Visit: https://marketplace.visualstudio.com/manage

### 1.2 Sign in with Microsoft Account
- Use your Microsoft/GitHub account
- If you don't have one, create at: https://account.microsoft.com

### 1.3 Create Publisher
- Click "Create Publisher"
- **Publisher ID:** Choose a unique ID (e.g., `frkngnc`, `commitor-dev`)
  - Must be lowercase, alphanumeric, hyphens allowed
  - This will be in your extension URL: `marketplace.visualstudio.com/items?itemName=YOUR_ID.commitor-vscode`
- **Display Name:** Your name or company (e.g., "Furkan Genç")
- **Description:** Brief bio

**Save your Publisher ID!** You'll need it.

## Step 2: Create Personal Access Token (PAT)

### 2.1 Go to Azure DevOps
Visit: https://dev.azure.com

### 2.2 Create PAT
1. Click your profile (top right) → "Personal access tokens"
2. Click "+ New Token"
3. **Name:** "VSCode Marketplace Publishing"
4. **Organization:** All accessible organizations
5. **Expiration:** Custom (1 year recommended)
6. **Scopes:** Click "Show all scopes"
   - Scroll to **Marketplace**
   - Check ✅ **Marketplace > Manage**
7. Click "Create"
8. **COPY THE TOKEN NOW** - You can't see it again!

**Save your PAT securely!**

## Step 3: Login with vsce

In your terminal:

```bash
cd /Users/furkangenc/Desktop/Commitor/packages/vscode

# Login to marketplace
npx @vscode/vsce login YOUR_PUBLISHER_ID

# Paste your PAT when prompted
```

## Step 4: Update package.json

Update the `publisher` field in `package.json`:

```json
{
  "publisher": "YOUR_PUBLISHER_ID",
  "name": "commitor-vscode",
  "displayName": "Commitor"
}
```

## Step 5: Pre-Publish Checklist

Verify everything is ready:

```bash
# Check for issues
npx @vscode/vsce ls

# Validate package
npx @vscode/vsce package --no-yarn
```

Fix any warnings or errors.

## Step 6: Publish!

### First Time Publish

```bash
cd /Users/furkangenc/Desktop/Commitor/packages/vscode

# Build
npm run build

# Publish
npx @vscode/vsce publish
```

### What Happens:
1. Creates VSIX package
2. Uploads to marketplace
3. Shows extension URL

**Wait 5-10 minutes** for extension to appear in marketplace!

## Step 7: Verify Publication

1. Go to: https://marketplace.visualstudio.com/manage/publishers/YOUR_PUBLISHER_ID
2. Click on your extension
3. Check it's published

**Public URL:**
```
https://marketplace.visualstudio.com/items?itemName=YOUR_PUBLISHER_ID.commitor-vscode
```

## Step 8: Install from Marketplace

Test installation:

1. Open VSCode
2. Extensions → Search "Commitor"
3. Install
4. Verify it works!

---

## Future Updates

To publish new versions:

### 1. Update Version

In `package.json`:
```json
{
  "version": "0.1.1"  // Increment version
}
```

### 2. Update CHANGELOG.md

Add changes in `CHANGELOG.md`

### 3. Publish Update

```bash
# Patch version (0.1.0 → 0.1.1)
npx @vscode/vsce publish patch

# Minor version (0.1.0 → 0.2.0)
npx @vscode/vsce publish minor

# Major version (0.1.0 → 1.0.0)
npx @vscode/vsce publish major
```

---

## Troubleshooting

### Error: "Publisher not found"

**Solution:** Create publisher at https://marketplace.visualstudio.com/manage

### Error: "PAT invalid"

**Solution:**
1. Ensure PAT has **Marketplace > Manage** scope
2. Ensure PAT not expired
3. Login again: `npx @vscode/vsce login YOUR_PUBLISHER_ID`

### Error: "Extension already exists"

**Solution:** You already published! Use:
```bash
npx @vscode/vsce publish patch
```

### Error: "Missing LICENSE"

**Solution:** Ensure `LICENSE` file exists in `packages/vscode/`

---

## Quick Command Reference

```bash
# Login
npx @vscode/vsce login PUBLISHER_ID

# Package (create VSIX locally)
npx @vscode/vsce package

# Publish
npx @vscode/vsce publish

# Update versions
npx @vscode/vsce publish patch   # 0.1.0 → 0.1.1
npx @vscode/vsce publish minor   # 0.1.0 → 0.2.0
npx @vscode/vsce publish major   # 0.1.0 → 1.0.0

# Unpublish (careful!)
npx @vscode/vsce unpublish PUBLISHER_ID.commitor-vscode
```

---

## Next Steps

After publishing:

1. Share on social media
2. Add badge to README:
   ```markdown
   [![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/PUBLISHER_ID.commitor-vscode)](https://marketplace.visualstudio.com/items?itemName=PUBLISHER_ID.commitor-vscode)
   ```
3. Monitor reviews and issues
4. Plan next version features

---

## Resources

- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Marketplace Portal](https://marketplace.visualstudio.com/manage)
- [Azure DevOps PAT](https://dev.azure.com)
