import * as vscode from 'vscode';
import { uploadEntry } from './events/uploadEntry';
import { DepNodeProvider } from './nodeDependencies';
import { validateIP } from './utils';
import { readFileSync, writeFileSync, writeFile } from 'fs';

class InputBoxOptions implements vscode.InputBoxOptions {
	placeHolder: string = "请输入远程IP";
}

// 激活事件
export function activate(context: vscode.ExtensionContext) {
	console.log("---------------组件激活😄---------------");
	const nodeDependenciesProvider = new DepNodeProvider(vscode.workspace.rootPath || "");
	vscode.window.registerTreeDataProvider('nodeDependencies', nodeDependenciesProvider);
	vscode.commands.registerCommand('nodeDependencies.refreshEntry', () => nodeDependenciesProvider.refresh());
	vscode.commands.registerCommand('nodeDependencies.uploadEntry', uploadEntry);
	vscode.commands.registerCommand('setRemoteIp', () => {
		vscode.window.showInputBox(new InputBoxOptions(), undefined).then((ip: string | undefined) => {
			if (ip) {
				if (validateIP(ip)) {
					// 输入了正确的ip，修改配置文件
					let config = readFileSync(vscode.workspace.rootPath + '/.vscode/deploy.config', 'utf8');
					let launchConfig = readFileSync(vscode.workspace.rootPath + '/.vscode/launch.json', 'utf8');
					config = config.replace(new RegExp("host:.*\,", "g"), `host: '${ip}',`);
					launchConfig = launchConfig.replace(new RegExp("\"target\":.*\:", "g"), `"target": "${ip}:`);

					writeFileSync(vscode.workspace.rootPath + '/.vscode/launch.json', launchConfig);
					writeFile(vscode.workspace.rootPath + '/.vscode/deploy.config', config, (err) => {
						if (err) {
							vscode.window.showErrorMessage('修改IP地址错误，请重试');
							throw err;
						}
						nodeDependenciesProvider.refresh();
						vscode.commands.executeCommand('nodeDependencies.refreshEntry');
						vscode.window.showInformationMessage('修改远程IP地址[' + ip + ']成功!');
					});
					return;
				} else {
					vscode.window.showErrorMessage('IP地址[' + ip + ']' + '格式不正确!');
					return;
				}
			}
			// vscode.window.showInformationMessage('请输入远程IP地址!');
			return;
		});
	});
}

// 销毁周期
export function deactivate() {
	console.log("---------------銷毀😀---------------");
}
