use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgressPayload {
    pub percentage: f64,
    pub status: String,
    pub message: String,
}
