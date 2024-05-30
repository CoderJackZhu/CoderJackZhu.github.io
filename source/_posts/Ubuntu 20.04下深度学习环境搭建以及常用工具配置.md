---
title: Ubuntu 20.04下Pytorch深度学习环境搭建以及常用工具配置
date: 2022-04-10 00:08:37
tags: 深度学习
categories: 深度学习
keywords: 环境 pytorch
description:  一点小记录
top_img: https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/PicGo/202205102119630.jpg
comments: true
cover: https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/PicGo/202205102119630.jpg
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
# Ubuntu 20.04下Pytorch深度学习环境搭建以及常用工具配置

作者：CoderJackZhu

从事计算机相关行业的在今后学习工作过程中总会接触到Linux系统，而且在很多情况下，Windows下可能会出现一些奇奇怪怪的bug，这些问题部分是系统的问题导致的，比如常见的路径中不能带中文。深度学习环境有时候为了更好的管理机器，取得更好的效率也常常采用Linux系统，这里选择Ubuntu是对于个人的萌新而言，应该选择尽量大众些的系统，出问题也容易找到解决办法，比如由于各种误操作，linux系统我至少已经重装过不下二十次了，为了更好的学习相关知识，这样一个系统的搭建也是需要的，这里写出这个博客为了方便使用，也让我之后重装系统的时候不用再找好几个博客了。

## “双系统”中Ubuntu安装

这里的所说的双系统并不是真正的单个硬盘上多个挂载点的双系统，而是把第二个系统装在移动硬盘里面，这样正常开机默认还是Windows系统，需要选择系统就在进入系统时长按`F11`（不同品牌电脑不同），选择相应的系统就可以进入了，这样的安装相比一个硬盘上多个挂载点简易不少，配置难度低，而且不易出问题，不然一不小心两个系统都不能用了，这样Linux出了问题只需要直接覆盖重装就可以了，下面是具体步骤：

### 准备需要的工具

这里软件方面需要准备的是，从官方网站上下载Ubuntu的镜像，以及刻录软件。刻录软件使用UltraIso或者balentEtcher都是可以的，balentEtcher相对操作更简易些。

硬件需要准备的是一个U盘用于制作启动盘，尽量大于等于16G，一个移动硬盘用于安装系统，尽量大于128G，毕竟实际使用过程中数据集也比较大，还是需要给后续留足空间。

### 制作启动盘

安装好Format后选择文件为之前下的系统镜像，选择硬件为U盘，然后点击Flash就可以了，等几分钟安装校验完就可以了。

### 安装

然后重启并选择使用刚才的U盘启动，就可以进入安装Ubuntu的界面了，正常使用的话选择中文汉语，正常安装，勾选安装第三方软件。这个时候可以插上移动硬盘了，然后输入自己的用户名密码什么的，之后就进入选择安装位置了，这里点击清理磁盘安装就可以了，不然挂载点就很不太好理解，然后下一步点击你插入的那个硬盘，**这里注意别选错**，根据你的硬盘大小就能判断出了，选错其他盘的话可能你的数据就凉了，然后下一步。然后选择地图上的位置为shanghai就可以了，之后就进入安装了，等一会安装完然后点击重新启动，然后根据提示拔掉U盘，然后开机的时候选择那个硬盘启动，这个时候硬盘的名字就已经是Ubuntu了，然后两次回车就可以进入系统了，到这里，系统的安装就算完成了。

## 深度学习Pytorch环境配置

