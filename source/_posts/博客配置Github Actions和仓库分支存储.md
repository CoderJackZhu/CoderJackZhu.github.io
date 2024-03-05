---
title: 博客配置Github Actions和仓库分支存储
date: 2024-03-03 02:19:37
tags: 博客配置
categories: 博客配置
keywords: Github Actions, 仓库分支存储
description: 本文介绍如何使用Github Actions自动部署博客，并且使用仓库分支存储图片等资源。
top_img: https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/除夕贺图.png
comments: true
cover: https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/除夕贺图.png
toc:
toc_number:
copyright:
copyright_author: Jack Zhu
copyright_author_href: 
copyright_url: http://jackzhu.top/
copyright_info: 
mathjax: 
katex: 
aplayer: 
highlight_shrink: 
aside: 
---

# 博客配置Github Actions和仓库分支存储

之前的博客是源文件建了一个github仓库，然后一个仓库只用作github pages，这样的话，每次写博客都要手动编译，使用`hexo g`然后`hexo d`，部署，最后使用另外一个仓库提交更改，然后commit，push到github pages仓库，这样很麻烦，所以我就想到了使用github actions自动部署博客，然后使用仓库分支存储图片等资源。（虽然不怎么写博客）
这块我参考了之前浪潮的一次技术讲座，不过那个稍微麻烦了一些，我这里就简化了一下，把之前的文件迁移到这里。

## 1.把源文件和github pages的文件分开

source文件和在github上编译好的github pages还是要区分开，这里选择的还是原来github pages的仓库，clone到本地后

随后建立静态界面的分支，同一个Bash窗口，键入

```bash
cd 你的Github用户名.github.io # 进入博客仓库文件夹
git branch html # 新建静态页面分支，存放生成的博客页面
```

## 2. main分支文件修改

首先将你的仓库文件夹清空。

注：所有清空操作建议在Git Bash窗口中进行，键入

```bash
rm -f * -r # 强制递归清空仓库文件夹
```

这样不会将.git/文件夹中的仓库记录(这里此文件夹作为隐藏文件没有显示)删除，否则后续Git无法定位，也就无法继续操作
随后将之前博客的文件夹中的所有文件复制到这个仓库文件夹中，注意不要复制.git/文件夹，因为这是仓库记录，复制后Git无法定位，也就无法继续操作；另外node_modules/文件夹也不需要复制，因为这是node.js的依赖包，不需要上传到仓库中，不然可能会报错。

## 3. 推送main分支更改

回到仓库文件夹下的Git Bash窗口，输入:

```bash
git add . # 添加所有文件
git commit -m "update branch main" # 提交更改
git push # 将修改推送到远程仓库
```

## 4. 配置GiHub Actions工作流文件

在仓库文件夹.github/下新建一个目录workflows/(注意有两层目录)，在里面新建一个hexo_build_deploy.yml文件，内容如下：

``` yaml
name: Hexo Build & Deploy

on:
# 触发事件
  push:
    # 排除分支
    branches-ignore:
      - 'html'

# 工作流
jobs:
  build:
    runs-on: ubuntu-latest

    steps:
        - name: Checkout branch main
          uses: actions/checkout@v2
          with:
            ref: main
            path: .

        # 工具安装
        - name: Use Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '20'
        - name: Install dependencies
          run: npm install

        # 构建
        - name: Build
          run: npm run build

        # 部署
        - name: Deploy
          uses: JamesIves/github-pages-deploy-action@v4.5.0
          with:
            branch: html
            folder: public
```

![20240303020755](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/20240303020755.png)

## 5.修改GitHub仓库设置
先在博客仓库Settings的Pages中将Branch设置为html
![20240303020837](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/20240303020837.png)

然后将Actions下的General中的Workflow permissons设置为Read and write permissions 
![20240303020935](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/20240303020935.png)

## 6. 推送更改

然后将更改推送到远程仓库

```bash
git add .
git commit -m "update"
git push
```

## 7. 等待部署完成

![20240303021139](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/20240303021139.png)
没有报错的话就完成了
![20240303021234](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/20240303021234.png)
https最好也打开。

## 一些其他问题

我在配置过程中碰到了一些其他问题，腾讯云配置DNS我开始弄的有点问题，就重新配的DNS Pod 。

除此之外，在配置的过程中node_modules是不需要的，我开始这里加了，后面报错，去掉就好了。

另外一个问题是我把源文件复制过去之后，最后部署完成之后网页是空白，最后发现是theme文件下的butterfly主题文件夹是空的，我把这个文件夹删了，然后重新clone了一遍butterfly主题，再部署就好了。

## 参考链接

<https://www.xdu-inspur.club/blog/site/%E6%8A%80%E6%9C%AF%E6%96%87%E6%A1%A3/get_a_blog.html#_7>