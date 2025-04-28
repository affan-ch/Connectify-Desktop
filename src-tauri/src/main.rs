// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod device_info;
use device_info::DeviceInfo;
use tauri::command;
#[allow(unused_imports)]
use tauri::Manager;
use tauri_plugin_sql::{Builder as SqlPluginBuilder, Migration, MigrationKind};

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
                CREATE TABLE IF NOT EXISTS icons (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    packageName TEXT NOT NULL,
                    packageVersion TEXT NOT NULL,
                    appIconBase64 TEXT NOT NULL
                );
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
