<#
.SYNOPSIS
    Get counts of past events
.PARAMETER calendars
    List of calendars to get events from
.EXAMPLE
    ./past_events.ps1 Личный Мероприятия Задачи
#>

Param (
    [Parameter(ValueFromRemainingArguments = $true)][string[]]$calendars
)

Function Decode1251($text) {
	$bytes = [System.Text.Encoding]::GetEncoding(1251).GetBytes($text)
	return [System.Text.Encoding]::UTF8.GetString($bytes)
}

Function Decode866($text) {
	$bytes = [System.Text.Encoding]::GetEncoding(866).GetBytes($text)
	return [System.Text.Encoding]::UTF8.GetString($bytes)
}

Write-Host "Staring..."
Write-Host "Downloading..."
$result = Decode866 (node ./dist/index.js)

Write-Host "Processing..."
$all_events = $result | ConvertFrom-Json
$events = $all_events | ? { $_.calendar.accessRole -ne "reader" -and $calendars.Contains($_.calendar.summary) -and $_.status -eq "confirmed" }

$events | % {
	$_ | Add-Member -MemberType NoteProperty -Name dateTime -Value ""
	if ("dateTime" -in $_.start.PSobject.Properties.Name) { $_.dateTime = [DateTime]::Parse($_.start.dateTime) }
	if ("date" -in $_.start.PSobject.Properties.Name) { $_.dateTime = [DateTime]::Parse($_.start.date) }
}

$monday = [DateTime]::Today.AddDays(1 - [DateTime]::Today.DayOfWeek.value__)

Write-Host "Events until this week:"($events | ? { $_.dateTime -lt $monday }).Length -ForegroundColor Yellow
Write-Host "Events until next week:"($events | ? { $_.dateTime -lt $monday.AddDays(7) }).Length -ForegroundColor Yellow
Write-Host "Events until now:"($events | ? { $_.dateTime -lt [DateTime]::Now }).Length -ForegroundColor Yellow
Write-Host "Done!"
