import * as vscode from "vscode";
import chalk = require("chalk");

export const oConsole = {
  log: (...message: any[]) => {
    console.log(...message);
  },
  // 成功信息
  succeed: (...message: any[]) => {
    console.log(...message);
  },
  // 提示信息
  info: (...message: any[]) => {
    console.log(...message);
  },
  // 错误信息
  error: (...message: any[]) => {
    console.error(...message);
  },
  // 下划线重点信息
  underline: (...message: any[]) => {
    return chalk.underline.blueBright.bold(message);
  }
};

/**
 * 根据文件路径返回文件名
 * @param path 文件路径
 * @returns 文件名
 */
export const getFileName = function(path:any) : string{
  var pos1 = path.lastIndexOf('/');
  var pos2 = path.lastIndexOf('\\');
  var pos  = Math.max(pos1, pos2);
  if( pos < 0 ) {
    return path;
  }
  return path.substring(pos + 1);
};

/**
 * ip地址 0.0.0.0~255.255.255.255
 * @param ip ip地址
 * @returns 
 */
export const validateIP = function(ip: string) {
	const re = /^(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[0-9])\.((1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.){2}(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)$/;
	return re.test(ip);
};


export const RUN_MODEL_NAME = '上传文件直接运行';
export const DEBUG_MODEL_NAME = '上传文件准备调试';