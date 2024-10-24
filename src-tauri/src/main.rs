// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod device_info;
use device_info::DeviceInfo;
use tauri::command;

#[command]
fn get_device_info() -> DeviceInfo {
    DeviceInfo::get_device_info()
}

fn main() {
  // app_lib::run();
  tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_device_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
