import * as path from 'path';
import * as vscode from "vscode";
import { DEBUG_MODEL_NAME, RUN_MODEL_NAME } from "./utils";

export class DepNodeProvider implements vscode.TreeDataProvider<Dependency> {
  // workspaceRoot 当前工作区根路径
  constructor(private workspaceRoot: string) {
  
  }
  
  private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;
  getDeployConfig = () => {
    try {
      const url = this.workspaceRoot + "/.vscode/deploy.config";
      // 手动删除require缓存
      delete require.cache[require.resolve(url)];
      return require(url);
    } catch (error) {
      return  {};
    }
  };

  getTreeItem(element: Dependency): vscode.TreeItem  {
    return element;
  }

  refresh(): void {
		this._onDidChangeTreeData.fire();
  }
  
  getChildren(element?: Dependency): Thenable<Dependency[]> {
    // element 当前选中的节点， 如果为空则为根节点
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('当前无工作区');
      return Promise.resolve([]);
    }
    
    if (element) {
      return Promise.resolve([]);
    } else {
      let flagConfig: any = null;
      const configList = toArray(this.getDeployConfig()).map((item) =>{
        if (!flagConfig) {
          flagConfig = item.config;
        }
        return new Dependency(item.name, item.config.host, 0, item.config, this.workspaceRoot, {
          title: "打包上传",
          command: "nodeDependencies.uploadEntry",
          tooltip: ""
        });
      });

      return Promise.resolve(configList);
    }
  }

}

/**
 * 上传文件项数据模型
 */
export class Dependency extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		private readonly version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly config: DeployConfigItem,
    public readonly workspaceRoot: string,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
    
    this.tooltip = `服务器：${this.label} 地址：${this.version}`;
		this.description = this.version;
	}

 /**
  * 配置项按钮图片资源路径设置
  *
  * @memberof Dependency
  */
 iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'server_light.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'server_dark.svg')
	};

	contextValue = 'dependency';
}

const toArray = (obj: {[x: string]: any}): {name: string, config: any}[] => {
  const arr = [];
  // 默认配置项
  let commonConfig = {
    isDebug: false, // 是否为调试模式
    host: '192.168.1.1', //板子ip地址，可以通过setRemoteip方式设定修改，不固定，L1
    username: '', // ssh登录用户名，这里设置的内容无效，固化到插件程序中root，固定，L2
    password: '', // ssh登录密码，这里设置的内容无效，固化到插件程序中root，固定，L3
    readyTimeout: 5000, //ssh连接超时时间设置，固定，L4

    distPathRte: 'C:/iplc-debug-windcon/control_debug_files/rte/dpu', // 电脑上存放rte程序的目录及程序名，固定，L5
    distPathWtcso: 'C:/Project/Controllers/GUP3p0/Source/Controller/Release/libwtc.so', // 电脑上存放wtc动态库的目录及程序名，固定，L6

    // distPathRte: 'E:\\MyGit\\c_worker\\test_so_localdebug_cpt\\use\\main.c',
    // distPathWtcso: 'E:\\MyGit\\c_worker\\test_so_localdebug_cpt\\lib\\main.exe',

    remotePathRte: '/edpf/bin', // 板子上存放rte程序的目录，固定，L7
    remotePathWtcso: '/edpf/lib', // 板子上存放wtc动态库的目录，固定，L8
  };

  let runModelConfigName = RUN_MODEL_NAME;
  let runModelConfig = {
    cwd: "/edpf/bin",
    drectrunModeStopCmd:'stopRun', // 直接运行模式停止旧程序命令，固定，L9
    drectrunModeStartCmd:'startRun', // 直接运行模式启动新程序命令，固定，L10
    
    // cwd: "/home",
    // drectrunModeStopCmd:'sh test', // 直接运行模式停止旧程序命令，固定，L9
    // drectrunModeStartCmd:'sh test', // 直接运行模式启动新程序命令，固定，L10
  };

  let debugModelConfigName = DEBUG_MODEL_NAME;
  let debugModelConfig = {
    cwd: "/edpf/bin",
    debugModeStopCmd:'stopDebug', // 上传文件准备调试模式停止旧程序命令，固定，L11
    debugModeStartCmd:'startDebug', // 上传文件准备调试模式启动新程序命令，固定，L12

    // cwd: "/home",
    // debugModeStopCmd:'sh test', // 上传文件准备调试模式停止旧程序命令，固定，L11
    // debugModeStartCmd:'sh test', // 上传文件准备调试模式启动新程序命令，固定，L12
  };

  let hasCommonNode = false;
  // 检查是否有common配置节点,如果有，将公共配置提取出来
  for (const key in obj) {
    if (key === 'common') {
      hasCommonNode = true;
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        commonConfig = Object.assign(commonConfig, obj[key]);
      }
      break;
    }
  }

  arr.push({name: runModelConfigName, config: Object.assign(commonConfig, runModelConfig)});
  arr.push({name: debugModelConfigName, config: Object.assign(commonConfig, debugModelConfig)});

  for (const key in obj) {
    if (key === 'common') {
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // 排除相同名称项添加
      if (key === runModelConfigName || key === debugModelConfigName) {
        continue;
      }
      const element = obj[key];
      arr.push({name: key, config: Object.assign(commonConfig, element)});
    }
  }
  return arr;
};

export interface DeployConfig {[x: string]: DeployConfigItem}

/**
 * 配置文件支持项
 */
export interface DeployConfigItem {
  isDebug: boolean, // 调试模式
  host: string; // 服务器地址
  username: string; // 用户名
  password: string; // 密码
  remotePath: string; // 服务器文件目录
  build?: string; // 构建代码命令
  scripts?: string[]; // 构建代码命令
  distPath?: string[]; // 打包文件夹名称, 默认 dist
  privateKey?: string; // 秘钥地址
  remove?: boolean; // 是否删除远程文件
  readyTimeout: number; // 设置超时时间

  distPathRte: string; // 本地项目源码路径
  distPathWtcso: string; // 本地项目动态库文件路径

  remotePathRte: string; // 远程主机项目源码路径
  remotePathWtcso: string; // 远程主机项目动态库路径

  cwd: string; // 执行目录

  drectrunModeStopCmd: string; // 直接运行模式停止旧程序命令
  drectrunModeStartCmd: string; // 直接运行模式启动新程序命令

  debugModeStopCmd: string; // 调试模式停止旧程序命令
  debugModeStartCmd: string; // 调试模式启动新程序命令
}