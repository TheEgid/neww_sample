$start = Get-Date

$scriptPath = $script:MyInvocation.MyCommand.Path
$scriptParentDirectory = Split-Path $scriptPath -Parent
$scriptGrandParentDirectory = Split-Path $scriptParentDirectory -Parent
$folderName = Split-Path $scriptGrandParentDirectory -Leaf

$src = $scriptGrandParentDirectory + "\"
$dst = [Environment]::GetFolderPath("Desktop") + "\" + $folderName + "\"

$esx1 = $src + "fullstack\node_modules"
$esx2 = $src + ".git"
$esx3 = $src + ".vscode"
$esx4 = $src + "fullstack\.next"
$esx5 = $src + "fullstack\build"

robocopy $src $dst /MT:12 /MIR /XA:SH /XD $esx1 /XD $esx2 /XD $esx3 /XD $esx4 /XD $esx5 /XJD /NFL /NDL


$end = Get-Date
$elapsed = $end - $start
Write-Output $dst, "Script execution time: $($elapsed.TotalSeconds) seconds"
