/*
 * @Author: liubinp liubinp@yonyou.com
 * @Date: 2022-06-26 20:28:01
 * @LastEditors: liubinp liubinp@yonyou.com
 * @LastEditTime: 2022-09-12 18:03:20
 * @FilePath: \ssh-function\src\makeItem.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as path from 'path';
import * as vscode from "vscode";

export class MakeNodeProvider implements vscode.TreeDataProvider<MakeItem> {
  // workspaceRoot 当前工作区根路径
  constructor(private workspaceRoot: string) {
  
  }
  
  private _onDidChangeTreeData: vscode.EventEmitter<MakeItem | undefined | void> = new vscode.EventEmitter<MakeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<MakeItem | undefined | void> = this._onDidChangeTreeData.event;

  getTreeItem(element: MakeItem): vscode.TreeItem  {
    return element;
  }

  refresh(): void {
		this._onDidChangeTreeData.fire();
  }
  
  /**
   * 获取树结构数据源
   * @param element 单个配置项
   * @returns 
   */
  getChildren(element?: MakeItem): Thenable<MakeItem[]> {
    // element 当前选中的节点， 如果为空则为根节点
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('当前无工作区');
      return Promise.resolve([]);
    }
    
    if (element) {
      return Promise.resolve([]);
    } else {
      const configList = [];
      const makeCleanItem = new MakeItem('clean', "clean清除中间文件", '', 0, this.workspaceRoot, {
        title: "make clean",
        command: "makeViews.selfCommand",
        tooltip: ""
      });
      const makeBuildItem = new MakeItem('build', "build仅编译改动", '', 0, this.workspaceRoot, {
        title: "make build",
        command: "makeViews.selfCommand",
        tooltip: ""
      });
      const makeReBuildItem = new MakeItem('rebuild', "rebuild全部重新编译", '', 0, this.workspaceRoot, {
        title: "make rebuild",
        command: "makeViews.selfCommand",
        tooltip: ""
      });
      const makeReleaseItem = new MakeItem('release', "make release", '', 0, this.workspaceRoot, {
        title: "make release",
        command: "makeViews.selfCommand",
        tooltip: ""
      });
      configList.push(makeCleanItem);
      configList.push(makeBuildItem);
      configList.push(makeReBuildItem);
      // configList.push(makeReleaseItem);
      return Promise.resolve(configList);
    }
  }

}

/**
 * 本地编译树结构实体
 */
export class MakeItem extends vscode.TreeItem {
	constructor(
    public readonly commandType: string, // 命令类型 clean、build、rebuild、release
    public readonly label: string, // 命令标识 clean、build、rebuild、release
		private readonly version: string, // 版本标识
    public readonly collapsibleState: vscode.TreeItemCollapsibleState, // 树结构展示类型
    public readonly workspaceRoot: string, // 项目根目录
		public readonly command?: vscode.Command // 命令设置实体
	) {
		super(label, collapsibleState);
    
    this.tooltip = ''; // 提示
		this.description = this.version; // 描述信息
	}

 /**
  * 配置项按钮图片资源路径设置
  *
  * @memberof MakeItem
  */
 iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'server_light.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'server_dark.svg')
	};

	contextValue = 'makeCommand';
}