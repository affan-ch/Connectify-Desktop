// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod device_info;
use device_info::DeviceInfo;
use tauri::command;
use tauri::WindowEvent;
use tauri::Manager;

#[command]
fn get_device_info() -> DeviceInfo {
    DeviceInfo::get_device_info()
}

fn main() {
    // app_lib::run();
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .on_window_event(|_window, event| {
            match event {
                WindowEvent::CloseRequested { api, .. } => {
                    // window.hide().unwrap();
                    // window.minimize().unwrap();
                    api.prevent_close();
                }
                
                _ => {}
            }
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            #[cfg(desktop)]
            {
                use tauri_plugin_autostart::MacosLauncher;
                use tauri_plugin_autostart::ManagerExt;
                use tauri_plugin_notification::NotificationExt;
                use tauri::menu::{Menu, MenuItem};
                use tauri::tray::TrayIconBuilder;

                // let main_window = app.get_webview_window("main");

                let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
                let menu = Menu::with_items(app, &[&quit_i])?;

                let _tray = TrayIconBuilder::new()
                    .icon(app.default_window_icon().unwrap().clone())
                    .menu(&menu)
                    .menu_on_left_click(true)
                    .build(app)?;

                // Notification
                app.notification()
                    .builder()
                    .title("Tauri")
                    .body("Tauri is awesome")
                    .show()
                    .unwrap();

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
        .invoke_handler(tauri::generate_handler![get_device_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
