$nvmx_root = "$Env:UserProfile\.nvmx"
$nvmx_bin = "$nvmx_root\bin"
$nvmx_current = "$nvmx_root\current"

if ([Environment]::Is64BitOperatingSystem) {
  $url = 'http://files.git.oschina.net/group1/M00/04/79/PaAvDFtkazaAcwyGAeLHNfRu53k667.exe'
}
else {
  $url = 'http://files.git.oschina.net/group1/M00/04/79/PaAvDFtka76AbwD9AZ5rRwxSMNk588.exe'
}

$version = "v0.0.4"

# https://stackoverflow.com/a/19853757
mkdir $nvmx_bin -ErrorAction SilentlyContinue

Write-Output "Downloading nvmx $version..."
Write-Output $url
# https://stackoverflow.com/a/41618979
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $url -OutFile "$nvmx_bin\nvmx.exe"
Write-Output "Download complete"

Write-Output "Adding path..."
$user_path = [Environment]::GetEnvironmentVariable('path', 'user');
if (!$user_path.Contains($nvmx_bin)) {
  [Environment]::SetEnvironmentVariable('path', "$nvmx_bin;$user_path", 'user');
}
$user_path = [Environment]::GetEnvironmentVariable('path', 'user');
if (!$user_path.Contains($nvmx_current)) {
  [Environment]::SetEnvironmentVariable('path', "$nvmx_current;$user_path", 'user');
}

Write-Output "Please reopen your shell to activate nvmx"
Write-Output ""
Write-Output "If something went wrong please submit an issue:"
Write-Output "https://github.com/pd4d10/nvmx/issues/new"
Write-Output ""

# https://stackoverflow.com/a/24621106
# Read-Host -Prompt "Press Enter to exit"
