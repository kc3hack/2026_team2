package models

// AlarmData はアラームデータのJSON構造を表す
type AlarmData struct {
	BaseMusic string `json:"base-music"`
	Pitch     int    `json:"pitch"`
	Speed     int    `json:"speed"`
	FileName  string `json:"file-name"`
}

// AlarmDataResponse はアラームデータのレスポンス構造を表す
type AlarmDataResponse struct {
	BaseMusic string `json:"base-music"`
	Pitch     int    `json:"pitch"`
	Speed     int    `json:"speed"`
	Audio     string `json:"audio,omitempty"` // base64エンコードされた音声データ
}