正常使用深度学习环境跑代码，GPU是必不可少，这里只演示GPU版本的pytorch的安装，所需要的工具为Anaconda、CUDA、cuDNN、Pytorch。Anaconda可以用来管理不同版本的环境，CUDA和cuDNN是使用GPU计算所需要的工具这里需要注意相互之间的匹配关系，首先去[pytorch官网](https://pytorch.org/)可以看到

![6](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/PicGo/202205102136735.png)

因此这里选择CUDA11.3，然后根据CUDA的版本，选择cuDNN的版本，具体在下载cuDNN的时候可以看到。

### 安装驱动

安装NVIDIA驱动有多种方式，比如可以去官网下载最新版，这里介绍最简单的一种，首先打开软件与更新，然后点附加驱动这里，系统默认用的是开源的的驱动，这里选最上面的几个版本高的就可以，这里安装的cuda11.3驱动至少要470以上，然后点击应用更改等一会就可以了。

![1](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/PicGo/202205102136053.png)

安装完成之后在命令行输入`nvidia-smi`就可以看到下图GPU情况，这就说明驱动基本没问题了。

![4](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/PicGo/202205102136894.png)

### 下载安装cuda

这里找[官方网站](https://developer.nvidia.com/cuda-downloads)

![2](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/PicGo/202205102136125.png)

可以看到这里默认是11.6版本的，这里点击下方中的`Archive of Previous CUDA Releases`并选择对于的11.3版本，都是11.3的情况下选最后一位高的，之后进入以下界面，选择对应版本，然后先后输入下方的两行，第一行输入命令行，就开始下载了，下载完之后在对应的目录打开终端命令行，然后输入第二行，就开始安装了。

![3](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/PicGo/202205102137818.png)

安装过程中看到勾选多个项目的时候，把第一项的X勾选框点下回车取消掉，由于之前已经安装了驱动，所有这里不需要安装里面附带的驱动，然后切换Install并点击回车，等待就可以安装好了。

然后添加路径，修改`.bashrc`文件：

```
sudo gedit ~/.bashrc
```

#在末尾添加：
```
export PATH=/usr/local/cuda/bin${PATH:+:${PATH}} 
export LD_LIBRARY_PATH=/usr/local/cuda/lib64${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}} 
```
更新刚才输入的内容，在命令行输入： `source ~/.bashrc`


安装成功输入`nvcc -V`

### cuDNN的安装

到[官网](https://developer.nvidia.com/cudnn)下载文件：点击如图`Download cuDNN`按钮。下载需要NVIDIA的账号，没有的需要先注册一个。

![5](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/PicGo/202205102137133.png)

然后进入[下载界面](https://developer.nvidia.com/rdp/cudnn-archive#a-collapse742-10)并选择Previous Archive

![7](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/PicGo/202205102137217.png)

选择CUDA11.x对于的cuDNNv8.2 选择Runtime Library版的deb文件进行下载：

![8](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/PicGo/202205102137992.png)

安装cuDNN过程与CUDA类似：
在下载的文件的文件夹里面打开终端，执行命令`sudo dpkg -i <name>`，其中`<name>`为刚才下载的deb文件名
执行命令`sudo apt install <name>`,其中`<name>`要和自己下载的cudnn版本匹配，比如这里是libcudnn8

## 安装Anaconda

Anaconda用于控制版本管理，直接在系统的python里装不太方便，库的控制也不那么直观，使用Anaconda之后会方便很多。

这里直接从[官网](https://www.anaconda.com/products/individual)下载就可以，速度也不错，下载完之后在下载的文件夹打开终端，这里重点，命令行不要输入`sudo`，直接`sh <name>` `name`为刚才下的文件名然后可以了，一路回车过完协议书，然后yes同意，然后要么回车要么yes就可以了。千万别在命令行前面加`sudo`，这样anaconda3的文件夹就安装在`root`下了，这样感觉有时候不方便；直接`sh`就可以安装在你的主目录下，装好退出命令行就可以用了。

安装过程先一路回车，然后按要求都yes就好。

安装后退出命令行，然后重新进入命令行，然后输入`conda`，若出现如下则证明安装成功，若出现command not found则重启系统，若还不行则需要添加环境变量。

![10](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/PicGo/202205102137141.png)

## 添加环境变量

输入

```
source ~/.bashrc
```

再执行conda，若好则安装结束，否则手动添加环境变量

输入命令

```
sudo vim ~/.bashrc
```

若vim未安装，先安装，可以使用`sudo apt install vim`安装（或者使用`sudo gedit ~/.bashrc`也可打开文件），然后执行上述命令，然后在文件的最后添加，这里的内容不要直接复制，根据自己的用户名来定

```
export
PATH=/home/<自己的用户名>/anaconda3/bin:$PATH
```

输入完成后点击`ESC`, 然后输入`:wq`保存退出.

然后更新环境变量:

```
source ~/.bashrc
```

输入conda,检查是否配置成功。

## 创建环境并安装PyTorch

安装后一般应用栏里是没有这个软件的，需要在命令行中输入`anaconda-navigator`等待进入就可以了，然后点左方的environment然后点下方的加号创建环境，想个环境的名字，选择需要的python版本，这里也可以使用命令来创建

```
conda create -n <环境名> python=3.8
```

等待创建完成后在命令行中输入`conda info -e`即可查看现有哪些环境

然后进入相应的环境输入下面命令，其中这里使用的环境名为`env1`

```
source activate env1
```

即可激活，若为windows下则为`conda activate env1`。

这样就进入环境了，随后输入pytorch官网上的命令：

```
conda install pytorch torchvision torchaudio cudatoolkit=11.3 -c pytorch
```

如果速度慢，则需要换源，一般默认使用清华源为以下命令：

```
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/

conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/conda-forge

conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/msys2/

conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/pytorch/

conda config --set show_channel_urls yes
```

**或者**打开主目录下的隐藏文件`.condarc`，将其内容整体更换为以下内容：

```
ssl_verify: true
show_channel_urls: true

channels:
  - http://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/win-64/
  - http://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main/win-64/

```

然后运行 `conda clean -i` 清除索引缓存。

这时候安装命令就要把最后的`-c pytorch`去掉，变成
```
conda install pytorch torchvision torchaudio cudatoolkit=11.3
```

就可以很快的下载了，也可以使用[pytorch离线安装下载](https://download.pytorch.org/whl/torch_stable.html)直接下载whl文件，然后在命令行中进入下载的文件夹，然后输入

```python
pip install torch-1.9.0+cu111-cp38-cp38-win_amd64.whl
```
这样就可以安装了，若为linux则将`win_amd64`改为`linux_x86_64`即可。

若为单次换下载换源则命令为：

```
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple/  
```

在后面加上需要安装的库名字即可。

## 验证安装成功

若全部安装完成，则新建一个python脚本hello.py，内容如下

```
import torch
import torchvision
print(torch)
print(torchvision)
print(torch.cuda.is_available())
x=torch.randn(5, 3)
print(x)
print(torch.cuda.device)
print(torch.__version__)
print(torchvision.__version__)
print(torch.version)
print(torch.version.cuda) # Corresponding CUDA version
print(torch.backends.cudnn.version()) # Corresponding cuDNN version
print(torch.cuda.get_device_name(0)) # GPU type
```

当然你如果想测试一下，也可以跑一下官方示例（非必须）

```shell
mkdir ~/CUDA_test
cd ~/CUDA_test
git clone https://github.com/nvidia/cuda-samples
cd ~/CUDA_test/cuda-samples/Samples/1_Utilities/deviceQuery
make
./deviceQuery
```


可以得到下面这个结果：

![20240531013518](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/20240531013518.png)

检查完用不到也可以把这个samples删了。

即可查看详细情况，若cuda可用这里显示true就说明安装成功。

## 常用软件

深度学习环境其他非常常用的软件一般还有VScode和Pychram，一般这两个都安装比较好。

BT下载以及磁力链下载很多时候是需要的，因此需要下载工具

下载工具可以用Free Download Manger，还是非常好用的，还有qbittorrent和Motrix作为备用下载软件，这两个软件下载后不用安装，需要用的时候打开，也非常不错。

其他比如截屏剪切板等功能用utools也挺好，不过高级功能后来收费了。

## windows下安装的差异

### 更新驱动

正常使用的话，下载GeForce Experience然后把驱动更新到最新版即可，或者手动下载驱动，没有特殊需要的话默认最新版就好。

### 安装cuda和cudnn

主体部分和linux下大同小异，按要求下载安装对应版本即可，安装cuda后打开命令行输入

```
nvcc -V
```

返回版本号说明安装cuda成功。

不过cudnn这里下载完后是复制到cuda对应的bin目录里面，一般是C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA。

安装后有时候不能使用则需要添加环境变量，在系统环境变量里的Path项下添加几个路径

C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v10.1

 　　C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v10.1\lib\x64

安装完成后进入路径然后运行测试，成功则为以下界面。

![11](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/PicGo/202205102138180.png)

然后运行测试的代码即可。
