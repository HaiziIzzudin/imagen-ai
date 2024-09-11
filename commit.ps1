npm run build
git add .
git commit -m "$(Get-Date -Format "yyyy-MM-dd HH:mm:ss")"
git push
ssh haizi@139.162.55.58 "cd imagen-ai/ && git pull"



# ssh haizi@139.162.55.58 "rm -rf guzlacpn.default-release-1 && ls && cd nolimit-genai-img/ && git pull"
# ssh haizi@139.162.55.58 "rm -rf guzlacpn.default-release-1 && ls" 
# wsl -e rsync -avz -e ssh /mnt/c/Users/haizi/AppData/Roaming/Mozilla/Firefox/Profiles/guzlacpn.default-release-1 haizi@139.162.55.58:/home/haizi
