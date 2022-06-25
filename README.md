<!--
 * @Author: liubinp liubinp@yonyou.com
 * @Date: 2022-06-22 23:29:53
 * @LastEditors: liubinp liubinp@yonyou.com
 * @LastEditTime: 2022-06-22 23:46:17
 * @FilePath: \ssh-function\README.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
## 插件功能

1. 🔨 自动压缩
2. 🔨 自动下载服务器发布

## 使用介绍

1. vscode -> 扩展 -> 更多（...）-> 从VSIX安装
2. 在工作区根路径下添加 deploy.config 文件
3. 配置项目如下

```javascript

const config = {
  下载重启服务: {
    host: '127.0.0.1', // 服务器地址
    username: 'root', // 登录用户名
    password: 'password', // 登录密码
    remotePath: '/home/www/admin', // 项目上传的服务器文件目录
    scripts: ['touch /home/1111.txt', 'touch /home/2222.txt'], // 执行自定义命令
    distPath: 'media', // 打包好需要上传的目录
  }
};

module.exports = config;
```

| 参数       | 说明                            |
| ---------- | -------------------------      |
| host       | 服务器地址                      |
| username   | 用户名                          |
| password   | 密码 🔑                        |
| remotePath | 服务器项目文件目录,不能为根目录   |
| scripts    | 构建代码命令                    |
| distPath   | 打包文件夹名称, 默认 dist        |
| privateKey | 秘钥地址 🔑                     |
