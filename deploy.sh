#!/bin/bash

echo "开始部署到 GitHub Pages..."

if [ ! -d "out" ]; then
  echo "正在构建项目..."
  npm run build
fi

cd out

git init
git add .
git commit -m "Deploy $(date +%Y-%m-%d_%H:%M:%S)"

echo "请输入你的 GitHub 用户名："
read username

echo "请输入仓库名称（默认：$username.github.io）："
read repo_name
repo_name=${repo_name:-$username.github.io}

git remote add origin "https://github.com/$username/$repo_name.git"
git branch -M main
git push -f origin main

echo "部署完成！"
echo "访问地址：https://$username.github.io/$repo_name"
