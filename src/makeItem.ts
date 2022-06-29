/*
 * @Author: liubinp liubinp@yonyou.com
 * @Date: 2022-06-26 20:28:01
 * @LastEditors: liubinp liubinp@yonyou.com
 * @LastEditTime: 2022-06-29 22:35:11
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

export class MakeItem extends vscode.TreeItem {
	constructor(
    public readonly commandType: string,
		public readonly label: string,
		private readonly version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly workspaceRoot: string,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
    
    this.tooltip = '';
		this.description = this.version;
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'server_light.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'server_dark.svg')
	};

	contextValue = 'makeCommand';
}