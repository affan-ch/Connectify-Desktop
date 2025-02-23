// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod device_info;
use device_info::DeviceInfo;
use tauri::command;

#[command]
fn get_device_info() -> DeviceInfo {
    DeviceInfo::get_device_info()
}

#[tauri::command]
fn hide_taskbar_icon(_app_handle: tauri::AppHandle) {
    #[cfg(target_os = "macos")]
    let _ = _app_handle.set_activation_policy(tauri::ActivationPolicy::Accessory); // Hide from taskbar
}

#[tauri::command]
fn show_taskbar_icon(_app_handle: tauri::AppHandle) {
    #[cfg(target_os = "macos")]
    let _ = _app_handle.set_activation_policy(tauri::ActivationPolicy::Regular); // Restore to default
}


fn main() {
    // app_lib::run();
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            #[cfg(desktop)]
            {
                use tauri_plugin_autostart::MacosLauncher;
                use tauri_plugin_autostart::ManagerExt;
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
                    Some(vec!["--flag1", "--flag2"]),
                ));

                // Get the autostart manager
                let autostart_manager = app.autolaunch();
                // Enable autostart
                let _ = autostart_manager.enable();
                // Check enable state
                println!(
                    "registered for autostart? {}",
                    autostart_manager.is_enabled().unwrap()
                );
                // Disable autostart
                // let _ = autostart_manager.disable();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_device_info, hide_taskbar_icon, show_taskbar_icon])

        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
