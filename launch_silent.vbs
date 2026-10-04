Set WshShell = CreateObject("WScript.Shell")
cmd = "cmd.exe /c " & Chr(34) & Chr(34) & "C:\Program Files\nodejs\node.exe" & Chr(34) & " " & Chr(34) & "C:\Users\Mr Barry\Documents\Creation_Agent\server.js" & Chr(34) & " > " & Chr(34) & "C:\Users\Mr Barry\Documents\Creation_Agent\server.log" & Chr(34) & " 2>&1" & Chr(34)
WshShell.Run cmd, 0, false
