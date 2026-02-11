mod commands;
mod converter;
mod error;
mod events;

use commands::convert::{check_ffmpeg, start_conversion};
use commands::dialog::{pick_output_directory, pick_video_file};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            start_conversion,
            check_ffmpeg,
            pick_video_file,
            pick_output_directory,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
