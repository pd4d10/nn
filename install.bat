
@echo off

REM setx /M PATH "%PATH%;%userprofile%\.nvmx\current"
REM echo %userprofile%\.nvmx\current;%PATH%

REM echo %PATH%

REM REM prompt myprompt$G

REM C:\Program Files (x86)\Common Files\Oracle\Java\javapath;C:\Program Files (x86)\Intel\iCLS Client\;C:\Program Files\Intel\iCLS Client\;C:\windows\system32;C:\windows;C:\windows\System32\Wbem;C:\windows\System32\WindowsPowerShell\v1.0\;C:\Program Files (x86)\Intel\Intel(R) Management Engine Components\DAL;C:\Program Files\Intel\Intel(R) Management Engine Components\DAL;C:\Program Files (x86)\Intel\Intel(R) Management Engine Components\IPT;C:\Program Files\Intel\Intel(R) Management Engine Components\IPT;C:\Program Files (x86)\NVIDIA Corporation\PhysX\Common;C:\Program Files\CMake\bin;C:\Program Files\Microsoft SQL Server\120\Tools\Binn\;D:\Program Files\TortoiseGit\bin;C:\Program Files\Microsoft SQL Server\130\Tools\Binn\;C:\Program Files (x86)\Windows Kits\10\Windows Performance Toolkit\;%SystemRoot%\system32;%SystemRoot%;%SystemRoot%\System32\Wbem;%SYSTEMROOT%\System32\WindowsPowerShell\v1.0\;%SYSTEMROOT%\System32\OpenSSH\;C:\Program Files (x86)\nodejs\;C:\Program Files\Microsoft VS Code\bin

@echo on

REM powershell -Command "Invoke-WebRequest https://www.baidu.com -OutFile test.html"

@echo off
set old_path=
setx path "%userprofile%\.nvmx\bin;%userprofile%\.nvmx\current;%path%"

if exist "%systemdrive%\Program Files (x86)\" (
  set system_arch=64
) else (
  set system_arch=32
)

notepad %NVM_HOME%\settings.txt
@echo on
