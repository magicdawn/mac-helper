```applescript
-- 获取前台 App 名称
tell application "System Events"
  set ret to name of first application process whose frontmost is true
end tell
```

```applescript
-- 获取前台 App bundle id
tell application "System Events"
  set ret to bundle identifier of first application process whose frontmost is true
end tell
```

```applescript
-- 获取前台 App 路径
tell application "System Events"
  set ret to posix path of application file of first application process whose frontmost is true
end tell
```
