---
title: 现代化的包管理工具：uv
date: 2025-04-29 22:21:37
tags: 技术知识
categories: 技术知识
keywords: 
description: 秋招正式批拼多多技术面试分享。
top_img: https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/9df566a73df3459ced3a41e6a9b124c4.jpeg
comments: true
cover: https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/9df566a73df3459ced3a41e6a9b124c4.jpeg
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

在 Python 开发中，使用好的包和项目管理工具，相当于打好基础。这年头，来自 Astral (即 Ruff 和 Black 的开发者) 的新工具UV，一上线就引发了广泛关注，以 Rust 高性能实现，目标是替代 pip，virtualenv，poetry 等组合，成为 Python 最新一代的包管理栏杆。

## 为什么要使用uv

现在的包管理工具有很多，conda，pip，poetry，pipenv 等等，功能各有千秋，但都存在一些问题，而uv则可以在很大程度上解决了这些问题。

自从接触到uv之后我几乎不再使用其他包管理工具，只有部分情况是例外的，比如个别仓库默认的包管理工具是conda或者poetry，而且这个项目用uv会存在bug，比如ComfyUI，使用uv就会有问题，这种就会使用conda。或者个别比较老的代码，有些时候就存在一些问题，这种还是求稳定最好。

### uv的优势

1. 极致性能

- 安装速度提升：这是非常重要的一点，UV 在无缓存的冷启动情况下，安装速度比 pip 快约 8～10 倍；uv在已有缓存的情况下，速度提升可达 80～100 倍。这一点看似不明显，但是亲身体验之后就回不去了，命令刚输完就执行完了，简直不要太爽。pip是单线程串行下载，且每安装一个包就校验一次，速度受限；解析依赖时是**递归深度优先**，每次都重新 resolve，IO+CPU双重瓶颈。而uv**完全异步并行下载**（利用 Rust 的 tokio runtime），同时批量多线程拉取 wheel 文件。**依赖解析一次性建树**，在内存中直接解析出完整依赖树，再按优先级并行处理。大量减少 I/O 阻塞、减少不必要校验轮次。


- 并行下载与解析：​利用 Rust 的并发能力，UV 实现了高效的依赖解析和并行下载，大幅减少了安装时间。uv在解析阶段同时并发处理**多条依赖关系。下载阶段是异步 HTTP 客户端**，同时并发多达 32+ 连接从镜像源拉取 `.whl` 文件。在安装阶段：**解压 wheel 包时并行 IO + CPU 分摊**。最近几年很多rust的项目都表现不错，未来可期。


- 全局缓存机制：UV 使用全局包缓存，避免重复下载和构建，提高了资源利用率。这一点其实还是很重要的，因为conda也可以进行全局缓存，但是conda由于本身就非常慢，这样效率其实也没有快哪里去。同时uv的依赖解析缓存也更加细粒度，非常快，全局统一缓存目录管理更加智能，冷启动性能好。**pip 的 cache**只是简单放 `.whl` 文件。**UV的 cache**更加复杂，针对不同源（PyPI、国内镜像等）**独立管理缓存目录**；wheel/binary/source包缓存分离；pip-style `.whl` 缓存 + 自有 `build cache`（本地打包 artifacts）；还有**软链接/硬链接优化**（安装时尽量链接，不拷贝）

2. 统一的项目管理

- 集成虚拟环境管理：​UV 内置虚拟环境管理功能，自动在项目中创建和管理虚拟环境，避免了手动操作，非常方便，而且还方便切换python多个版本，避免了本地环境污染。

- 支持 pyproject.toml：UV 使用 pyproject.toml 作为项目配置文件，统一管理依赖和项目元数据。这是一种现代化的依赖管理方法，负责定义项目的元数据、依赖关系、构建系统以及 UV 的特定配置。

- 生成锁定文件：​UV 自动生成 uv.lock 文件，精确记录每个包的版本和校验信息，确保环境的可重复性。​

3. 灵活的依赖解析

