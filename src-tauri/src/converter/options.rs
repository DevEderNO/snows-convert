use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversionOptions {
    pub fps: u32,
    pub width: u32,
    pub quality: QualityPreset,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum QualityPreset {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ConversionType {
    Gif,
    Webp,
    Apng,
}

impl Default for ConversionOptions {
    fn default() -> Self {
        Self {
            fps: 15,
            width: 480,
            quality: QualityPreset::High,
        }
    }
}

impl QualityPreset {
    /// Returns the dither algorithm based on quality
    pub fn dither_algo(&self) -> &str {
        match self {
            QualityPreset::Low => "none",
            QualityPreset::Medium => "bayer:bayer_scale=3",
            QualityPreset::High => "sierra2_4a",
        }
    }

    /// Returns max_colors for paletteuse
    pub fn max_colors(&self) -> u32 {
        match self {
            QualityPreset::Low => 64,
            QualityPreset::Medium => 128,
            QualityPreset::High => 256,
        }
    }
}
