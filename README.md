# P4wnP1 A.L.O.A. Payloads

I've built my P4wnP1 after beboxos' version with a navigable OLED display. You can find all resources regarding that install [here](https://github.com/beboxos/P4wnP1_ALOA_OLED_MENU_V2).

+ Currently all payloads target Windows OS. This might change later.
+ All of my payloads use the **DE** (German) keyboard layout. Be sure to change this in settings if your target does not operate on a German keyboard layout.
+ All processes in the scripts are explained to some basic extent within the source code.
+ Global settings are placed at the top of the source code, so you can easily edit the script to your liking/environment.

### How to use the payloads

+ Enable keyboard and (in some cases) USB mass storage capability on your P4wnP1. Disable mouse emulation.
+ HIDScripts (the .js files) should be placed in `/usr/local/P4wnP1/HIDScripts`, or can just be pasted into to the "HIDScripts" section of the P4wnP1 web interface.
+ For the extraction of browser-based data (hitory, bookmarks, donwload logs, etc.), download `browser_booty.exe` and copy the file to `/tools/` on your P4wnP1 mass storage device.
+ If internet access is required at any point and you don't know how to proceed, [this video](https://youtu.be/QEWaIoal5qU) explains the connection process fairly well.
+ Since some extractions to P4wnP1 mass storage might require more space than the default image has to offer, it can make sense to create a new image with more space. This can be achieved by doing the following: 
```
cd /usr/local/P4wnP1/ums/flashdrive
sudo ./genimg -i -o 2GB -s 2048 -l TEMPUSB
``` 

<br></br>

:x: **I assume ZERO responsibility for what you do with these. My sole intention is to demo keystroke injection.** :x:
