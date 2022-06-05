const fs = require('fs');
const archiver = require('archiver');
const childProcess = require('child_process');
import { NodeSSH } from "node-ssh";
import * as vscode from 'vscode';
import { DeployConfigItem } from "./nodeDependencies";
import { getFileName, oConsole } from "./utils";

const { log, error, succeed, info, underline, } = oConsole;


export class Deploy {
  model: string;
  config: DeployConfigItem;
  ssh: NodeSSH;
  workspaceRoot: string;
  taskList: { task: () => void | Promise<any>; tip: string; increment: number; async?: boolean; }[];
  callback: (success: boolean) => void;
  constructor(model: string, config: DeployConfigItem, workspaceRoot: string, callback: (success: boolean) => void) {
    this.model = model;
    this.config = config;
    this.workspaceRoot = workspaceRoot;
    this.callback = callback;
    this.ssh = new NodeSSH();
    this.taskList = [
      // { task: this.checkConfig, tip: "配置检查", increment: 0, async: false },

      // { task: this.execBuild, tip: "打包", increment: 10 },
      // { task: this.buildZip, tip: "压缩文件", increment: 30, async: false },

      { task: this.connectSSH, tip: "连接服务器", increment: 10, async: false },
      // { task: this.stopRunCommand, tip: "停止远程旧程序", increment: 20, async: false },
      // { task: this.removeRemoteFile1, tip: "删除服务器文件", increment: 30, async: false },
      // { task: this.uploadLocalFile1, tip: "上传文件至服务器", increment: 60, async: false },
      // { task: this.modefyFileAccess, tip: "修改文件权限", increment: 80, async: false },
      { task: this.sartRunCommand, tip: "启动远程运行程序", increment: 90, async: false },

      // { task: this.unzipRemoteFile, tip: "解压服务器文件", increment: 70, async: false },
      // { task: this.execuCustomScript, tip: "执行自定义命令", increment: 80, async: false },
      { task: this.disconnectSSH, tip: "断开服务器", increment: 90, async: false },
      // { task: this.removeLocalFile, tip: "删除本地压缩文件", increment: 100, async: false },
    ];
    this.start();
  }
  start = async () => {
    log("--------开始执行-------");
    const { host } = this.config;
    const progressOptions = {
      location: vscode.ProgressLocation.Notification,
      title: `打包上传(${host})`,
    };
    vscode.window.withProgress(progressOptions, async (progress, token) => {
      let schedule = "";
      try {
        const { taskList } = this;
        const { length } = taskList;
        for (let i = 0; i < length; i++) {
          const { task, async, tip, increment } = taskList[i];
          progress.report({ increment, message: `${tip}中...（${increment}%）` });
          schedule = tip;
          if (async === true) {
            task();
          } else {
            await task();
          }
        }
        log("--------执行成功-------");
        this.callback(true);
        vscode.window.showInformationMessage(`上传成功(${host})`, "知道了");
      } catch (err) {
        this.callback(false);
        vscode.window.showInformationMessage(`上传失败(${host})：${err}`, "知道了");
        error(`${schedule}失败:`);
        error(err);
      }
      return new Promise((resolve) => {
        resolve(undefined);
      });
    });
    
  };
  checkConfig = () => {
    const { host, username, remotePath, distPath } = this.config;
    console.log(`检测配置...`, this.config);
    // if (!remotePath) {
    //   if (remotePath === '/') {
    //     throw new Error("服务器文件目录不能为根目录");
    //   }
    //   throw new Error("请配置服务器文件目录[remotePath]");
    // }
    // if (!username) {
    //   throw new Error("请配置用户名[username]");
    // }
    if (!host) {
      throw new Error("请配置服务端地址[host]");
    }
    // if (!distPath) {
    //   throw new Error("请配置本地需要上传的目录[distPath]");
    // }
  };
  // 1. 执行打包脚本
  execBuild = () => {
    const { config } = this;
    const { build } = config;
    console.log(`1.执行打包脚本：${build}`);
    if (!build) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      childProcess.exec(
        `${build}`,
        { cwd: this.workspaceRoot, maxBuffer: 1024 * 1024 * 1024 },
        (e: { message: any; } | null) => {
          if (e === null) {
            resolve(undefined);
          } else {
            reject(`1. 执行打包脚本失败：${e.message}`);
          }
        }
      );
    });
  };

  // 2. 压缩文件夹
  buildZip = () => {
    const { config } = this;
    return new Promise((resolve, reject) => {
      log(`2. 压缩文件夹： ${config.distPath}.zip`);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      }).on('error', (e: any) => {
        error(e);
        reject(`2. 打包zip出错: ${e}`);
      });

      const output = fs
        .createWriteStream(`${this.workspaceRoot}/${config.distPath}.zip`)
        .on('close', (e: any) => {
          if (e) {
            reject(`2. 打包zip出错: ${e}`);
            process.exit(1);
          } else {
            resolve(undefined);
          }
        });

      archive.pipe(output);
      archive.directory(`${this.workspaceRoot}/${config.distPath}`, false);
      archive.finalize();
    });
  };
  
  // 3. 连接服务器
  connectSSH = () => {
    const { config } = this;
    // 覆盖配置文件中的密码
    if (config.isDebug) {

    } else {
      config.username = 'root';
      config.password = 'root';
    }
    log(`3. 连接服务器： ${underline(config.host)}`);
    return new Promise((resolve, reject) =>{
      this.ssh.connect(config).then(() => {
        resolve(undefined);
      }).catch((err) => {
        reject(err);
      });
    });
  };

  // 执行关闭程序命令
  stopRunCommand = () => {
    const { config } = this;
    var result;
    log('停止远程旧程序:' + config.debugModeStopCmd + '、' + config.drectrunModeStopCmd + '、' + JSON.stringify(config.cwd));
    this.ssh.execCommand(config.drectrunModeStopCmd, { cwd: config.cwd, execOptions: {env: "/bin/ash", pty: true}}).then((reason: any) => {
      if (config.isDebug) {
        vscode.window.showErrorMessage('run model stop info: ' + JSON.stringify(reason));
      }
      vscode.window.activeTerminal?.sendText('111111111' + JSON.stringify(reason));
    });
    this.ssh.execCommand(config.debugModeStopCmd, { cwd: config.cwd, execOptions: { env: "/bin/ash", pty: true } }).then((reason: any) => {
      if (config.isDebug) {
        vscode.window.showErrorMessage('debug model stop info' + JSON.stringify(reason));
      }
      vscode.window.activeTerminal?.sendText('222222222' + JSON.stringify(reason));
    });
  };

  // 删除远程文件
  removeRemoteFile = () => {
    const { config } = this;
    const { remotePath, distPath} = config;
    log(`4. 删除远程文件 ${underline(remotePath)}`);
    if (distPath && distPath.length > 0) {
      var result;
      for (let i = 0; i < distPath.length; i++) {
        result = this.ssh.execCommand(`rm -rf ${remotePath}/${getFileName(distPath[i])}`);
      }
      return result;
    }
  };

  // 删除远程文件
  removeRemoteFile1 = () => {
    const { config } = this;
    const { remotePathRte, remotePathWtcso, distPathRte, distPathWtcso} = config;
    log(`4.1 删除远程文件 ${underline(remotePathRte + '/' + getFileName(distPathRte))}`);
    log(`4.2 删除远程文件 ${underline(remotePathWtcso + '/' + getFileName(distPathWtcso))}`);
    var result;
    result = this.ssh.execCommand(`rm -rf ${remotePathRte}/${getFileName(distPathRte)}`);
    result = this.ssh.execCommand(`rm -rf ${remotePathWtcso}/${getFileName(distPathWtcso)}`);
    return result;
  };

  // 上传本地文件
  uploadLocalFile = () => {
    const { config } = this;
    if (config.distPath && config.distPath.length > 0) {
      var result;
      for (let i = 0; i < config.distPath.length; i++) {
        const remoteFile = `${config.remotePath}/${getFileName(config.distPath[i])}`;
        const localPath = `${config.distPath[i]}`;
        log(`5. 上传打包zip至目录： ${underline(localPath)}`);
        
        result = this.ssh.putFile(localPath, remoteFile, null, {
          concurrency: 1
        });
      }
      return result;
    }
  };

  // 上传本地文件
  uploadLocalFile1 = () => {
    const { config } = this;
    const { remotePathRte, remotePathWtcso, distPathRte, distPathWtcso} = config;
    log(`5.1 上传本地文件 ${underline(remotePathRte + '/' + getFileName(distPathRte))}`);
    log(`5.2 上传本地文件 ${underline(remotePathWtcso + '/' + getFileName(distPathWtcso))}`);
    var result;
    result = this.ssh.putFile(distPathRte, remotePathRte + '/' + getFileName(distPathRte), null, {
      concurrency: 1
    });
    result = this.ssh.putFile(distPathWtcso, remotePathWtcso + '/' + getFileName(distPathWtcso), null, {
      concurrency: 1
    });
    return result;
  };

  // 修改文件权限
  modefyFileAccess = () => {
    const { config } = this;
    const { remotePathRte, distPathRte } = config;
    var result;
    result = this.ssh.execCommand('chmod 777 ' + remotePathRte + '/' + getFileName(distPathRte));
    // result = this.ssh.execCommand('chmod 777 ' + remotePathWtcso + '/' + getFileName(distPathWtcso));
    return result;
  };

  // 执行开始程序命令
  sartRunCommand = () => {
    const { config } = this;
    var result = '没有可执行任务';
    log('启动远程运行程序: ' + this.model + '(' + config.debugModeStartCmd + '、' + config.drectrunModeStartCmd + '、' + JSON.stringify(config.cwd) + ')');
    this.ssh.exec("touch /root/test11.log", []).then((reason: any) => {
      if (reason.stderr) {
        vscode.window.activeTerminal?.sendText(JSON.stringify(reason.stderr));
      }
    });
    // if (this.model === RUN_MODEL_NAME) {
    //   return this.ssh.execCommand(config.drectrunModeStartCmd, { cwd: config.cwd, execOptions: { env: "/bin/ash", pty: true } }).then((reason: any) => {
    //     if (config.isDebug) {
    //       vscode.window.showErrorMessage('run model start info: ' + JSON.stringify(reason));
    //     }
    //     vscode.window.activeTerminal?.sendText(JSON.stringify(reason));
    //   });
    // } else if (this.model === DEBUG_MODEL_NAME) {
    //   return this.ssh.execCommand(config.debugModeStartCmd, { cwd: config.cwd, execOptions: { env: "/bin/ash", pty: true } }).then((reason: any) => {
    //     if (config.isDebug) {
    //       vscode.window.showErrorMessage('debug model start info' + JSON.stringify(reason));
    //     }
    //     vscode.window.activeTerminal?.sendText(JSON.stringify(reason));
    //   });
    // }
    return result;
  };

  // 解压远程文件
  unzipRemoteFile = () => {
    const { remotePath, distPath } = this.config;
    const remoteFileName = `${remotePath}.zip`;
    const remoteFile = `${remotePath}/${distPath}.zip`;

    log(`6. 解压远程文件 ${underline(remoteFileName)}`);
    return this.ssh.execCommand(
      `unzip -o ${remoteFile} -d ${remotePath}`
    );
  };

  // 执自定义地脚本
  execuCustomScript = () => {
    const { config } = this;
    const { scripts } = config;

    if (scripts && scripts.length > 0) {
      var result;
      for (let i = 0; i < scripts.length; i++) {
        result = this.ssh.execCommand(`${scripts[i]}`);
        log('execu script is :' + scripts[i] + ' result is: ' + result);
      }
      return result;
    }
  };

  // 删除本地打包文件
  removeLocalFile = () => {
    const { config } = this;
    const localPath = `${this.workspaceRoot}/${config.distPath}`;
    log(`7. 删除本地打包目录: ${underline(localPath)}`);
    const remove = (path: string) => {
      if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach((file: any) => {
          let currentPath = `${path}/${file}`;
          if (fs.statSync(currentPath).isDirectory()) {
            remove(currentPath);
          } else {
            fs.unlinkSync(currentPath);
          }
        });
        fs.rmdirSync(path);
      }
    };
    // remove(localPath);
    fs.unlinkSync(`${localPath}.zip`);
  };
  // 断开ssh
  disconnectSSH = () => {
    log(`8. 断开服务器`);
    this.ssh.dispose();
  };
}