// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod device_info;
use device_info::DeviceInfo;
use tauri::command;
#[allow(unused_imports)]
use tauri::Manager;
use tauri_plugin_sql::{Builder as SqlPluginBuilder, Migration, MigrationKind};
use tauri_plugin_clipboard_manager;
#[command]
fn get_device_info() -> DeviceInfo {
    DeviceInfo::get_device_info()
}

#[tauri::command]
fn hide_taskbar_icon(_app_handle: tauri::AppHandle) {
    #[cfg(target_os = "macos")]
    let _ = _app_handle.set_activation_policy(tauri::ActivationPolicy::Accessory);
    // Hide from taskbar
}

#[tauri::command]
fn show_taskbar_icon(_app_handle: tauri::AppHandle) {
    #[cfg(target_os = "macos")]
    let _ = _app_handle.set_activation_policy(tauri::ActivationPolicy::Regular);
    // Restore to default
}

fn main() {

    let migrations = vec![
        Migration {
            version: 1,
            description: "initial_schema_setup",
            sql: "
                CREATE TABLE IF NOT EXISTS app_icons (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    appName TEXT NOT NULL, -- Name of the application (WhatsApp Business)
                    packageName TEXT NOT NULL, -- Package name of the application (com.whatsapp.w4b)
                    packageVersion TEXT NOT NULL,
                    appIconBase64 TEXT NOT NULL,
                    updatedAt INTEGER DEFAULT (strftime('%s', 'now')),
                    UNIQUE(packageName, packageVersion)
                );
                
                CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT,
                    isGroup INTEGER NOT NULL DEFAULT 0,
                    groupKey TEXT,
                    actions TEXT, 
                    iconId INTEGER NOT NULL,
                    postTime INTEGER NOT NULL,
                    FOREIGN KEY (iconId) REFERENCES app_icons(id) ON DELETE CASCADE
                );
                
                CREATE INDEX IF NOT EXISTS idx_notifications_iconId ON notifications(iconId);
                
                CREATE TABLE IF NOT EXISTS settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key TEXT NOT NULL UNIQUE,
                    value TEXT NOT NULL
                );
                
                CREATE TABLE IF NOT EXISTS chat(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    content TEXT NOT NULL,
                    sender INTEGER NOT NULL,
                    contentType INTEGER NOT NULL, -- 0: Text, 1: Image, 2: Video, 3: Audio, 4: File
                    filePath TEXT,
                    timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
                );

                CREATE INDEX IF NOT EXISTS idx_chat_timestamp ON chat(timestamp);
                
                CREATE TABLE IF NOT EXISTS contacts(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    firstName TEXT NOT NULL,
                    lastName TEXT,
                    phoneNumber TEXT NOT NULL,
                    email TEXT,
                    company TEXT,
                    dob TEXT,
                    address TEXT,
                    notes TEXT,
                    createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
                );

                CREATE TABLE IF NOT EXISTS contact_photos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    contactId INTEGER NOT NULL,
                    photoBase64 TEXT NOT NULL,
                    FOREIGN KEY (contactId) REFERENCES contacts(id) ON DELETE CASCADE
                );

                CREATE INDEX IF NOT EXISTS idx_contact_photos_contactId ON contact_photos(contactId);
                
                CREATE TABLE IF NOT EXISTS messages(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    phoneNumber TEXT NOT NULL,
                    contactName TEXT NOT NULL, -- Name of the contact or group
                    content TEXT NOT NULL,
                    contentType INTEGER NOT NULL, -- 0: Text, 1: Image, 2: Video, 3: Audio, 4: File
                    sender INTEGER NOT NULL,
                    status INTEGER NOT NULL DEFAULT 0, -- 0: Sent, 1: Delivered, 2: Seen
                    isRead INTEGER NOT NULL DEFAULT 0, -- For Syncing the read status back to Android
                    simSlot INTEGER NOT NULL DEFAULT 0,
                    threadId INTEGER NOT NULL, -- Thread ID for grouping messages
                    timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
                );

                CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
                CREATE INDEX IF NOT EXISTS idx_messages_phoneNumber ON messages(phoneNumber);
                
                CREATE TABLE IF NOT EXISTS call_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    phoneNumber TEXT NOT NULL,
                    contactName TEXT, -- Name of the contact or group
                    callType TEXT NOT NULL, -- 'incoming', 'outgoing', 'missed'
                    duration INTEGER NOT NULL DEFAULT 0, -- Duration in seconds
                    simSlot INTEGER NOT NULL DEFAULT 0,
                    isRead INTEGER,  -- For Syncing the read status back to Android
                    isNew INTEGER NOT NULL DEFAULT 0,   -- Only used for missed calls
                    timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
                );

                CREATE INDEX IF NOT EXISTS idx_call_logs_phoneNumber ON call_logs(phoneNumber);

                CREATE TABLE IF NOT EXISTS gallery (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    mediaId TEXT NOT NULL,                -- Unique ID from Android's MediaStore
                    fileName TEXT NOT NULL,
                    filePath TEXT NOT NULL,              -- Relative path or Android URI
                    mediaType TEXT CHECK(mediaType IN ('image', 'video')) DEFAULT 'image', -- Type of media
                    mimeType TEXT NOT NULL,              -- jpeg, mp4 etc.
                    size INTEGER NOT NULL,               -- File size in bytes
                    width INTEGER,                       -- Media width (for images/videos)
                    height INTEGER,                      -- Media height
                    duration INTEGER DEFAULT 0,          -- Video duration in seconds (0 for images)
                    dateTaken INTEGER NOT NULL,          -- Epoch time (when photo was taken)
                    dateModified INTEGER,                -- Epoch time (last modified)
                    isFavorite INTEGER DEFAULT 0,        -- Marked favorite in gallery
                    synced INTEGER DEFAULT 0             -- 0 = not synced, 1 = synced
                );

                CREATE INDEX IF NOT EXISTS idx_gallery_mediaId ON gallery(mediaId);

                CREATE TABLE IF NOT EXISTS gallery_thumbnails (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    galleryId INTEGER NOT NULL,
                    thumbnailBase64 TEXT NOT NULL,
                    FOREIGN KEY (galleryId) REFERENCES gallery(id) ON DELETE CASCADE
                );

                CREATE INDEX IF NOT EXISTS idx_gallery_thumbnails_galleryId ON gallery_thumbnails(galleryId);

            ",
            kind: MigrationKind::Up,
        },
    ];

    // app_lib::run();
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(
            SqlPluginBuilder::default()
                .add_migrations("sqlite:connectify.db", migrations)
                .build(),
        )
        .setup(|app| {
            #[cfg(desktop)]
            {
                use tauri_plugin_autostart::MacosLauncher;
                // use tauri_plugin_autostart::ManagerExt;
                // use tauri_plugin_notification::NotificationExt;

                // Notification
                // app.notification()
                //     .builder()
                //     .title("Tauri")
                //     .body("Tauri is awesome")
                //     .show()
                //     .unwrap();

                // Autostart on Login
                let _ = app.handle().plugin(tauri_plugin_autostart::init(
                    MacosLauncher::LaunchAgent,
                    None,
                ));

                // #[cfg(target_os = "windows")]
                // {
                //     let window = app.get_webview_window("main").unwrap();
                //     let _ = window.set_decorations(false); // Hide title bar on Windows
                // }

                // Get the autostart manager
                // let autostart_manager = app.autolaunch();
                // // Enable autostart
                // let _ = autostart_manager.enable();
                // // Check enable state
                // println!(
                //     "registered for autostart? {}",
                //     autostart_manager.is_enabled().unwrap()
                // );
                // Disable autostart
                // let _ = autostart_manager.disable();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_device_info,
            hide_taskbar_icon,
            show_taskbar_icon
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
