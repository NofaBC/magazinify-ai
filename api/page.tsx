# 1) List the app folder contents
ls -R src/app

# 2) List all files in git HEAD under src/app
git ls-tree -r HEAD --name-only | grep "^src/app/"

# 3) Show top 20 lines of latest Vercel build log
# Copy that from Vercel UI → Deployments → Logs