- 多种解析策略：​UV 提供多种依赖解析策略，如选择最新兼容版本或最低版本组合，满足不同需求。​

- 支持多 Python 版本：​UV 允许指定目标 Python 版本进行依赖解析，即使当前环境中未安装该版本的 Python。​


依赖覆盖机制：​UV 引入了“依赖覆盖”机制，允许用户修改某些包声明的依赖版本，解决上游包的依赖冲突问题。​

4. 丰富的功能集
   命令行工具管理：​UV 提供类似于 pipx 的功能，可以在隔离的环境中安装 Python 工具，同时使它们的命令行接口全局可用。​

Python 版本管理：​UV 支持安装和管理不同版本的 Python，方便在项目中使用特定版本的解释器。​

脚本运行支持：​UV 支持运行脚本，并支持内联的依赖元数据，简化了脚本的依赖管理。

## 基本使用和常用命令

一段很简单的安装：

pip install uv

快速创建项目：

uv init my_project
cd my_project

添加包：

uv add requests

删除包：

uv remove requests

同步安装依赖：

uv sync

重新解析依赖并生成锁定文件：

uv lock

创建虚拟环境：

uv venv .venv

跟 pip 使用方式类似：

uv pip install flask

运行脚本：

uv run python app.py

清理缓存：

uv cache clean

pyproject.toml 包管理文件使用

UV 采用标准的 pyproject.toml，统一管理项目信息和依赖：

基础结构：

[project]
name = "my_project"
version = "0.1.0"
dependencies = [
    "requests>=2.31",
    "numpy~=1.24"
]

[project.optional-dependencies]
dev = ["pytest", "black"]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

UV 特有配置：

[tool.uv]
managed = true
package = true

[[tool.uv.index]]
url = "https://pypi.tuna.tsinghua.edu.cn/simple"
default = true

[tool.uv] 表示是否由 UV 管理虚拟环境、打包等

index 可以指定镜像源（如清华 PyPI）

同时 UV 会生成 uv.lock，锁定给定环境下的确定包版本和校验信息，保证可重复性。

## 常见问题和解决方法

1. 使用 --system-site-packages 后包无效

UV 创建虚拟环境时，当使用 --system-site-packages，运行可以访问系统包，但不会在解析时考虑。

建议自己在虚拟环境内重新安装所需包，保证环境简洁可控。

2. 删除包后剩余依赖

uv remove xxx 不会自动删除其下气包

请手动执行：

uv lock
uv sync

依赖分析后自动清理

3. 网络慢，下载失败

使用国内镜像：

uv config set index-url https://pypi.tuna.tsinghua.edu.cn/simple

4. uv.lock 未自动更新

进行依赖改动后，需自动执行：

uv lock

## 在 UV 中管理 PyTorch

1. 基础安装：

默认：Windows/Mac 安装 CPU-only 版，Linux 安装 CUDA 12.4 版

uv init --python 3.12
uv add torch torchvision torchaudio

2. 安装指定 CUDA 版（如 12.6）：

修改 pyproject.toml：

[[tool.uv.index]]
name = "pytorch-cu126"
url = "https://download.pytorch.org/whl/cu126"
explicit = true

[tool.uv.sources]
torch = { index = "pytorch-cu126" }
torchvision = { index = "pytorch-cu126" }
torchaudio = { index = "pytorch-cu126" }

后执行：

uv sync

3. 验证 CUDA 支持

新建脚本：

import torch
print(torch.cuda.is_available())
print(torch.cuda.get_device_name(0))

运行：

uv run python check_cuda.py

## 常见问题：

如果直接用 uv pip install 安装，pyproject.toml 不会更新，建议终究使用 uv add

如遇到网络慢，同样可配置用国内镜像源

# 总结

UV 是一款超高性能、全配套、很合于环境及大型项目管理的新世代工具，特别适合对环境素质有严格要求的开发者和研究人员。

无论是日常开发，进行快速指定版本部署，还是复杂的模型训练，UV 都完全能上场，是很值得推荐的 Python 包管理方案。
