$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$mysqlBinary = 'C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqld.exe'
if (-not (Test-Path -LiteralPath $mysqlBinary)) { throw 'Update the MySQL binary path in this script.' }
if (-not (Test-NetConnection 127.0.0.1 -Port 3307 -InformationLevel Quiet -WarningAction SilentlyContinue)) {
    Start-Process -FilePath $mysqlBinary -ArgumentList '--no-defaults', ('--datadir="' + (Join-Path $projectRoot '.local\mysql') + '"'), '--port=3307', '--bind-address=127.0.0.1', '--mysqlx=OFF', '--console' -WindowStyle Hidden
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        if (Test-NetConnection 127.0.0.1 -Port 3307 -InformationLevel Quiet -WarningAction SilentlyContinue) { break }
        Start-Sleep -Milliseconds 500
    }
}
php artisan serve --host=127.0.0.1 --port=8000
