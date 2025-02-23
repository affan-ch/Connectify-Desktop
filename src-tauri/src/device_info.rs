#[cfg(any(target_os = "macos", target_os = "linux"))]
use regex::Regex;
use serde::Serialize;
use std::process::Command;

#[derive(Serialize)]
pub struct DeviceInfo {
    pub device_type: String,
    pub os_name: String,
    pub os_version: String,
    pub model: String,
    pub device_name: String,
    pub uuid: String,
    pub serial_number: String,
    pub board_id: String,
    pub timezone: String,
    pub manufacturer: String,
}

impl DeviceInfo {
    pub fn get_device_info() -> DeviceInfo {
        // Check the target OS and call the appropriate function
        #[cfg(target_os = "macos")]
        return DeviceInfo::get_macos_system_info();

        #[cfg(target_os = "linux")]
        return DeviceInfo::get_linux_system_info();

        #[cfg(target_os = "windows")]
        return DeviceInfo::get_windows_system_info();
    }

    #[cfg(target_os = "macos")]
    fn get_macos_system_info() -> DeviceInfo {
        let device_type = "desktop".to_string();
        let os_name = "macOS".to_string();
        let os_version = get_output_of_command("sw_vers", &["-productVersion"]);
        let device_name = get_output_of_command("scutil", &["--get", "ComputerName"]);
        let timezone = get_output_of_command("date", &["+%Z"]);
        let ioreg_output = get_output_of_command("ioreg", &["-l"]);

        let uuid = extract_field(&ioreg_output, r#""IOPlatformUUID"\s*=\s*"([A-F0-9\-]+)""#);
        let serial_number =
            extract_field(&ioreg_output, r#""IOPlatformSerialNumber"\s*=\s*"([^"]+)""#);
        let model = extract_field(&ioreg_output, r#""model"\s*=\s*<"([^"]+)">"#);
        let board_id = extract_field(&ioreg_output, r#""board-id"\s*=\s*<"([^"]+)">"#);
        let manufacturer = extract_field(&ioreg_output, r#""manufacturer"\s*=\s*<"([^"]+)">"#);

        DeviceInfo {
            device_type,
            os_name,
            os_version,
            model,
            device_name,
            uuid,
            serial_number,
            board_id,
            timezone,
            manufacturer,
        }
    }

    #[cfg(target_os = "linux")]
    fn get_linux_system_info() -> DeviceInfo {
        let device_type = "desktop".to_string();
        let os_name = "Linux".to_string(); // Assuming this is Linux

        // Get the full output from lsb_release and then extract the version
        let os_version_output = get_output_of_command("lsb_release", &["-d"]);
        let os_version = extract_field(&os_version_output, r#"Description:\s*(.*)"#)
            .trim()
            .to_string();

        let device_name = get_output_of_command("hostname", &[]);
        let timezone = get_output_of_command("cat", &["/etc/timezone"]);

        let cpu_info = get_output_of_command("cat", &["/proc/cpuinfo"]);
        let model = extract_field(&cpu_info, r#"model name\s*:\s*(.*)"#);
        let uuid = get_output_of_command("cat", &["/sys/class/dmi/id/product_uuid"]);
        let serial_number = get_output_of_command("cat", &["/sys/class/dmi/id/product_serial"]);
        let board_id = get_output_of_command("cat", &["/sys/class/dmi/id/board_serial"]);
        let manufacturer = get_output_of_command("cat", &["/sys/class/dmi/id/sys_vendor"]);

        DeviceInfo {
            device_type,
            os_name,
            os_version,
            model,
            device_name,
            uuid,
            serial_number,
            board_id,
            timezone,
            manufacturer,
        }
    }

    #[cfg(target_os = "windows")]
    fn get_windows_system_info() -> DeviceInfo {
        let device_type = "desktop".to_string();
        let os_name = "Windows".to_string();

        let os_version = get_output_of_command("wmic", &["os", "get", "Caption"]);
        let device_name = get_output_of_command("hostname", &[]);
        let timezone = get_output_of_command("wmic", &["timezone", "get", "Description"]);
        let model = get_output_of_command("wmic", &["computersystem", "get", "Model"]);
        let uuid = get_output_of_command("wmic", &["csproduct", "get", "UUID"]);
        let serial_number = get_output_of_command("wmic", &["bios", "get", "SerialNumber"]);
        let board_id = get_output_of_command("wmic", &["baseboard", "get", "SerialNumber"]);
        let manufacturer = get_output_of_command("wmic", &["computersystem", "get", "Manufacturer"]);

        DeviceInfo {
            device_type,
            os_name,
            os_version,
            model,
            device_name,
            uuid,
            serial_number,
            board_id,
            timezone,
            manufacturer,
        }
    }
}

fn get_output_of_command(cmd: &str, args: &[&str]) -> String {
    let output = Command::new(cmd)
        .args(args)
        .output()
        .expect("Failed to execute command");

    String::from_utf8_lossy(&output.stdout)
        .to_string()
        .trim()
        .to_string()
}

#[cfg(any(target_os = "macos", target_os = "linux"))]
fn extract_field(output: &str, pattern: &str) -> String {
    let re = Regex::new(pattern).unwrap();
    if let Some(captures) = re.captures(output) {
        captures
            .get(1)
            .map_or("Unknown".to_string(), |m| m.as_str().to_string())
    } else {
        "Unknown".to_string()
    }
}
