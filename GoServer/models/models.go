package models

// AlarmData はアラームデータのJSON構造を表す
type AlarmData struct {
	BaseMusic string  `json:"base-music"`
	Pitch     float64 `json:"pitch"`
	Speed     float64 `json:"speed"`
	FileName  string  `json:"file-name"`
}

// AlarmDataResponse はアラームデータのレスポンス構造を表す
type AlarmDataResponse struct {
	BaseMusic string  `json:"base-music"`
	Pitch     float64 `json:"pitch"`
	Speed     float64 `json:"speed"`
	Audio     string  `json:"audio,omitempty"` // base64エンコードされた音声データ
}
