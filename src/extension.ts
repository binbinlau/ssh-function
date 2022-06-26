/*
 * @Author: liubinp liubinp@yonyou.com
 * @Date: 2022-05-18 18:41:22
 * @LastEditors: liubinp liubinp@yonyou.com
 * @LastEditTime: 2022-06-26 21:32:34
 * @FilePath: \GDeploy\src\extension.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { readFileSync, writeFile, writeFileSync } from 'fs';
import * as vscode from 'vscode';
import { makeEntry } from './events/makeEntry';
import { uploadEntry } from './events/uploadEntry';
import { MakeNodeProvider } from './makeItem';
import { DepNodeProvider } from './nodeDependencies';
import { validateIP } from './utils';

class InputBoxOptions implements vscode.InputBoxOptions {
	placeHolder: string = "请输入远程IP";
}

// 激活事件
export function activate(context: vscode.ExtensionContext) {
	console.log("---------------组件激活😄---------------");
	const nodeDependenciesProvider = new DepNodeProvider(vscode.workspace.rootPath || "");
	const makeDependenciesProvider = new MakeNodeProvider(vscode.workspace.rootPath || "");
	vscode.window.registerTreeDataProvider('nodeDependencies', nodeDependenciesProvider);
	vscode.window.registerTreeDataProvider('makeViews', makeDependenciesProvider);
	vscode.commands.registerCommand('nodeDependencies.refreshEntry', () => nodeDependenciesProvider.refresh());
	vscode.commands.registerCommand('nodeDependencies.uploadEntry', uploadEntry);
	vscode.commands.registerCommand('makeViews.selfCommand', makeEntry);
	vscode.commands.registerCommand('copyLibraryCommand', () => {
		// 将固定命令复制到粘贴板 -exec set solib-search-path C:\\Project\\Controllers\\GUP3p0\\Source\\Controller\\Release
		const util = require('util');
		// require('child_process').spawn('clip').stdin.end(util.inspect(`-exec set solib-search-path C:\\Project\\Controllers\\GUP3p0\\Source\\Controller\\Release`));
		require('child_process').spawn('clip').stdin.end('-exec set solib-search-path C:\\Project\\Controllers\\GUP3p0\\Source\\Controller\\Release');

		vscode.window.showInformationMessage('复制命令成功!');
	});
	vscode.commands.registerCommand('setRemoteIp', () => {
		vscode.window.showInputBox(new InputBoxOptions(), undefined).then((ip: string | undefined) => {
			if (ip) {
				if (validateIP(ip)) {
					// 输入了正确的ip，修改配置文件
					let config = readFileSync(vscode.workspace.rootPath + '/.vscode/deploy.config', 'utf8');
					let launchConfig = readFileSync(vscode.workspace.rootPath + '/.vscode/launch.json', 'utf8');
					config = config.replace(new RegExp("host:.*\,", "g"), `host: '${ip}',`);
					launchConfig = launchConfig.replace(new RegExp("\"miDebuggerServerAddress\":.*\:", "g"), `"miDebuggerServerAddress": "${ip}:`);

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
