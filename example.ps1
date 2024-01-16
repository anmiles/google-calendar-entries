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

Write-Host "Logging in..."
node ./dist/login.js
$result = Decode866 (node ./dist/index.js)

Write-Host "Processing..."
$all_events = $result | ConvertFrom-Json
$events = $all_events | ? { $_.calendar -and $_.calendar.accessRole -ne "reader" -and (!$calendars -or $calendars.Contains($_.calendar.summary)) -and $_.status -eq "confirmed" }

$events | % {
	$_ | Add-Member -MemberType NoteProperty -Name dateTime -Value ""
	if ("dateTime" -in $_.start.PSobject.Properties.Name) { $_.dateTime = [DateTime]::Parse($_.start.dateTime) }
	if ("date" -in $_.start.PSobject.Properties.Name) { $_.dateTime = [DateTime]::Parse($_.start.date) }
}

$monday = [DateTime]::Today.AddDays(-[DateTime]::Today.AddDays(-1).DayOfWeek.value__)

$untilThisWeek = $events | ? { $_.dateTime -lt $monday }
$untilNextWeek = $events | ? { $_.dateTime -lt $monday.AddDays(7) }

Write-Host "Events until next week: $($untilNextWeek.Length)" -ForegroundColor Yellow

if ($untilThisWeek.length) {
	Write-Host "Events until this week:" -ForegroundColor Yellow
	$events | ? { $_.dateTime -lt $monday } | % { Write-Host "$($_.dateTime.ToString()) $($_.summary) ($($_.calendar.summary))" }
}

Write-Host "Done!"
