/*
 * @Author: liubinp liubinp@yonyou.com
 * @Date: 2022-06-22 23:29:53
 * @LastEditors: liubinp liubinp@yonyou.com
 * @LastEditTime: 2022-06-26 16:57:25
 * @FilePath: \ssh-function\src\sshUtil.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// import { Shell } from 'node-powershell';

/** Options to use when running an executable as admin */
// interface RunAsAdminCommand {
//     /** Path to the executable to run */
//     path: string
//     /** Working dir to run the executable from */
//     workingDir?: string
// }
/**
 * Runs a PowerShell command or an executable as admin
 *
 * @param command If a string is provided, it will be used as a command to
 *   execute in an elevated PowerShell. If an object with `path` is provided,
 *   the executable will be started in Run As Admin mode
 *
 * If providing a string for elevated PowerShell, ensure the command is parsed
 *   by PowerShell correctly by using an interpolated string and wrap the
 *   command in double quotes.
 *
 * Example:
 *
 * ```
 * `"Do-The-Thing -Param '${pathToFile}'"`
 * ```
 */
// const runAsAdmin = async (command: string | RunAsAdminCommand): Promise<string> => {
//     const usePowerShell = typeof command === 'string';
//     const shell = new Shell({});
//     await shell.addCommand('Start-Process');
//     if (usePowerShell) {
//         await shell.addArgument('PowerShell');
//     }
//     // Elevate the process
//     await shell.addArgument('-Verb');
//     await shell.addArgument('RunAs');
//     // Hide the window for cleaner UX
//     await shell.addArgument('-WindowStyle');
//     await shell.addArgument('Hidden');
//     // Propagate output from child process
//     await shell.addArgument('-PassThru');
//     // Wait for the child process to finish before exiting
//     if (usePowerShell) {
//         await shell.addArgument('-Wait');
//     }

//     if (usePowerShell) {
//         // Pass argument list to use in elevated PowerShell
//         await shell.addArgument('-ArgumentList');
//         await shell.addArgument(command as string);
//     } else {
//         // Point to executable to run
//         await shell.addArgument('-FilePath');
//         await shell.addArgument(`'${(command as RunAsAdminCommand).path}'`);

//         if ((command as RunAsAdminCommand).workingDir) {
//             // Point to working directory to run the executable from
//             await shell.addArgument('-WorkingDirectory');
//             await shell.addArgument(`'${(command as RunAsAdminCommand).workingDir}'`);
//         }
//     }

//     await shell.invoke();
//     return await shell.dispose();
// };