use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Serialize, Deserialize)]
pub enum AppError {
    FfmpegNotFound(String),
    ConversionFailed(String),
    InvalidInput(String),
    IoError(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::FfmpegNotFound(msg) => write!(f, "FFmpeg não encontrado: {}", msg),
            AppError::ConversionFailed(msg) => write!(f, "Falha na conversão: {}", msg),
            AppError::InvalidInput(msg) => write!(f, "Entrada inválida: {}", msg),
            AppError::IoError(msg) => write!(f, "Erro de I/O: {}", msg),
        }
    }
}

impl std::error::Error for AppError {}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::IoError(err.to_string())
    }
}

impl From<AppError> for String {
    fn from(err: AppError) -> String {
        err.to_string()
    }
}
