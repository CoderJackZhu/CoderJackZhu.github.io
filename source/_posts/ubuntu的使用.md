---
title: Ubuntu的基本使用
date: 2022-11-01 23:17:37
tags: Ubuntu
categories: Ubuntu
keywords: 环境、命令
description:  一点小记录
top_img: https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/nilu1.jpg
comments: true
cover: https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/nilu1.jpg
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

实验室的服务器到了，今天给组里的同学们分享了一下Ubuntu的基本使用，匆忙写了一点相关的东西，顺便发上来，虽然也挺基础的，但反正博客也没多少东西，就记录一下好了。

# 文件组织结构

`/`为根目录，为系统最基本的目录

`/home`下有用户名的文件夹，该文件夹就是`~`为主目录，为日常使用的目录

命令在终端中输入，需要注意当前所在的文件夹

# 常用命令

创建文件夹

```
mkdir xx
```

进入文件夹

```
cd xxx
```

可以使用相对路劲和绝对路径

使用相对目录回到上一级目录

```
cd ..
```

进入根目录

```
cd /
```

根目录下的文件非常重要，不要轻易动。

显示当前文件夹下有哪些文件和文件夹

```
ls
```

后面可以接参数

如果是接-a则是查看隐藏文件

```
ls -a
```

如果后接-l则是查看详细信息，包括权限

vim的使用

vim是一个非常经典的文件编辑工具

```
vim hello.py
```

即可进入编辑

进入模式之后可以点击键盘的`i`或者`a`插入，即可输入，方向键可以控制，详细的命令很多，可以自行查询

编辑完成之后，需要点击`esc`退出编辑模式

随后点击`shift + :`，就是输入:，然后输入w表示保存，随后输入q表示退出

即输入`:wq`完成保存退出，后面有时候需要加上`!`表示强制

# 权限

root是最高权限，在此状态下不要轻易动一些东西，危险

```
sudo -i
```

进入root模式

或者

```
sudo su
```



```
exit
```

退出root模式

发现文件上有锁或者x说明当前是不能使用的，需要授权

权限包括三个部分，用户user、组group、其他人other

权限内容也包括方面，读r、写w、执行x，对应的编码是4、2、1

如向日葵远程传文件，无法执行，常用

```
sudo chmod 777 xxx
```

xxx为文件名，包括扩展名

给文件夹和文件夹下的所有都授权

```
sudo chmod -R 777 xxx
```

常用*

如

```
sudo chmod 777 *
```

*一般是指全部，这里就是指当前文件夹下的所有文件（不包含下一级目录）

很多命令执行没有权限的时候都需要前面加`sudo`

删除

```
sudo rm xx
```

有时候后面会跟-rf，表示不询问，把子目录也都删除，**慎用，非常危险**

# 日常使用文件

下载的`.deb`文件可以直接点击安装，或者使用

```
sudo dpkg -i xxx
```

也可以安装

`.sh`文件可以直接输入`./xxx.sh`执行，或者`sh xxx.sh`，没有权限的时候先授权

常用命令，查看有哪些包可以升级

```
sudo apt update
```

随后执行

```
sudo apt upgrade
```

将这些包升级，这是经常需要做的

apt为一种包管理的工具，有很多时候可以直接

```
sudo apt install xx
```

直接下载安装

snap是ubuntu近些年大力推广的一种包管理的工具

# anaconda的基本使用

创建虚拟环境可以使用

```
conda create -n <name> python=3.x
```

这种方式，随后可以根据`requirements.txt`的信息执行

```
pip install -r requirements.txt
```

安装所需的包

也可以通过

```
conda env create -f environment.yaml
```

从yaml文件中创建环境并安装包。

在linux下使用

```
source activate <name>
```

在windows下执行

```
conda activate <name>
```

激活指定的虚拟环境

使用以下命令可以删除环境

```
conda remove -n <name> --all
```

# ssh

这是一种非常方便的远程控制的方法，广泛使用

```
ssh ps@10.120.16.12
```

输入密码即可远程命令行控制，ps为用户名，后面的为当前局域网下的ip地址，目前在有线校园网的情况下可以直接这样连接

pycharm（专业版）、vscode等软件都可以直接使用远程ssh的解释器，本地写代码，然后远程直接跑。
