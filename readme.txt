
POS JS:

1. Go to pos/ folder
2. run NPM Install
3. run build as usual point the automated build studio here


POS cefsharp

1. Open POS.sln
2. Build solution, this should also install nuget package of cefsharp
3. Build output is in trunk/DLL/ folder


When in debug, cesharp exe application will look for ../pos/debug/desktop.html

When in prod/release, cesharp exe application will look for POS/WebDesktop/desktop.html