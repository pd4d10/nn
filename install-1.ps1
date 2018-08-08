$nn_root = "$Env:UserProfile\.nn"
$nn_bin = "$nn_root\bin"
$nn_current = "$nn_root\current"

if ([Environment]::Is64BitOperatingSystem) {
  $url = 'http://files.git.oschina.net/group1/M00/04/79/PaAvDFtkazaAcwyGAeLHNfRu53k667.exe'
}
else {
  $url = 'http://files.git.oschina.net/group1/M00/04/79/PaAvDFtka76AbwD9AZ5rRwxSMNk588.exe'
}

$version = "v0.0.4"

# https://stackoverflow.com/a/19853757
mkdir $nn_bin -ErrorAction SilentlyContinue

Write-Output "Downloading nn $version..."
Write-Output $url
# https://stackoverflow.com/a/41618979
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $url -OutFile "$nn_bin\nn.exe"
Write-Output "Download complete"

Write-Output "Adding path..."
$user_path = [Environment]::GetEnvironmentVariable('path', 'user');
if (!$user_path.Contains($nn_bin)) {
  [Environment]::SetEnvironmentVariable('path', "$nn_bin;$user_path", 'user');
}
$user_path = [Environment]::GetEnvironmentVariable('path', 'user');
if (!$user_path.Contains($nn_current)) {
  [Environment]::SetEnvironmentVariable('path', "$nn_current;$user_path", 'user');
}

Write-Output "Please reopen your shell to activate nn"
Write-Output ""
Write-Output "If something went wrong please submit an issue:"
Write-Output "https://github.com/pd4d10/nn/issues/new"
Write-Output ""

# https://stackoverflow.com/a/24621106
# Read-Host -Prompt "Press Enter to exit"
