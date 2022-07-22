/*###########################################################################
# Fake_update.js                                                            #
# Author: Judge2020                                                         #
# Edited by: Coderdude112                                                   #
# This script will show a fake update in fullscreen mode                    #
# PREREQUISTES:                                                             #
# Enable the keyboard on your P4wnP1                                        #
# Select a URL from the list below and set it to the variable fake_update   #
###########################################################################*/

/* Fake update URLs
http://fakeupdate.net/vista/    // Windows Vista update
http://fakeupdate.net/xp/       // Windows XP update
http://fakeupdate.net/win7/     // Windows 7 update
http://fakeupdate.net/win8/     // Windows 8 update
http://fakeupdate.net/win10ue/  // Windows 10 update
http://fakeupdate.net/win10/    // Windows 10 install
http://fakeupdate.net/apple/    // OSX update
http://fakeupdate.net/steam/    // Steam OS update
*/

// Set the keyboard layout and speed
layout('de');   // Set keyboard layout to DE
typingSpeed(0,0);   // Sets the typing speed to super super fast

// Define all variables, arrays, ect
var delay_time = 5      // The time to wait before executing the attack in seconds
var ready = "False"     // Used to make sure that the attack is ready to be executed
var fake_update = "http://fakeupdate.net/win10ue/"    // The URL to open in fullscreen mode

function attack() {
    press("GUI r");
    delay(500);
    type("iexplore -k " + fake_update + "\n");  // Open the fake update website in fullscreen mode
}
function check_if_ready() {
    while (ready = "False") {
        press("SCROLL");    // Press the 'SCROLL LOCK' button
        result = waitLED(SCROLL,10) // Wait to see if the 'SCROLL LOCK' has changed for 10ms

        if (result.SCROLL) {    // The 'SCROLL LOCK' has changed so we must be connected and ready
            ready = "True"; // Stop the while loop
            break;
        }
    }
}

delay(delay_time * 100);
check_if_ready();
attack();
