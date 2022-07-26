/*##########################################################\
# open_webpage.js                                           #
#   Opens a webpage in MS Edge browser in fullscreen mode   #
#   Author: NightRang3r on GitHub                           #
#   Edited by: chriskalv                                    #
#							                                              #
# PREREQUISTES:                                             #
# - Enable keyboard emulation on your P4wnP1                #
###########################################################*/

// Set the keyboard layout and speed
layout('de');          // Set keyboard layout to DE (German)
typingSpeed(0,0);      // Sets the typing speed to max. fast

// Definition of other variables, arrays, ...
var delay_time = 5     // The time to wait before executing the attack in seconds
var ready = "False"    // Used to make sure that the attack is ready to be executed

function attack() {
  // Open webpage in fullscreen mode via 'run command'
    press("GUI r");
    delay(500);
    type("msedge --start-fullscreen https://www.youtube.com/watch?v=dQw4w9WgXcQ\n");   // rick-rolled
}
function check_if_ready() {
    while (ready = "False") {
        press("SCROLL");               // Press the 'SCROLL LOCK' button
        result = waitLED(SCROLL,10)    // Wait to see if the 'SCROLL LOCK' has changed for 10ms

        if (result.SCROLL) {           // The 'SCROLL LOCK' has changed so we must be connected and ready
            ready = "True";            // Stop the while loop
            break;
        }
    }
}

delay(delay_time * 100);
check_if_ready();
attack();
