/*
 * @Author: liubinp liubinp@yonyou.com
 * @Date: 2022-06-22 23:29:53
 * @LastEditors: liubinp liubinp@yonyou.com
 * @LastEditTime: 2022-06-26 23:02:51
 * @FilePath: \ssh-function\src\events\uploadEntry.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as vscode from 'vscode';
import { Make } from "../make";
import { MakeItem } from '../makeItem';

let loading = false;

/**
 * 编译事件
 * @param makeEvent
 */
export const makeEntry = (makeEvent: MakeItem) => {
  if (!makeEvent) {
    return;
  }
  if (loading) {
    vscode.window.showInformationMessage(`当前已有任务正在进行，请稍后再试`, "知道了");
    return;
  }
  loading = true;
  new Make(makeEvent.commandType, makeEvent.label, makeEvent.workspaceRoot, (flag: boolean) => {
    loading = flag;
  });
};
