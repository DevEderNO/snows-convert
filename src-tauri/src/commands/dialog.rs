use tauri_plugin_dialog::DialogExt;
use tauri::AppHandle;

#[tauri::command]
pub async fn pick_video_file(app: AppHandle) -> Result<Option<String>, String> {
    let file = app
        .dialog()
        .file()
        .add_filter("Vídeos MP4", &["mp4", "MP4"])
        .set_title("Selecionar vídeo MP4")
        .blocking_pick_file();

    match file {
        Some(f) => match f.as_path() {
            Some(p) => Ok(Some(p.to_string_lossy().to_string())),
            None => Ok(None),
        },
        None => Ok(None),
    }
}

#[tauri::command]
pub async fn pick_output_directory(app: AppHandle) -> Result<Option<String>, String> {
    let dir = app
        .dialog()
        .file()
        .set_title("Selecionar diretório de saída")
        .blocking_pick_folder();

    match dir {
        Some(d) => match d.as_path() {
            Some(p) => Ok(Some(p.to_string_lossy().to_string())),
            None => Ok(None),
        },
        None => Ok(None),
    }
}
