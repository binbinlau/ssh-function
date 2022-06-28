/*
 * @Author: liubinp liubinp@yonyou.com
 * @Date: 2022-06-26 20:49:45
 * @LastEditors: liubinp liubinp@yonyou.com
 * @LastEditTime: 2022-06-29 01:24:10
 * @FilePath: \ssh-function\src\make.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const fs = require('fs');
const archiver = require('archiver');
const childProcess = require('child_process');
import * as vscode from 'vscode';
import { oConsole } from "./utils";
const dgram = require('dgram');
var sudo = require('sudo-prompt');
var options = {
  name: 'Build Project',
};

const { log, error } = oConsole;

export class Make {
  model: string;
  workspaceRoot: string;
  callback: (success: boolean) => void;
  constructor(commandType: string, model: string, workspaceRoot: string, callback: (success: boolean) => void) {
    this.model = model;
    this.workspaceRoot = workspaceRoot;
    this.callback = callback;
    if (commandType === 'clean') {
      // this.makeClean();
      vscode.commands.executeCommand("workbench.action.tasks.runTask", "clean the rte and solib");
      this.callback(false);
    } else if (commandType === 'build') {
      vscode.commands.executeCommand("workbench.action.tasks.runTask", "build the rte and solib");
      this.callback(false);
      // this.makeBuild();
    } else if (commandType === 'rebuild') {
      vscode.commands.executeCommand("workbench.action.tasks.runTask", "rebuild the rte and solib");
      this.callback(false);
      // this.makeReBuild();
    } else if (commandType === 'release') {
      this.makeRelease();
    }
  }

  makeClean = async () => {
    this.callback(true);
    const tasks = await vscode.tasks.fetchTasks();
    console.log(JSON.stringify(tasks));
    await sudo.exec('make -C C:/iplc-debug-windcon/control_debug_files clean', options,
      function (err: any, stdout: any, stderr: any) {
        if (err) {
          error('clean err: ' + JSON.stringify(err));
          vscode.window.activeTerminal?.sendText(JSON.stringify(err));
          vscode.window.showErrorMessage('清除编译中间文件失败！');
        } else {
          log('stdout: ' + stdout);
          vscode.window.activeTerminal?.sendText(JSON.stringify(stdout));
          vscode.window.showInformationMessage('清除编译中间文件成功！');
        }
      }
    );
    this.callback(false);
  };

  makeBuild = async () => {
    await sudo.exec('make -C C:/iplc-debug-windcon/control_debug_files build', options,
      function (err: any, stdout: any, stderr: any) {
        if (err) {
          error('build error: ' + JSON.stringify(err));
          vscode.window.activeTerminal?.sendText(JSON.stringify(err));
          vscode.window.showErrorMessage('仅编译改动失败！');
        } else {
          log('build stdout: ' + stdout);
          vscode.window.activeTerminal?.sendText(JSON.stringify(stdout));
        }
        vscode.window.showInformationMessage('仅编译改动成功！');
      }
    );
    this.callback(false);
  };

  makeReBuild = async () => {
    await sudo.exec('make -C C:/iplc-debug-windcon/control_debug_files rebuild', options,
      function (err: any, stdout: any, stderr: any) {
        if (err) {
          error('rebuild err: ' + JSON.stringify(err));
          vscode.window.activeTerminal?.sendText(JSON.stringify(err));
          vscode.window.showErrorMessage('全部重新编译失败！');
        } else {
          log('rebuild stdout: ' + stdout);
          vscode.window.activeTerminal?.sendText(JSON.stringify(stdout));
        }
        vscode.window.showInformationMessage('全部重新编译成功！');
      }
    );
    this.callback(false);
  };

  makeRelease = async () => {
    await sudo.exec('make -C C:/iplc-debug-windcon/control_debug_files release', options,
      function (err: any, stdout: any, stderr: any) {
        if (err) {
          error('release err: ' + JSON.stringify(err));
          vscode.window.activeTerminal?.sendText(JSON.stringify(err));
          vscode.window.showErrorMessage('release failed！');
        } else {
          log('release stdout: ' + stdout);
          vscode.window.activeTerminal?.sendText(JSON.stringify(stdout));
          vscode.window.showInformationMessage('release success！');
        }
      }
    );
    this.callback(false);
  };
}